import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductList from '../modules/Catalog/ProductList'; 
import Cart from '../modules/Cart/Cart';
import AddProductForm from '../modules/catalog/AddProductForm'; 
import GlobalCatalog from '../modules/catalog/GlobalCatalog';
import OwnerOrderManager from '../modules/Orders/OwnerOrderManager';

const StorePage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); 
  const navigate = useNavigate();

  const handleProductAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- STYLE ---
  const pageStyle = {
    backgroundColor: '#f8f9fa', 
    minHeight: '100vh',
    paddingBottom: '50px'
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', // Gradient
    color: 'white',
    borderRadius: '8px',
    padding: '3rem 2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  return (
    <div style={pageStyle}>
      
      {/* --- NAVBAR --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top mb-4 px-4">
        <div className="container-fluid">
            <span className="navbar-brand fw-bold text-dark">
                Music Store SaaS
            </span>
            
            <div className="d-flex align-items-center gap-3">
                <div className="d-none d-md-block text-end">
                    <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>ZALOGOWANY JAKO</small>
                    <span className="fw-bold text-dark">Właściciel Sklepu</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-dark btn-sm px-3">
                    Wyloguj
                </button>
            </div>
        </div>
      </nav>

      <div className="container">

        {/* --- HERO BANNER --- */}
        <section style={heroStyle}>
            <h1 className="fw-bold mb-2">Panel Zarządzania</h1>
            <p className="lead mb-0" style={{opacity: 0.9}}>
                Zarządzaj asortymentem i realizuj zamówienia w jednym miejscu.
            </p>
        </section>

        {/* --- UKŁAD PIONOWY --- */}
        <div className="row g-4">
            
            {/* 1. SEKCJA ZAMÓWIEŃ */}
            <div className="col-12">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white py-3 border-bottom">
                        <h5 className="mb-0 fw-bold text-dark">Zarządzanie Zamówieniami</h5>
                    </div>
                    <div className="card-body">
                        <OwnerOrderManager />
                    </div>
                </div>
            </div>

            {/* 2. SEKCJA MAGAZYNU (POPRAWIONA) */}
            <div className="col-12">
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-header bg-white py-3 border-bottom">
                        <h5 className="mb-0 fw-bold text-dark">Zarządzanie Magazynem</h5>
                    </div>
                    <div className="card-body">
                        
                        {/* ZMIANA TUTAJ: Używamy col-12 dla obu elementów, żeby były jeden pod drugim */}
                        <div className="row g-4">
                            
                            {/* A. Import z Hurtowni */}
                            <div className="col-12">
                                <h6 className="text-muted text-uppercase small fw-bold mb-3">Import z Hurtowni</h6>
                                <GlobalCatalog onImportSuccess={handleProductAdded} />
                            </div>

                            {/* Separator (Linia pozioma) */}
                            <div className="col-12">
                                <hr className="text-muted opacity-25" />
                            </div>

                            {/* B. Dodawanie Ręczne */}
                            <div className="col-12">
                                <h6 className="text-muted text-uppercase small fw-bold mb-3">Dodaj produkt ręcznie</h6>
                                <AddProductForm onProductAdded={handleProductAdded} />
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>


        <hr className="my-5 opacity-25" />


        {/* --- SEKCJA PODGLĄDU SKLEPU --- */}
        <div className="row">
            <div className="col-12 mb-4">
                <h4 className="fw-bold text-dark">Podgląd Sklepu (Widok Klienta)</h4>
                <p className="text-muted">Poniżej znajduje się aktualna oferta widoczna dla kupujących.</p>
            </div>

            {/* Lista Produktów */}
            <div className="col-lg-8 mb-4">
                <div className="bg-white p-4 rounded-3 shadow-sm border-0">
                    <ProductList key={refreshKey} onAddToCart={addToCart} />
                </div>
            </div>

            {/* Koszyk Testowy */}
            <div className="col-lg-4">
                <div className="card shadow-sm border-0 sticky-top rounded-3" style={{top: '100px', zIndex: 100}}>
                    <div className="card-header bg-dark text-white fw-bold py-3">
                        Twój Testowy Koszyk
                    </div>
                    <div className="card-body bg-light">
                        <Cart items={cartItems} onClearCart={clearCart} />
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StorePage;