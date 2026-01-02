import React, { useState } from 'react';
import apiClient from '../../api/client';

const Cart = ({ items, onClearCart }) => {
  const [status, setStatus] = useState(null); // 'success', 'error', 'loading'

  // Sumowanie wartości koszyka
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setStatus('loading');

    const orderPayload = {
      tenant_id: 1,      
      store_id: 1,       
      customer_email: "klient@example.com", // Na razie na sztywno
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await apiClient.post('/sales/orders/', orderPayload);
      
      console.log("Zamówienie złożone:", response.data);
      setStatus('success');
      onClearCart(); 
    } catch (error) {
      console.error("Błąd zamówienia:", error);
      const errorMsg = error.response?.data?.detail || "Wystąpił błąd podczas zamawiania.";
      setStatus(errorMsg);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', position: 'sticky', top: '20px' }}>
      <h2>Twój Koszyk</h2>
      
      {items.length === 0 ? (
        <p>Koszyk jest pusty.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.product_id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} (x{item.quantity})</span>
                <span>{(item.price * item.quantity).toFixed(2)} PLN</span>
              </li>
            ))}
          </ul>
          
          <div style={{ marginTop: '20px', borderTop: '2px solid #000', paddingTop: '10px', fontWeight: 'bold' }}>
            Suma: {totalAmount.toFixed(2)} PLN
          </div>

          <button 
            onClick={handleCheckout}
            disabled={status === 'loading'}
            style={{ 
              marginTop: '15px', 
              width: '100%', 
              padding: '15px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {status === 'loading' ? 'Przetwarzanie...' : 'KUPUJĘ I PŁACĘ'}
          </button>
        </>
      )}

      {/* Komunikaty o statusie */}
      {status === 'success' && (
        <div style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>
          ✅ Zamówienie przyjęte!
        </div>
      )}
      {status && status !== 'success' && status !== 'loading' && (
        <div style={{ marginTop: '15px', color: 'red' }}>
          ❌ Błąd: {status}
        </div>
      )}
    </div>
  );
};

export default Cart;