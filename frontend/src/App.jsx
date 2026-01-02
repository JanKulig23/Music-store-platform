import ProductList from './modules/catalog/ProductList';

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #eee", marginBottom: "20px", paddingBottom: "10px" }}>
        <h1>🎸 Music Store SaaS</h1>
      </header>
      
      <main>
        <ProductList />
      </main>
    </div>
  )
}

export default App