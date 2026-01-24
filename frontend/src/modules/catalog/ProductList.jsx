import React, { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

const ProductList = ({ onAddToCart, publicTenantId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINACJA ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12; // Ilość produktów na stronę (ładnie dzieli się przez 3 i 4)

  // --- STANY EDYCJI ---
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [tempStock, setTempStock] = useState(""); 

  // --- STYLE INLINE ---
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
    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
  };

  const fetchProducts = async () => {
    setLoading(true);
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
      
      // Zapytanie z paginacją
      const response = await api.get(`/catalog/local/${targetTenantId}?page=${page}&limit=${LIMIT}`);
      
      // Obsługa nowej struktury odpowiedzi z backendu
      if (response.data.products) {
          setProducts(response.data.products);
          setTotalPages(Math.ceil(response.data.total / LIMIT));
      } else {
          // Fallback dla starego API (gdyby backend nie został zaktualizowany)
          setProducts(response.data);
      }
      
    } catch (err) {
      console.error("Błąd:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pobieranie przy zmianie strony lub sklepu
  useEffect(() => {
    fetchProducts();
    // Scroll na górę przy zmianie strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [publicTenantId, page]);

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

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
      }
  }

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  
  if (products.length === 0 && !loading) {
      return <div className="text-center text-muted py-5 display-6">
        {isOwnerMode ? "Magazyn pusty. Czas na import! 📦" : "Puste półki... Wróć później 🎸"}
      </div>;
  }

  return (
    <div>
        {/* Lista Produktów */}
        <div className="row g-4 mb-5">
        {products.map((product) => {
            const isAvailable = product.price > 0 && product.stock_quantity > 0;

            return (
            <div key={product.product_id} className="col-md-6 col-lg-4">
                
                {/* --- KARTA PRODUKTU --- */}
                <div 
                    className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${!isAvailable && isOwnerMode ? 'border border-warning' : ''}`}
                    style={cardStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                
                {/* --- ZDJĘCIE --- */}
                <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                    <img 
                        src={getProductImage(product.product_id)} 
                        alt={product.name}
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            opacity: isAvailable ? 1 : 0.6 
                        }}
                    />
                    
                    {product.stock_quantity === 0 && (
                        <div className="position-absolute top-50 start-50 translate-middle badge bg-dark text-uppercase px-3 py-2 shadow-lg">
                            Wyprzedane
                        </div>
                    )}

                    {product.stock_quantity > 0 && product.stock_quantity < 3 && (
                        <div className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark shadow-sm">
                            Ostatnie sztuki!
                        </div>
                    )}
                </div>
                
                {/* --- TREŚĆ --- */}
                <div className="card-body d-flex flex-column p-4">
                    
                    <div className="mb-2">
                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>SKU: {product.sku}</small>
                        <h5 className="card-title fw-bold text-dark mt-1 mb-0">{product.name}</h5>
                    </div>

                    <p className="card-text text-secondary small mb-3 flex-grow-1" style={{lineHeight: '1.5'}}>
                        {product.description && product.description.length > 80 
                            ? product.description.substring(0, 80) + "..." 
                            : product.description || "Klasyczne brzmienie w nowoczesnym wydaniu."}
                    </p>
                    
                    {!isAvailable && isOwnerMode && !editingId && (
                        <div className="alert alert-warning py-2 px-3 small mb-3 rounded-3 text-center">
                            ⚠️ Uzupełnij cenę i stan!
                        </div>
                    )}

                    <div className="mt-auto pt-3 border-top">
                    
                    {/* --- EDYCJA --- */}
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
                        // --- PODGLĄD ---
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <div className={`fs-5 fw-bold ${product.price === 0 ? 'text-danger' : 'text-primary'}`}>
                                    {product.price > 0 ? `${product.price.toFixed(2)} PLN` : "Brak ceny"}
                                </div>
                                <small className={`fw-semibold ${product.stock_quantity > 0 ? 'text-success' : 'text-danger'}`} style={{fontSize: '0.8rem'}}>
                                    {product.stock_quantity > 0 ? `● Dostępne: ${product.stock_quantity}` : '● Brak w magazynie'}
                                </small>
                            </div>

                            <div className="d-flex flex-column align-items-end gap-2">
                                <button 
                                    className="btn btn-primary rounded-pill px-4 shadow-sm"
                                    onClick={() => onAddToCart(product)}
                                    disabled={!isAvailable}
                                    style={{ transition: 'all 0.2s' }}
                                >
                                    {product.stock_quantity > 0 ? "Do koszyka 🛒" : "Niedostępny"}
                                </button>

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

        {/* --- PASEK PAGINACJI --- */}
        {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination shadow-sm">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                            &laquo; Poprzednia
                        </button>
                    </li>
                    
                    {/* Wyświetlamy max 5 stron wokół aktualnej, żeby nie było za długo */}
                    {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        // Logika skracania paska (pokaż pierwszą, ostatnią i okolice obecnej)
                        if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                            return (
                                <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(p)}>
                                        {p}
                                    </button>
                                </li>
                            );
                        } else if (p === page - 2 || p === page + 2) {
                            return <li key={p} className="page-item disabled"><span className="page-link">...</span></li>;
                        }
                        return null;
                    })}

                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                            Następna &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        )}
    </div>
  );
};

export default ProductList;