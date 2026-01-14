import React, { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NOWE STANY DO EDYCJI ---
  const [editingId, setEditingId] = useState(null); // ID edytowanego produktu
  const [tempPrice, setTempPrice] = useState("");   // Tymczasowa cena wpisywana w input

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const myTenantId = decoded.tenant_id;

      const response = await api.get(`/catalog/local/${myTenantId}`);
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError("Nie udało się pobrać produktów.");
    } finally {
      setLoading(false);
    }
  };

  // Rozpoczęcie edycji
  const startEditing = (product) => {
    setEditingId(product.product_id);
    setTempPrice(product.price); // Wstawiamy obecną cenę do inputa
  };

  // Zapisanie zmian
  const savePrice = async (productId) => {
    try {
      await api.patch(`/catalog/local/${productId}`, {
        price: parseFloat(tempPrice)
      });
      
      // Sukces - wychodzimy z trybu edycji i odświeżamy listę lokalnie (bez reloadu)
      setProducts(products.map(p => 
        p.product_id === productId ? { ...p, price: parseFloat(tempPrice) } : p
      ));
      setEditingId(null);
      
    } catch (err) {
      alert("Błąd aktualizacji ceny!");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="row g-4">
      {products.length === 0 ? (
        <div className="col-12 text-center text-muted py-5">
            Twój sklep jest pusty. Dodaj coś z hurtowni powyżej! ⬆️
        </div>
      ) : (
        products.map((product) => (
          <div key={product.product_id} className="col-md-6 col-lg-4">
            <div className={`card h-100 shadow-sm ${product.price === 0 ? 'border-danger' : ''}`}>
              
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                  <span style={{fontSize: '3rem'}}>🎸</span>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted small mb-1">SKU: {product.sku}</p>
                <p className="card-text text-truncate">{product.description}</p>
                
                {/* OSTRZEŻENIE O CENIE 0 */}
                {product.price === 0 && !editingId && (
                    <div className="alert alert-danger py-1 px-2 small mb-2">
                        ⚠️ Ustal cenę, aby sprzedawać!
                    </div>
                )}

                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center">
                    
                    {/* --- LOGIKA EDYCJI CENY --- */}
                    {editingId === product.product_id ? (
                        <div className="input-group input-group-sm me-2">
                            <input 
                                type="number" 
                                className="form-control"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                            />
                            <button onClick={() => savePrice(product.product_id)} className="btn btn-success">OK</button>
                            <button onClick={() => setEditingId(null)} className="btn btn-outline-secondary">X</button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <span className={`h5 mb-0 me-2 ${product.price === 0 ? 'text-danger' : 'text-primary'}`}>
                                {product.price.toFixed(2)} PLN
                            </span>
                            <button 
                                onClick={() => startEditing(product)} 
                                className="btn btn-link btn-sm text-decoration-none p-0"
                                title="Edytuj cenę"
                            >
                                ✏️
                            </button>
                        </div>
                    )}

                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => onAddToCart(product)}
                      disabled={product.price === 0} // Blokujemy dodanie do koszyka jak cena 0
                    >
                      Do koszyka 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;