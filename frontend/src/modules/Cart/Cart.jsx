import React, { useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

const Cart = ({ items, onClearCart }) => {
  const [loading, setLoading] = useState(false);
  
  // Stan formularza
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    phone: ''
  });

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Obsługa wpisywania danych
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderPayload = {
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      first_name: formData.firstName,
      last_name: formData.lastName,
      address: formData.address,
      phone_number: formData.phone
    };

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // --- 1. ZALOGOWANY UŻYTKOWNIK ---
        await api.post('/orders/', orderPayload);
      } else {
        // --- 2. GOŚĆ ---
        // Gość musi podać email i tenant_id (bierzemy z pierwszego produktu)
        if (!formData.email) {
            alert("Podaj email!");
            setLoading(false);
            return;
        }
        await api.post('/orders/guest', {
          ...orderPayload,
          email: formData.email,
          tenant_id: items[0].tenant_id
        });
      }

      alert("🎉 Zamówienie złożone pomyślnie! Czekaj na potwierdzenie.");
      onClearCart();
      setShowForm(false); // Zamykamy formularz
    } catch (err) {
      console.error(err);
      alert("Błąd składania zamówienia: " + (err.response?.data?.detail || "Nieznany błąd"));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <div className="text-muted text-center py-3">Twój koszyk jest pusty.</div>;
  }

  // --- WIDOK FORMULARZA ZAMÓWIENIA ---
  if (showForm) {
    return (
        <div className="p-3 bg-light border rounded">
            <h5 className="mb-3">📝 Dane do dostawy</h5>
            <form onSubmit={handleOrderSubmit}>
                
                {/* Email pokazujemy tylko jeśli użytkownik NIE jest zalogowany */}
                {!localStorage.getItem('token') && (
                    <div className="mb-2">
                        <label className="small">Email</label>
                        <input type="email" name="email" required className="form-control form-control-sm" 
                            value={formData.email} onChange={handleChange} />
                    </div>
                )}

                <div className="row">
                    <div className="col-6 mb-2">
                        <label className="small">Imię</label>
                        <input type="text" name="firstName" required className="form-control form-control-sm"
                            value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div className="col-6 mb-2">
                        <label className="small">Nazwisko</label>
                        <input type="text" name="lastName" required className="form-control form-control-sm"
                            value={formData.lastName} onChange={handleChange} />
                    </div>
                </div>

                <div className="mb-2">
                    <label className="small">Adres (Ulica, nr, miasto, kod)</label>
                    <input type="text" name="address" required className="form-control form-control-sm"
                        value={formData.address} onChange={handleChange} />
                </div>

                <div className="mb-3">
                    <label className="small">Telefon</label>
                    <input type="text" name="phone" required className="form-control form-control-sm"
                        value={formData.phone} onChange={handleChange} />
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success w-100" disabled={loading}>
                        {loading ? "Wysyłanie..." : `Kupuję za ${totalPrice.toFixed(2)} PLN`}
                    </button>
                    <button type="button" className="btn btn-secondary w-100" onClick={() => setShowForm(false)}>
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
  }

  // --- WIDOK LISTY PRODUKTÓW (DOMYŚLNY) ---
  return (
    <div>
      <ul className="list-group mb-3">
        {items.map((item) => (
          <li key={item.product_id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{item.name}</div>
              <small className="text-muted">{item.quantity} szt. x {item.price.toFixed(2)}</small>
            </div>
            <span className="fw-bold">{(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Suma:</h5>
        <h4 className="text-primary">{totalPrice.toFixed(2)} PLN</h4>
      </div>

      <div className="d-grid gap-2">
        <button 
            className="btn btn-success" 
            onClick={() => setShowForm(true)} // Otwieramy formularz zamiast od razu kupować
        >
          Przejdź do dostawy 🚚
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={onClearCart}>
          Wyczyść koszyk
        </button>
      </div>
    </div>
  );
};

export default Cart;