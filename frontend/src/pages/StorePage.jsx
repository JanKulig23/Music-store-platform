import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from '../modules/Catalog/ProductList'; 
import Cart from '../modules/Cart/Cart';
// WAŻNE: Upewnij się, że stworzyłeś ten plik w poprzednim kroku!
import AddProductForm from '../modules/catalog/AddProductForm'; 

const StorePage = () => {
  const [cartItems, setCartItems] = useState([]);
  // Ten stan służy do wymuszenia odświeżenia listy produktów po dodaniu nowego
  const [refreshKey, setRefreshKey] = useState(0); 
  const navigate = useNavigate();

  // Tę funkcję przekażemy do formularza. 
  // Jak formularz doda gitarę, ta funkcja się odpali i lista na dole się odświeży.
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
        <h1 className="h3">🎸 Music Store SaaS</h1>
        <div>
           <span className="badge bg-primary me-3">Zalogowany jako: Właściciel</span>
           <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
             Wyloguj
           </button>
        </div>
      </header>
      
      {/* --- SEKCJA ADMINISTRATORA (Tego brakowało w Twoim kodzie) --- */}
      <section className="mb-5">
        <AddProductForm onProductAdded={handleProductAdded} />
      </section>

      <hr className="my-5" />

      {/* --- SEKCJA PODGLĄDU SKLEPU --- */}
      <div className="row">
        <div className="col-md-12 mb-3">
            <h3>Podgląd Twojego Sklepu (Widok Klienta)</h3>
            <p className="text-muted">Poniżej widzisz produkty, które dodałeś do bazy.</p>
        </div>

        {/* Lista Produktów */}
        <div className="col-md-8">
          {/* refreshKey sprawia, że lista przeładuje się automatycznie po dodaniu gitary */}
          <ProductList key={refreshKey} onAddToCart={addToCart} />
        </div>

        {/* Koszyk */}
        <div className="col-md-4">
          <div className="card shadow-sm sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-light">
               Twój Testowy Koszyk
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