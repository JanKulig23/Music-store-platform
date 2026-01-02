import React, { useState } from 'react';
import ProductList from './modules/Catalog/ProductList';
import Cart from './modules/Cart/Cart';

function App() {
  //Stan koszyka
  const [cartItems, setCartItems] = useState([]);

  //Funkcja dodająca produkt do koszyka
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

  //Funkcja czyszcząca koszyk
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #eee", marginBottom: "20px", paddingBottom: "10px" }}>
        <h1> Music Store SaaS</h1>
      </header>
      
      <main style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        {/* LEWA KOLUMNA: Lista Produktów */}
        <div>
          <ProductList onAddToCart={addToCart} />
        </div>

        {/* PRAWA KOLUMNA: Koszyk */}
        <div style={{ borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
          <Cart items={cartItems} onClearCart={clearCart} />
        </div>
      </main>
    </div>
  )
}

export default App