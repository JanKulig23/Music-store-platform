import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Twoje dotychczasowe importy
import ProductList from '../modules/Catalog/ProductList'; 
import Cart from '../modules/Cart/Cart';
import AddProductForm from '../modules/catalog/AddProductForm'; 
import GlobalCatalog from '../modules/catalog/GlobalCatalog';

// --- NOWY IMPORT ---
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

  return (
    <div className="container py-4">
      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
            <h1 className="h3 mb-0">🎸 Music Store SaaS</h1>
            <small className="text-muted">Panel Zarządzania</small>
        </div>
        <div>
           <span className="badge bg-primary me-3">Właściciel</span>
           <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
             Wyloguj
           </button>
        </div>
      </header>
      
      {/* --- SEKCJA 1: ZARZĄDZANIE KATALOGIEM (IMPORT I DODAWANIE) --- */}
      <section className="mb-5">
        <h4 className="text-primary mb-3">1. Zarządzanie Towarem</h4>
        <div className="row g-4">
            <div className="col-lg-6">
                <div className="card h-100 shadow-sm border-primary">
                    <div className="card-header bg-primary text-white">Hurtownia Centralna</div>
                    <div className="card-body">
                        <GlobalCatalog onImportSuccess={handleProductAdded} />
                    </div>
                </div>
            </div>
            <div className="col-lg-6">
                <div className="card h-100 shadow-sm">
                    <div className="card-header bg-light">Dodaj produkt ręcznie</div>
                    <div className="card-body">
                        <AddProductForm onProductAdded={handleProductAdded} />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- SEKCJA 2: ZARZĄDZANIE ZAMÓWIENIAMI (NOWOŚĆ!!!) --- */}
      <section className="mb-5">
        <div className="card shadow border-success">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h4 className="h5 mb-0">2. 📦 Zarządzanie Zamówieniami</h4>
                <span className="badge bg-white text-success">Akcja wymagana</span>
            </div>
            <div className="card-body">
                <p className="card-text text-muted mb-3">
                    Tutaj spływają zamówienia od klientów. Zatwierdź je, aby towar został odjęty z magazynu.
                </p>
                {/* Tu wstawiamy nasz nowy komponent */}
                <OwnerOrderManager />
            </div>
        </div>
      </section>

      <hr className="my-5" />

      {/* --- SEKCJA 3: PODGLĄD SKLEPU I TESTOWANIE --- */}
      <div className="row">
        <div className="col-md-12 mb-3">
            <h3>3. Podgląd Twojego Sklepu (Widok Klienta)</h3>
            <p className="text-muted">
                Poniżej widzisz produkty tak, jak widzi je klient. 
                Możesz użyć testowego koszyka po prawej, aby sprawdzić czy wszystko działa.
            </p>
        </div>

        {/* Lista Produktów */}
        <div className="col-md-8">
          <ProductList key={refreshKey} onAddToCart={addToCart} />
        </div>

        {/* Koszyk Testowy */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-warning text-dark">
               🛒 Twój Testowy Koszyk
            </div>
            <div className="card-body">
              <Cart items={cartItems} onClearCart={clearCart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;