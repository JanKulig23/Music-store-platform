import React, { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

const ProductList = ({ onAddToCart, publicTenantId = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STANY FILTROWANIA ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  
  // Nowe stany sortowania
  const [sortBy, setSortBy] = useState("newest"); // newest, price, name
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  
  const LIMIT = 12;

  // --- STANY EDYCJI ---
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");
  const [tempStock, setTempStock] = useState(""); 

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
      
      // Budujemy URL z parametrami
      let url = `/catalog/local/${targetTenantId}?page=${page}&limit=${LIMIT}`;
      
      if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;
      if (sortBy) url += `&sort_by=${sortBy}`;
      if (sortOrder) url += `&sort_order=${sortOrder}`;

      const response = await api.get(url);
      
      if (response.data.products) {
          setProducts(response.data.products);
          setTotalPages(Math.ceil(response.data.total / LIMIT));
      } else {
          setProducts(response.data);
      }
      
    } catch (err) {
      console.error("Błąd:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch przy każdej zmianie filtra
  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [publicTenantId, page, activeSearch, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      setPage(1);
      setActiveSearch(searchTerm);
  };

  // Obsługa zmiany sortowania
  const handleSortChange = (e) => {
      const value = e.target.value;
      // Value format: "price-asc", "name-desc"
      const [newSortBy, newSortOrder] = value.split('-');
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setPage(1); // Reset strony po zmianie sortowania
  };

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
      if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }

  return (
    <div>
        {/* --- GÓRNY PASEK (WYSZUKIWANIE + SORTOWANIE) --- */}
        <div className="row mb-5 justify-content-center g-2">
            
            {/* Wyszukiwarka */}
            <div className="col-12 col-md-7 col-lg-6">
                <form onSubmit={handleSearchSubmit} className="d-flex gap-2 shadow-sm p-2 bg-white rounded-pill border h-100">
                    <input 
                        type="text" 
                        className="form-control border-0 bg-transparent flex-grow-1 ps-3" 
                        style={{ outline: 'none', boxShadow: 'none' }}
                        placeholder="Szukaj instrumentu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                        🔍
                    </button>
                    {activeSearch && (
                        <button type="button" className="btn btn-light rounded-pill px-3 border" onClick={() => { setSearchTerm(""); setActiveSearch(""); setPage(1); }}>✕</button>
                    )}
                </form>
            </div>

            {/* Sortowanie */}
            <div className="col-12 col-md-4 col-lg-3">
                <div className="p-2 bg-white rounded-pill border shadow-sm h-100 d-flex align-items-center px-3">
                    <span className="text-muted small me-2 fw-bold text-uppercase" style={{whiteSpace: 'nowrap'}}>Sortuj:</span>
                    <select 
                        className="form-select border-0 bg-transparent shadow-none py-0 text-dark fw-semibold cursor-pointer"
                        style={{cursor: 'pointer'}}
                        onChange={handleSortChange}
                        defaultValue="newest-desc"
                    >
                        <option value="newest-desc">🆕 Najnowsze</option>
                        <option value="price-asc">💰 Cena: Od najniższej</option>
                        <option value="price-desc">💎 Cena: Od najwyższej</option>
                        <option value="name-asc">🔤 Nazwa: A-Z</option>
                        <option value="name-desc">🔤 Nazwa: Z-A</option>
                    </select>
                </div>
            </div>
        </div>

        {/* --- LOADING --- */}
        {loading && <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>}
        
        {!loading && products.length === 0 && (
            <div className="text-center text-muted py-5">
                <h3>Brak wyników 🧐</h3>
                <p>Zmień kryteria wyszukiwania.</p>
            </div>
        )}

        {/* --- LISTA PRODUKTÓW --- */}
        {!loading && products.length > 0 && (
            <div className="row g-4 mb-5">
            {products.map((product) => {
                const isAvailable = product.price > 0 && product.stock_quantity > 0;
                return (
                <div key={product.product_id} className="col-md-6 col-lg-4">
                    <div 
                        className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${!isAvailable && isOwnerMode ? 'border border-warning' : ''}`}
                        style={cardStyle}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                    <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                        <img 
                            src={getProductImage(product.product_id)} 
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isAvailable ? 1 : 0.6 }}
                        />
                        {product.stock_quantity === 0 && <div className="position-absolute top-50 start-50 translate-middle badge bg-dark px-3 py-2 shadow-lg">Wyprzedane</div>}
                        {product.stock_quantity > 0 && product.stock_quantity < 3 && <div className="position-absolute top-0 end-0 m-3 badge bg-warning text-dark shadow-sm">Ostatnie sztuki!</div>}
                    </div>
                    
                    <div className="card-body d-flex flex-column p-4">
                        <div className="mb-2">
                            <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>SKU: {product.sku}</small>
                            <h5 className="card-title fw-bold mt-1 mb-0 text-truncate">{product.name}</h5>
                        </div>
                        <p className="card-text text-secondary small mb-3 flex-grow-1" style={{lineHeight: '1.5'}}>
                            {product.description?.length > 80 ? product.description.substring(0, 80) + "..." : product.description || "Opis produktu..."}
                        </p>
                        
                        <div className="mt-auto pt-3 border-top">
                        {editingId === product.product_id ? (
                            <div className="p-3 bg-light rounded-3 border">
                                <input type="number" className="form-control form-control-sm mb-2" value={tempPrice} onChange={(e) => setTempPrice(e.target.value)} placeholder="Cena" />
                                <input type="number" className="form-control form-control-sm mb-2" value={tempStock} onChange={(e) => setTempStock(e.target.value)} placeholder="Ilość" />
                                <div className="d-flex gap-2">
                                    <button onClick={() => saveChanges(product.product_id)} className="btn btn-success btn-sm w-100">Zapisz</button>
                                    <button onClick={() => setEditingId(null)} className="btn btn-white btn-sm border w-100">Anuluj</button>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <div className={`fs-5 fw-bold ${product.price === 0 ? 'text-danger' : 'text-primary'}`}>
                                        {product.price > 0 ? `${product.price.toFixed(2)} PLN` : "Brak ceny"}
                                    </div>
                                    <small className={`fw-semibold ${product.stock_quantity > 0 ? 'text-success' : 'text-danger'}`} style={{fontSize: '0.8rem'}}>
                                        {product.stock_quantity > 0 ? `● Dostępne: ${product.stock_quantity}` : '● Brak'}
                                    </small>
                                </div>
                                <div className="d-flex flex-column align-items-end">
                                    <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => onAddToCart(product)} disabled={!isAvailable}>
                                        {product.stock_quantity > 0 ? "Do koszyka 🛒" : "Niedostępny"}
                                    </button>
                                    {isOwnerMode && <button onClick={() => startEditing(product)} className="btn btn-link btn-sm text-muted p-0 mt-1" style={{fontSize: '0.8rem'}}>⚙️ Edytuj</button>}
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
        )}

        {/* --- PAGINACJA --- */}
        {!loading && totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4 mb-5">
                <ul className="pagination shadow-sm">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page - 1)}>&laquo;</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                            return <li key={p} className={`page-item ${page === p ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(p)}>{p}</button></li>;
                        } else if (p === page - 2 || p === page + 2) {
                            return <li key={p} className="page-item disabled"><span className="page-link">...</span></li>;
                        }
                        return null;
                    })}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>&raquo;</button>
                    </li>
                </ul>
            </nav>
        )}
    </div>
  );
};

export default ProductList;