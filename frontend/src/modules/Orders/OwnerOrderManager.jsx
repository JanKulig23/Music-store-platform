import React, { useEffect, useState } from 'react';
import api from '../../api';

const OwnerOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. POBIERANIE ZAMÓWIEŃ ---
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/manage');
      setOrders(response.data);
    } catch (err) {
      console.error("Błąd pobierania zamówień:", err);
      // alert("Nie udało się pobrać listy zamówień."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. OBSŁUGA ZMIANY STATUSU (ZATWIERDŹ / ODRZUĆ) ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      const message = newStatus === 'CONFIRMED' 
        ? "✅ Zamówienie zatwierdzone! Towar wysłany." 
        : "❌ Zamówienie odrzucone.";
      
      alert(message);
      fetchOrders(); // Odświeżamy listę
    } catch (err) {
      alert(err.response?.data?.detail || "Błąd aktualizacji statusu");
    }
  };

  // --- 3. OBSŁUGA USUWANIA (CZYSZCZENIE HISTORII) ---
  const handleDelete = async (orderId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zamówienie z historii?")) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      // Usuwamy lokalnie z listy, żeby nie przeładowywać strony
      setOrders(orders.filter(o => o.order_id !== orderId));
    } catch (err) {
      alert("Nie udało się usunąć zamówienia.");
    }
  };

  if (loading) return <div className="text-center p-5">Ładowanie zamówień...</div>;

  return (
    <div className="container mt-2">
      
      {orders.length === 0 ? (
        <div className="alert alert-info text-center">🎉 Wszystko posprzątane! Brak zamówień.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm align-middle bg-white rounded">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Dane Klienta</th> {/* Zmieniliśmy nagłówek */}
                <th>Kwota</th>
                <th>Status</th>
                <th className="text-end">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  {/* ID */}
                  <td>#{order.order_id}</td>
                  
                  {/* DATA */}
                  <td>
                    {order.created_at 
                        ? new Date(order.created_at).toLocaleString() 
                        : <span className="text-muted small">Brak daty</span>}
                  </td>

                  {/* DANE KLIENTA (IMIĘ, ADRES, TELEFON) */}
                  <td>
                    {order.first_name ? (
                        <>
                            <div className="fw-bold">{order.first_name} {order.last_name}</div>
                            <div className="small text-muted">{order.address}</div>
                            <div className="small text-muted">📞 {order.phone_number}</div>
                        </>
                    ) : (
                        // Dla starych zamówień bez danych wyświetlamy ID
                        <div className="text-muted small">User ID: {order.user_id}</div>
                    )}
                  </td>

                  {/* KWOTA */}
                  <td className="fw-bold">{order.total_amount.toFixed(2)} PLN</td>
                  
                  {/* STATUS */}
                  <td>
                    {order.status === 'NEW' && <span className="badge bg-warning text-dark">OCZEKUJE</span>}
                    {order.status === 'CONFIRMED' && <span className="badge bg-success">ZATWIERDZONE</span>}
                    {order.status === 'REJECTED' && <span className="badge bg-danger">ODRZUCONE</span>}
                  </td>

                  {/* PRZYCISKI AKCJI */}
                  <td className="text-end">
                    
                    {order.status === 'NEW' ? (
                      // PRZYCISKI DECYZYJNE
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatusChange(order.order_id, 'CONFIRMED')}
                          title="Zatwierdź"
                        >
                          ✅
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleStatusChange(order.order_id, 'REJECTED')}
                          title="Odrzuć"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      // PRZYCISK USUWANIA (DLA ZAKOŃCZONYCH)
                      <button 
                        className="btn btn-light text-danger btn-sm border"
                        onClick={() => handleDelete(order.order_id)}
                        title="Usuń z historii"
                      >
                        🗑️ Usuń
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerOrderManager;