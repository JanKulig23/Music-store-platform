import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../modules/Catalog/ProductList';
import Cart from '../modules/Cart/Cart'; 

const HomePage = () => {
  // Tu wpisz ID swojego sklepu (np. 21). 
  // To sprawia, że strona główna wyświetla produkty TEGO konkretnego sklepu.
  const PUBLIC_STORE_ID = 21; 

  const [cartItems, setCartItems] = useState([]);

  // Logika dodawania do koszyka
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const clearCart = () => setCartItems([]);

  return (
    <div className="min-vh-100 bg-white">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-4 sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold">🎸 Super Sklep Muzyczny</span>
          <div className="ms-auto">
            <Link to="/login" className="btn btn-outline-dark btn-sm">
              🔐 Panel Właściciela
            </Link>
          </div>
        </div>
      </nav>

      {/* BANNER */}
      <div className="bg-primary text-white text-center py-5 mb-4">
        <div className="container">
          <h1 className="display-4 fw-bold">Witaj w świecie gitar!</h1>
          <p className="lead">Sprawdź naszą ofertę poniżej.</p>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row">
          
          {/* LISTA PRODUKTÓW */}
          <div className="col-lg-8">
            <h3 className="mb-4 text-secondary">Nasze Produkty</h3>
            {/* Przekazujemy ID sklepu, żeby ProductList wiedział, że to widok publiczny (bez edycji) */}
            <ProductList 
                publicTenantId={PUBLIC_STORE_ID} 
                onAddToCart={addToCart} 
            />
          </div>

          {/* KOSZYK KLIENTA */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{top: '80px'}}>
               <div className="card-header bg-success text-white">
                 🛒 Twój Koszyk
               </div>
               <div className="card-body">
                 {/* --- TU BYŁA ZMIANA --- */}
                 {/* Dodaliśmy tenantId={PUBLIC_STORE_ID}, żeby Koszyk wiedział gdzie wysłać zamówienie Gościa */}
                 <Cart 
                    items={cartItems} 
                    onClearCart={clearCart} 
                    tenantId={PUBLIC_STORE_ID} 
                 />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;