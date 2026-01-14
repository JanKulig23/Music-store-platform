import React, { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

// Dodajemy prop 'publicTenantId'. 
// Jeśli jest podany -> Tryb Klienta (bez logowania).
// Jeśli brak -> Tryb Właściciela (wymaga tokena).
const ProductList = ({ onAddToCart, publicTenantId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STANY EDYCJI (Tylko dla właściciela) ---
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");

  const fetchProducts = async () => {
    try {
      let targetTenantId = publicTenantId;

      // JEŚLI NIE MA PUBLIC ID, TO SZUKAMY TOKENA (TRYB WŁAŚCICIELA)
      if (!targetTenantId) {
        const token = localStorage.getItem('token');
        if (!token) {
           // Jeśli nie ma ani Public ID, ani tokena -> przerywamy (nie ma co pobierać)
           setLoading(false);
           return;
        }
        const decoded = jwtDecode(token);
        targetTenantId = decoded.tenant_id;
      }

      // Pobieramy produkty
      const response = await api.get(`/catalog/local/${targetTenantId}`);
      setProducts(response.data);
    } catch (err) {
      console.error("Błąd pobierania:", err);
      // W trybie publicznym nie chcemy straszyć błędem tokena, więc cichy błąd
      setError("Nie udało się załadować produktów.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [publicTenantId]); // Odśwież, jeśli zmieni się ID sklepu


  // --- FUNKCJE EDYCJI (Działają tylko gdy NIE ma publicTenantId) ---
  const isOwnerMode = !publicTenantId; 

  const startEditing = (product) => {
    if (!isOwnerMode) return; // Klient nie może edytować
    setEditingId(product.product_id);
    setTempPrice(product.price);
  };

  const savePrice = async (productId) => {
    if (!isOwnerMode) return;
    try {
      await api.patch(`/catalog/local/${productId}`, {
        price: parseFloat(tempPrice)
      });
      // Aktualizacja lokalna
      setProducts(products.map(p => 
        p.product_id === productId ? { ...p, price: parseFloat(tempPrice) } : p
      ));
      setEditingId(null);
    } catch (err) {
      alert("Błąd aktualizacji ceny!");
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  
  // Jeśli w trybie publicznym nie ma produktów
  if (products.length === 0 && !loading) {
      return <div className="text-center text-muted py-5">
        {isOwnerMode 
          ? "Twój sklep jest pusty. Dodaj coś z hurtowni powyżej! ⬆️" 
          : "Ten sklep jest na razie pusty."}
      </div>;
  }

  return (
    <div className="row g-4">
      {products.map((product) => (
          <div key={product.product_id} className="col-md-6 col-lg-4">
            <div className={`card h-100 shadow-sm ${product.price === 0 && isOwnerMode ? 'border-danger' : ''}`}>
              
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                  <span style={{fontSize: '3rem'}}>🎸</span>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted small mb-1">SKU: {product.sku}</p>
                <p className="card-text text-truncate">{product.description}</p>
                
                {/* Ostrzeżenie widzi TYLKO właściciel */}
                {product.price === 0 && isOwnerMode && !editingId && (
                    <div className="alert alert-danger py-1 px-2 small mb-2 text-center">⚠️ Ustal cenę!</div>
                )}

                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center">
                    
                    {/* --- CENA I EDYCJA --- */}
                    {editingId === product.product_id ? (
                        <div className="input-group input-group-sm me-2">
                            <input type="number" className="form-control" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} />
                            <button onClick={() => savePrice(product.product_id)} className="btn btn-success">💾</button>
                            <button onClick={() => setEditingId(null)} className="btn btn-outline-secondary">❌</button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <span className={`h5 mb-0 me-2 ${product.price === 0 ? 'text-danger' : 'text-primary'}`}>
                                {product.price.toFixed(2)} PLN
                            </span>
                            
                            {/* Ołówek widzimy TYLKO w trybie właściciela */}
                            {isOwnerMode && (
                                <button onClick={() => startEditing(product)} className="btn btn-link btn-sm text-decoration-none p-0" title="Edytuj cenę">
                                    ✏️
                                </button>
                            )}
                        </div>
                    )}

                    {/* Klient może kupić, o ile cena > 0 */}
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => onAddToCart(product)}
                      disabled={product.price === 0}
                    >
                      Do koszyka 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default ProductList;