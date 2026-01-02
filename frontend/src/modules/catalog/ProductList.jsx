import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tenant ID na sztywno = 1 
  const TENANT_ID = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(`/catalog/local/${TENANT_ID}`);
        setProducts(response.data);
      } catch (err) {
        setError('Nie udało się pobrać produktów. Czy Backend działa?');
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
      <h2>Oferta Sklepu (Tenant #1)</h2>
      
      {products.length === 0 ? (
        <p>Brak produktów w sklepie.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {products.map((product) => (
            <div key={product.product_id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>Cena: {product.price} PLN</strong></p>
              <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}>
                Dodaj do koszyka
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;