import React, { useState } from 'react';
import api from '../../api';

// Dodajemy prop 'tenantId' (potrzebny tylko dla Gościa)
const Cart = ({ items, onClearCart, tenantId }) => {
  const [status, setStatus] = useState(null); // 'success', 'error'
  const [loading, setLoading] = useState(false);
  
  // --- STAN FORMULARZA ---
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    // ROZBICIE ADRESU NA CZĘŚCI:
    street: '',
    houseNumber: '',
    zipCode: '',
    city: ''
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isGuest = !localStorage.getItem('token'); 

  // Obsługa wpisywania danych
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault(); // Zapobiegamy przeładowaniu strony
    
    if (items.length === 0) return;
    setStatus(null);
    setLoading(true);

    // --- SKLEJANIE ADRESU DLA BACKENDU ---
    // Backend oczekuje jednego pola 'address', więc łączymy te 4 inputy w jeden napis.
    const combinedAddress = `${formData.street} ${formData.houseNumber}, ${formData.zipCode} ${formData.city}`;

    // Payload dla produktów
    const itemsPayload = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));

    // Główne dane zamówienia
    const orderPayload = {
      items: itemsPayload,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      address: combinedAddress // <-- Tutaj wysyłamy sklejony adres
    };

    try {
      if (!isGuest) {
        // --- 1. ZALOGOWANY WŁAŚCICIEL ---
        await api.post('/orders/', orderPayload);
      } else {
        // --- 2. GOŚĆ (KLIENT) ---
        if (!tenantId) {
            console.error("Brak ID sklepu w Cart.jsx");
            setStatus('error');
            setLoading(false);
            return;
        }

        await api.post('/orders/guest', {
          ...orderPayload,
          email: formData.email,
          tenant_id: tenantId
        });
      }

      // --- SUKCES ---
      setStatus('success');
      onClearCart();
      setShowForm(false); 
      // Reset formularza
      setFormData({
        email: '', firstName: '', lastName: '', phone: '',
        street: '', houseNumber: '', zipCode: '', city: ''
      });
      setTimeout(() => setStatus(null), 10000); 

    } catch (error) {
      console.error("Błąd zamówienia:", error);
      alert("Błąd: " + (error.response?.data?.detail || "Nieznany błąd"));
      setStatus('error');
    } finally {
        setLoading(false);
    }
  };

  if (items.length === 0 && status !== 'success') {
    return <div className="text-muted text-center py-3">Twój koszyk jest pusty.</div>;
  }

  // --- WIDOK 1: FORMULARZ DOSTAWY ---
  if (showForm) {
      return (
        <div className="p-1">
            <h5 className="mb-3 border-bottom pb-2">📦 Dane do wysyłki</h5>
            <form onSubmit={handleCheckout}>
                
                {/* Email tylko dla gościa */}
                {isGuest && (
                    <div className="mb-2">
                        <label className="small fw-bold text-muted">Email</label>
                        <input type="email" name="email" required className="form-control form-control-sm" 
                            placeholder="np. jan@kowalski.pl"
                            value={formData.email} onChange={handleChange} />
                    </div>
                )}

                {/* Imię i Nazwisko (w jednej linii) */}
                <div className="row g-2 mb-2">
                    <div className="col-6">
                        <label className="small fw-bold text-muted">Imię</label>
                        <input type="text" name="firstName" required className="form-control form-control-sm"
                            value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div className="col-6">
                        <label className="small fw-bold text-muted">Nazwisko</label>
                        <input type="text" name="lastName" required className="form-control form-control-sm"
                            value={formData.lastName} onChange={handleChange} />
                    </div>
                </div>

                {/* Ulica i Numer Domu */}
                <div className="row g-2 mb-2">
                    <div className="col-8">
                        <label className="small fw-bold text-muted">Ulica</label>
                        <input type="text" name="street" required className="form-control form-control-sm"
                            placeholder="np. Marszałkowska"
                            value={formData.street} onChange={handleChange} />
                    </div>
                    <div className="col-4">
                        <label className="small fw-bold text-muted">Nr domu/lok</label>
                        <input type="text" name="houseNumber" required className="form-control form-control-sm"
                            placeholder="np. 10/24"
                            value={formData.houseNumber} onChange={handleChange} />
                    </div>
                </div>

                {/* Kod Pocztowy i Miasto */}
                <div className="row g-2 mb-2">
                    <div className="col-4">
                        <label className="small fw-bold text-muted">Kod pocztowy</label>
                        <input type="text" name="zipCode" required className="form-control form-control-sm"
                            placeholder="00-000"
                            value={formData.zipCode} onChange={handleChange} />
                    </div>
                    <div className="col-8">
                        <label className="small fw-bold text-muted">Miejscowość</label>
                        <input type="text" name="city" required className="form-control form-control-sm"
                            value={formData.city} onChange={handleChange} />
                    </div>
                </div>

                {/* Telefon */}
                <div className="mb-3">
                    <label className="small fw-bold text-muted">Telefon</label>
                    <input type="text" name="phone" required className="form-control form-control-sm"
                        placeholder="np. 500 600 700"
                        value={formData.phone} onChange={handleChange} />
                </div>

                {/* Przyciski */}
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success fw-bold" disabled={loading}>
                        {loading ? "Przetwarzanie..." : `Zamawiam i płacę ${total.toFixed(2)} zł`}
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>
                        Wróć do koszyka
                    </button>
                </div>
            </form>
        </div>
      );
  }

  // --- WIDOK 2: LISTA PRODUKTÓW (DOMYŚLNY) ---
  return (
    <div>
      {/* Komunikat sukcesu/błędu */}
      {status === 'success' && (
        <div className="alert alert-success py-2 small mb-3">
          ✅ Zamówienie przyjęte! Sprawdź status.
        </div>
      )}
      
      {status === 'error' && (
        <div className="alert alert-danger py-2 small mb-3">
          ❌ Coś poszło nie tak.
        </div>
      )}

      {/* Lista */}
      <ul className="list-group list-group-flush mb-3">
        {items.map((item) => (
          <li key={item.product_id} className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
            <div>
              <div className="fw-bold small">{item.name}</div>
              <small className="text-muted">{item.quantity} szt. x {item.price.toFixed(2)}</small>
            </div>
            <span className="fw-bold small">{(item.price * item.quantity).toFixed(2)} zł</span>
          </li>
        ))}
      </ul>
      
      {/* Suma */}
      <div className="d-flex justify-content-between align-items-center mb-4 pt-2 border-top">
        <span className="text-muted">Do zapłaty:</span>
        <h4 className="text-primary fw-bold mb-0">{total.toFixed(2)} PLN</h4>
      </div>

      {/* Przyciski */}
      <div className="d-grid gap-2">
        <button 
            className="btn btn-primary rounded-pill fw-bold shadow-sm" 
            onClick={() => setShowForm(true)} 
            disabled={loading}
        >
          Przejdź do dostawy
        </button>
        <button className="btn btn-link text-muted btn-sm text-decoration-none" onClick={onClearCart}>
          Wyczyść koszyk
        </button>
      </div>
    </div>
  );
};

export default Cart;