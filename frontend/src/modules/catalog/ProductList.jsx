import React, { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

const ProductList = ({ onAddToCart, publicTenantId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STANY EDYCJI ---
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [tempStock, setTempStock] = useState(""); 

  const fetchProducts = async () => {
    try {
      let targetTenantId = publicTenantId;

      if (!targetTenantId) {
        const token = localStorage.getItem('token');
        if (!token) {
           setLoading(false);
           return;
        }
        const decoded = jwtDecode(token);
        targetTenantId = decoded.tenant_id;
      }

      const response = await api.get(`/catalog/local/${targetTenantId}`);
      setProducts(response.data);
    } catch (err) {
      console.error("Błąd:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [publicTenantId]);

  // --- FUNKCJA DO ZDJĘĆ ---
  const getProductImage = (productId) => {
    // Zakładamy, że masz 5 zdjęć: 1.jpg, 2.jpg ... 5.jpg w folderze public/guitars/
    const numberOfImages = 5;
    const imageIndex = (productId % numberOfImages) + 1; 
    return `/guitars/${imageIndex}.jpg`;
  };

  const isOwnerMode = !publicTenantId; 

  const startEditing = (product) => {
    if (!isOwnerMode) return;
    setEditingId(product.product_id);
    setTempPrice(product.price);
    setTempStock(product.stock_quantity); 
  };

  const saveChanges = async (productId) => {
    if (!isOwnerMode) return;
    try {
      await api.patch(`/catalog/local/${productId}`, {
        price: parseFloat(tempPrice),
        stock_quantity: parseInt(tempStock)
      });
      
      setProducts(products.map(p => 
        p.product_id === productId ? { 
            ...p, 
            price: parseFloat(tempPrice),
            stock_quantity: parseInt(tempStock)
        } : p
      ));
      setEditingId(null);
    } catch (err) {
      alert("Błąd zapisu! Sprawdź czy wpisałeś poprawne liczby.");
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  
  if (products.length === 0 && !loading) {
      return <div className="text-center text-muted py-5">
        {isOwnerMode ? "Sklep pusty. Zaimportuj coś z hurtowni!" : "Ten sklep jest na razie pusty."}
      </div>;
  }

  return (
    <div className="row g-4">
      {products.map((product) => {
          const isAvailable = product.price > 0 && product.stock_quantity > 0;

          return (
          <div key={product.product_id} className="col-md-6 col-lg-4">
            <div className={`card h-100 shadow-sm ${!isAvailable && isOwnerMode ? 'border-warning' : ''}`}>
              
              {/* --- ZDJĘCIE (ZAMIAST EMOTKI) --- */}
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={getProductImage(product.product_id)} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Badge "Wyprzedane" na zdjęciu */}
                  {product.stock_quantity === 0 && (
                      <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded fw-bold small">
                          Wyprzedane
                      </div>
                  )}
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary">{product.name}</h5>
                <p className="card-text text-muted small mb-1">SKU: {product.sku}</p>
                
                {/* Opis skrócony */}
                <p className="card-text text-muted small">
                    {product.description && product.description.length > 80 
                        ? product.description.substring(0, 80) + "..." 
                        : product.description}
                </p>
                
                {/* Ostrzeżenie dla właściciela */}
                {!isAvailable && isOwnerMode && !editingId && (
                    <div className="alert alert-warning py-1 px-2 small mb-2 text-center">
                        ⚠️ Ustal cenę i stan!
                    </div>
                )}

                <div className="mt-auto">
                  
                  {/* --- TRYB EDYCJI --- */}
                  {editingId === product.product_id ? (
                      <div className="mb-2 p-2 bg-light border rounded">
                          <label className="small text-muted">Cena (PLN):</label>
                          <input type="number" className="form-control form-control-sm mb-2" 
                              value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} />
                          
                          <label className="small text-muted">Ilość sztuk:</label>
                          <input type="number" className="form-control form-control-sm mb-2" 
                              value={tempStock} onChange={(e) => setTempStock(e.target.value)} />
                          
                          <div className="d-flex gap-2">
                              <button onClick={() => saveChanges(product.product_id)} className="btn btn-success btn-sm w-100">Zapisz</button>
                              <button onClick={() => setEditingId(null)} className="btn btn-outline-secondary btn-sm w-100">Anuluj</button>
                          </div>
                      </div>
                  ) : (
                      // --- TRYB PODGLĄDU ---
                      <div>
                          <div className="d-flex justify-content-between align-items-end mb-3">
                              <div>
                                  <span className={`h5 mb-0 d-block ${product.price === 0 ? 'text-danger' : 'text-dark'}`}>
                                      {product.price.toFixed(2)} PLN
                                  </span>
                                  <small className={`fw-bold ${product.stock_quantity > 0 ? 'text-success' : 'text-danger'}`}>
                                      {product.stock_quantity > 0 ? `Dostępne: ${product.stock_quantity} szt.` : 'Brak w magazynie'}
                                  </small>
                              </div>

                              {isOwnerMode && (
                                  <button onClick={() => startEditing(product)} className="btn btn-link text-decoration-none p-0">
                                      ✏️ Edytuj
                                  </button>
                              )}
                          </div>

                          <button 
                            className="btn btn-primary w-100"
                            onClick={() => onAddToCart(product)}
                            disabled={!isAvailable}
                          >
                            {product.stock_quantity > 0 ? "Do koszyka 🛒" : "Produkt niedostępny"}
                          </button>
                      </div>
                  )}

                </div>
              </div>
            </div>
          </div>
          );
      })}
    </div>
  );
};

export default ProductList;