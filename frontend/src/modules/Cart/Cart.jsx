import React, { useState } from 'react';
// Upewnij się, że importujesz instancję api, którą stworzyliśmy wcześniej (tę z interceptorem tokena)
import api from '../../api'; 

const Cart = ({ items, onClearCart }) => {
  const [status, setStatus] = useState(null); // 'success', 'error' lub null

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setStatus(null);

    // Przygotowujemy dane tak, jak chce backend (tylko lista ID i ilości)
    // Backend sam sobie weźmie ID usera i sklepu z tokena.
    const orderPayload = {
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      // Strzelamy do endpointu, który stworzyliśmy w backendzie
      await api.post('/orders/', orderPayload);
      
      setStatus('success');
      onClearCart(); // Czyścimy koszyk po udanym zakupie
      
      // Ukryj komunikat sukcesu po 5 sekundach
      setTimeout(() => setStatus(null), 5000); 
    } catch (error) {
      console.error("Błąd zamówienia:", error);
      setStatus('error');
    }
  };

  // Jeśli koszyk jest pusty i nie ma komunikatu o sukcesie, wyświetl info
  if (items.length === 0 && status !== 'success') {
    return <div className="text-muted text-center py-3">Twój koszyk jest pusty.</div>;
  }

  return (
    <div>
      {/* Komunikaty */}
      {status === 'success' && (
        <div className="alert alert-success">
          ✅ Zamówienie przyjęte! Sprawdź tabelę STORE_ORDERS w bazie.
        </div>
      )}
      
      {status === 'error' && (
        <div className="alert alert-danger">
          ❌ Błąd zamówienia. Jesteś zalogowany? Masz uprawnienia?
        </div>
      )}

      {/* Lista produktów w koszyku */}
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
      
      {/* Suma */}
      <div className="d-flex justify-content-between fw-bold mb-3 px-2 border-top pt-2">
        <span>Suma:</span>
        <span>{total.toFixed(2)} PLN</span>
      </div>

      {/* Przyciski */}
      <div className="d-grid gap-2">
        <button 
            onClick={handleCheckout} 
            className="btn btn-success"
            disabled={items.length === 0}
        >
            💰 Zapłać i Zamów
        </button>
        <button onClick={onClearCart} className="btn btn-outline-secondary btn-sm">
            Wyczyść koszyk
        </button>
      </div>
    </div>
  );
};

export default Cart;