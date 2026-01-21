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

  // --- STYLE INLINE DLA EFEKTÓW ---
  // W prawdziwym projekcie dałbyś to do CSS, ale tu dla wygody dajemy w JS
  const cardStyle = {
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)'; // standard shadow-sm
  };

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

  const getProductImage = (productId) => {
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
      alert("Błąd zapisu! Sprawdź dane.");
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  
  if (products.length === 0 && !loading) {
      return <div className="text-center text-muted py-5 display-6">
        {isOwnerMode ? "Magazyn pusty. Czas na import! 📦" : "Puste półki... Wróć później 🎸"}
      </div>;
  }

  return (
    <div className="row g-4">
      {products.map((product) => {
          const isAvailable = product.price > 0 && product.stock_quantity > 0;

          return (
          <div key={product.product_id} className="col-md-6 col-lg-4">
            
            {/* --- KARTA PRODUKTU "PREMIUM" --- */}
            <div 
                className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${!isAvailable && isOwnerMode ? 'border border-warning' : ''}`}
                style={cardStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
              
              {/* --- KONTENER ZDJĘCIA (SZARE TŁO) --- */}
              <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                  <img 
                    src={getProductImage(product.product_id)} 
                    alt={product.name}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        opacity: isAvailable ? 1 : 0.6 // Przygaszamy jak niedostępne
                    }}
                  />
                  
                  {/* Badge "Wyprzedane" */}
                  {product.stock_quantity === 0 && (
                      <div className="position-absolute top-50 start-50 translate-middle badge bg-dark text-uppercase px-3 py-2 shadow-lg">
                          Wyprzedane
                      </div>
                  )}

                  {/* Badge "Ostatnie sztuki" (np. mniej niż 3) */}
                  {product.stock_quantity > 0 && product.stock_quantity < 3 && (
                      <div className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark shadow-sm">
                          Ostatnie sztuki!
                      </div>
                  )}
              </div>
              
              {/* --- TREŚĆ KARTY --- */}
              <div className="card-body d-flex flex-column p-4">
                
                {/* SKU i Nazwa */}
                <div className="mb-2">
                    <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>SKU: {product.sku}</small>
                    <h5 className="card-title fw-bold text-dark mt-1 mb-0">{product.name}</h5>
                </div>

                {/* Opis */}
                <p className="card-text text-secondary small mb-3 flex-grow-1" style={{lineHeight: '1.5'}}>
                    {product.description && product.description.length > 80 
                        ? product.description.substring(0, 80) + "..." 
                        : product.description || "Klasyczne brzmienie w nowoczesnym wydaniu."}
                </p>
                
                {/* Ostrzeżenie dla właściciela (tryb edycji) */}
                {!isAvailable && isOwnerMode && !editingId && (
                    <div className="alert alert-warning py-2 px-3 small mb-3 rounded-3 text-center">
                        ⚠️ Uzupełnij cenę i stan!
                    </div>
                )}

                <div className="mt-auto pt-3 border-top">
                  
                  {/* --- TRYB EDYCJI --- */}
                  {editingId === product.product_id ? (
                      <div className="p-3 bg-light rounded-3 border">
                          <label className="small text-muted fw-bold">Cena (PLN):</label>
                          <input type="number" className="form-control form-control-sm mb-2" 
                              value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} />
                          
                          <label className="small text-muted fw-bold">Ilość:</label>
                          <input type="number" className="form-control form-control-sm mb-2" 
                              value={tempStock} onChange={(e) => setTempStock(e.target.value)} />
                          
                          <div className="d-flex gap-2 mt-3">
                              <button onClick={() => saveChanges(product.product_id)} className="btn btn-success btn-sm w-100 fw-bold">Zapisz</button>
                              <button onClick={() => setEditingId(null)} className="btn btn-white btn-sm border w-100">Anuluj</button>
                          </div>
                      </div>
                  ) : (
                      // --- TRYB PODGLĄDU ---
                      <div className="d-flex align-items-center justify-content-between">
                          <div>
                              {/* Cena */}
                              <div className={`fs-5 fw-bold ${product.price === 0 ? 'text-danger' : 'text-primary'}`}>
                                  {product.price > 0 ? `${product.price.toFixed(2)} PLN` : "Brak ceny"}
                              </div>
                              {/* Stan magazynowy */}
                              <small className={`fw-semibold ${product.stock_quantity > 0 ? 'text-success' : 'text-danger'}`} style={{fontSize: '0.8rem'}}>
                                  {product.stock_quantity > 0 ? `● Dostępne: ${product.stock_quantity}` : '● Brak w magazynie'}
                              </small>
                          </div>

                          <div className="d-flex flex-column align-items-end gap-2">
                            {/* Przycisk Kupowania */}
                            <button 
                                className="btn btn-primary rounded-pill px-4 shadow-sm"
                                onClick={() => onAddToCart(product)}
                                disabled={!isAvailable}
                                style={{ transition: 'all 0.2s' }}
                            >
                                {product.stock_quantity > 0 ? "Do koszyka 🛒" : "Niedostępny"}
                            </button>

                            {/* Przycisk Edycji (tylko dla właściciela) */}
                            {isOwnerMode && (
                                <button onClick={() => startEditing(product)} className="btn btn-link btn-sm text-muted text-decoration-none p-0" style={{fontSize: '0.8rem'}}>
                                    ⚙️ Edytuj
                                </button>
                            )}
                          </div>
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