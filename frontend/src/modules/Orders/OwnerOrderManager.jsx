import React, { useEffect, useState } from 'react';
import api from '../../api';

const OwnerOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pobieranie zamówień przy wejściu na stronę
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/manage');
      setOrders(response.data);
    } catch (err) {
      console.error("Błąd pobierania zamówień:", err);
      alert("Nie udało się pobrać listy zamówień.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Obsługa kliknięcia Zatwierdź / Odrzuć
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      const message = newStatus === 'CONFIRMED' 
        ? "✅ Zamówienie zatwierdzone! Stan magazynowy zaktualizowany." 
        : "❌ Zamówienie odrzucone. Towar wraca do puli.";
      
      alert(message);
      fetchOrders(); // Odświeżamy listę, żeby zobaczyć nowy status
    } catch (err) {
      // Wyświetlamy błąd z backendu (np. "Za mało towaru")
      alert(err.response?.data?.detail || "Błąd aktualizacji statusu");
    }
  };

  if (loading) return <div className="text-center p-5">Ładowanie zamówień...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Zarządzanie Zamówieniami</h2>
      
      {orders.length === 0 ? (
        <div className="alert alert-info">Brak zamówień w systemie.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm align-middle bg-white rounded">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Klient (Email)</th>
                <th>Kwota</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  {/* Zakładamy, że backend w przyszłości może zwrócić email usera, na razie ID */}
                  <td>User ID: {order.user_id}</td>
                  <td className="fw-bold">{order.total_amount.toFixed(2)} PLN</td>
                  <td>
                    {order.status === 'NEW' && <span className="badge bg-warning text-dark">OCZEKUJE</span>}
                    {order.status === 'CONFIRMED' && <span className="badge bg-success">ZATWIERDZONE</span>}
                    {order.status === 'REJECTED' && <span className="badge bg-danger">ODRZUCONE</span>}
                  </td>
                  <td>
                    {order.status === 'NEW' ? (
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatusChange(order.order_id, 'CONFIRMED')}
                          title="Zatwierdź i wyślij towar"
                        >
                          ✅ Zatwierdź
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleStatusChange(order.order_id, 'REJECTED')}
                          title="Odrzuć zamówienie"
                        >
                          ❌ Odrzuć
                        </button>
                      </div>
                    ) : (
                        <span className="text-muted small">Proces zakończony</span>
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