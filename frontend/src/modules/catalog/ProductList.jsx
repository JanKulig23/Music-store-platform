import React, { useEffect, useState } from 'react';
import api from '../../api'; // Używamy naszego api.js
import { jwtDecode } from "jwt-decode"; // Do odczytania ID sklepu z tokena

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. Pobieramy token z przeglądarki
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Brak tokena - zaloguj się.");
          setLoading(false);
          return;
        }

        // 2. Dekodujemy token, żeby znaleźć tenant_id (ID Twojego sklepu)
        const decoded = jwtDecode(token);
        const myTenantId = decoded.tenant_id;

        // 3. Pobieramy produkty TYLKO dla tego ID
        // Używamy endpointu /catalog/local/{tenant_id}
        const response = await api.get(`/catalog/local/${myTenantId}`);
        
        setProducts(response.data);
      } catch (err) {
        console.error("Błąd pobierania produktów:", err);
        setError("Nie udało się pobrać produktów.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Pusta tablica = uruchom tylko raz przy załadowaniu (ale StorePage wymusi odświeżenie kluczem)

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="row g-4">
      {products.length === 0 ? (
        <div className="col-12 text-center text-muted py-5">
            To wygląda na nowy sklep! Dodaj swój pierwszy produkt powyżej. ⬆️
        </div>
      ) : (
        products.map((product) => (
          <div key={product.product_id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              {/* Placeholder na zdjęcie */}
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                  <span style={{fontSize: '3rem'}}>🎸</span>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted small mb-1">SKU: {product.sku}</p>
                <p className="card-text text-truncate">{product.description}</p>
                
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="h5 mb-0 text-primary">{product.price} PLN</span>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => onAddToCart(product)}
                  >
                    Do koszyka 🛒
                  </button>
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