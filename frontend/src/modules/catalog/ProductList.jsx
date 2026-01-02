import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TENANT_ID = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(`/catalog/local/${TENANT_ID}`);
        setProducts(response.data);
      } catch (err) {
        setError('Błąd połączenia z API.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Ładowanie oferty...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Oferta Sklepu</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.product_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{product.name}</h3>
            <p style={{fontSize: '0.9em', color: '#666'}}>{product.description}</p>
            <p><strong>Cena: {product.price} PLN</strong></p>
            
            {/* Tutaj podpinamy akcję dodawania */}
            <button 
              onClick={() => onAddToCart(product)}
              style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', width: '100%', borderRadius: '4px' }}
            >
              Dodaj do koszyka
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;