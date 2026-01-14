import React, { useState } from 'react';
import api from '../../api'; 

// Dodajemy prop 'tenantId' (potrzebny tylko dla Gościa)
const Cart = ({ items, onClearCart, tenantId }) => {
  const [status, setStatus] = useState(null); // 'success', 'error'
  const [guestEmail, setGuestEmail] = useState(""); // Nowe pole dla gościa
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isGuest = !localStorage.getItem('token'); // Sprawdzamy, czy to gość

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setStatus(null);
    setLoading(true);

    // Wspólny payload dla obu przypadków (lista produktów)
    const itemsPayload = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));

    try {
      if (!isGuest) {
        // --- SCENARIUSZ 1: WŁAŚCICIEL (ZALOGOWANY) ---
        // To jest Twoja stara logika
        await api.post('/orders/', { items: itemsPayload });
      } else {
        // --- SCENARIUSZ 2: GOŚĆ (NOWA LOGIKA) ---
        
        // Walidacja dla gościa
        if (!guestEmail.includes('@')) {
            alert("Podaj poprawny email!");
            setLoading(false);
            return;
        }
        if (!tenantId) {
            console.error("Brak ID sklepu w Cart.jsx");
            setStatus('error');
            setLoading(false);
            return;
        }

        // Strzał do nowego endpointu
        await api.post('/orders/guest', {
            email: guestEmail,
            items: itemsPayload,
            tenant_id: tenantId
        });
      }

      // --- WSPÓLNY SUKCES ---
      setStatus('success');
      onClearCart();
      setGuestEmail(""); 
      setTimeout(() => setStatus(null), 5000); 

    } catch (error) {
      console.error("Błąd zamówienia:", error);
      setStatus('error');
    } finally {
        setLoading(false);
    }
  };

  if (items.length === 0 && status !== 'success') {
    return <div className="text-muted text-center py-3">Twój koszyk jest pusty.</div>;
  }

  return (
    <div>
      {/* --- KOMUNIKATY --- */}
      {status === 'success' && (
        <div className="alert alert-success">
          ✅ {isGuest ? "Zamówienie wysłane! Sprawdź email." : "Zamówienie przyjęte do bazy!"}
        </div>
      )}
      
      {status === 'error' && (
        <div className="alert alert-danger">
          ❌ Błąd zamówienia. Spróbuj ponownie.
        </div>
      )}

      {/* --- LISTA PRODUKTÓW --- */}
      <ul className="list-group mb-3">
        {items.map((item) => (
          <li key={item.product_id} className="list-group-item d-flex justify-content-between lh-sm">
            <div>
              <h6 className="my-0">{item.name}</h6>
              <small className="text-muted">Ilość: {item.quantity}</small>
            </div>
            <span className="text-muted">{(item.price * item.quantity).toFixed(2)} zł</span>
          </li>
        ))}
      </ul>
      
      {/* --- SUMA --- */}
      <div className="d-flex justify-content-between fw-bold mb-3 px-2 border-top pt-2">
        <span>Suma:</span>
        <span>{total.toFixed(2)} PLN</span>
      </div>

      {/* --- POLE EMAIL (TYLKO DLA GOŚCIA) --- */}
      {isGuest && items.length > 0 && (
          <div className="mb-3">
              <label className="form-label small">Adres email (wymagane)</label>
              <input 
                type="email" 
                className="form-control form-control-sm" 
                placeholder="klient@przyklad.pl"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
          </div>
      )}

      {/* --- PRZYCISKI --- */}
      <div className="d-grid gap-2">
        <button 
            onClick={handleCheckout} 
            className="btn btn-success"
            disabled={items.length === 0 || loading}
        >
            {loading ? "Przetwarzanie..." : (isGuest ? "📨 Zamów jako Gość" : "💰 Zapłać i Zamów")}
        </button>
        
        <button onClick={onClearCart} className="btn btn-outline-secondary btn-sm">
            Wyczyść koszyk
        </button>
      </div>
    </div>
  );
};

export default Cart;