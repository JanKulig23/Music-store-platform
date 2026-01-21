import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importujemy komponenty sklepu
import ProductList from '../modules/Catalog/ProductList'; 
import Cart from '../modules/Cart/Cart';

const HomePage = () => {
  // --- KONFIGURACJA ---
  // To jest ID Twojego sklepu. Musi być takie samo jak w bazie danych.
  const PUBLIC_STORE_ID = 21; 

  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // --- LOGIKA KOSZYKA ---
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // --- STYLE (Spójne z Panelem Właściciela) ---
  const pageStyle = {
    backgroundColor: '#f8f9fa', 
    minHeight: '100vh',
    paddingBottom: '50px'
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', // Profesjonalny gradient
    color: 'white',
    borderRadius: '8px',
    padding: '4rem 2rem', 
    marginBottom: '3rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  return (
    <div style={pageStyle}>
      
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top mb-4 px-4">
        <div className="container-fluid">
            {/* Logo / Nazwa */}
            <span className="navbar-brand fw-bold text-dark" style={{letterSpacing: '-0.5px'}}>
                Music Store SaaS
            </span>
            
            {/* Przycisk logowania dla Właściciela */}
            <div className="d-flex align-items-center gap-3">
                <button 
                    onClick={() => navigate('/login')} 
                    className="btn btn-dark btn-sm px-4 rounded-pill"
                >
                    Panel Właściciela
                </button>
            </div>
        </div>
      </nav>

      <div className="container">

        {/* --- HERO BANNER (Witaj w sklepie) --- */}
        <section style={heroStyle} className="text-center">
            <h1 className="display-4 fw-bold mb-3">Instrumenty z duszą</h1>
            <p className="lead mb-4" style={{opacity: 0.9, maxWidth: '600px', margin: '0 auto'}}>
                Odkryj naszą kolekcję gitar i akcesoriów. Najlepsza jakość, szybka dostawa i profesjonalna obsługa.
            </p>
            <button className="btn btn-light text-dark fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={() => window.scrollTo(0, 500)}>
                Zobacz Ofertę
            </button>
        </section>

        {/* --- GŁÓWNA TREŚĆ SKLEPU --- */}
        <div className="row">
            
            {/* LEWA KOLUMNA: Lista Produktów */}
            <div className="col-lg-8 mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                    <h4 className="fw-bold text-dark mb-0">Nasze Produkty</h4>
                    <span className="text-muted small">Aktualna oferta</span>
                </div>

                <div className="bg-white p-4 rounded-3 shadow-sm border-0">
                    {/* Przekazujemy ID 21, żeby pobrało Twoje produkty */}
                    <ProductList onAddToCart={addToCart} publicTenantId={PUBLIC_STORE_ID} />
                </div>
            </div>

            {/* PRAWA KOLUMNA: Koszyk (Sticky) */}
            <div className="col-lg-4">
                <div className="card shadow-sm border-0 sticky-top rounded-3" style={{top: '100px', zIndex: 100}}>
                    <div className="card-header bg-dark text-white fw-bold py-3 border-0 rounded-top-3">
                        Twój Koszyk
                    </div>
                    <div className="card-body bg-white rounded-bottom-3">
                        <Cart items={cartItems} onClearCart={clearCart} tenantId={PUBLIC_STORE_ID} />
                    </div>
                </div>
                
                {/* Dodatkowe info pod koszykiem */}
                <div className="mt-4 text-center text-muted small">
                    <p className="mb-1">🔒 Bezpieczne płatności</p>
                    <p className="mb-0">📦 Szybka wysyłka w 24h</p>
                </div>
            </div>

        </div>

      </div>
      
      {/* --- FOOTER (Stopka) --- */}
      <footer className="text-center text-muted mt-5 py-4 border-top">
        <small>&copy; 2026 Music Store SaaS. Wszelkie prawa zastrzeżone.</small>
      </footer>

    </div>
  );
};

export default HomePage;