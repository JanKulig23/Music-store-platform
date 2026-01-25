import React, { useEffect, useState } from 'react';
import api from '../../api';

const GlobalCatalog = ({ onImportSuccess }) => {
  const [globalProducts, setGlobalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINACJA I WYSZUKIWANIE ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");     // To co wpisuje user
  const [activeSearch, setActiveSearch] = useState(""); // To co wysyłamy do API po kliknięciu Szukaj
  
  const LIMIT = 15; // Ilość wierszy w tabeli na stronę

  // 1. Pobieramy produkty z bazy globalnej (z paginacją)
  useEffect(() => {
    const fetchGlobal = async () => {
      setLoading(true);
      try {
        // Budujemy URL
        let url = `/catalog/global/?page=${page}&limit=${LIMIT}`;
        if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;

        const response = await api.get(url);
        
        // Obsługa nowej struktury odpowiedzi { total, products }
        if (response.data.products) {
            setGlobalProducts(response.data.products);
            setTotalPages(Math.ceil(response.data.total / LIMIT));
        } else {
            // Fallback (gdyby API stare)
            setGlobalProducts(response.data);
        }
      } catch (err) {
        console.error("Błąd hurtowni:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobal();
  }, [page, activeSearch]); // Odśwież jak zmieni się strona lub wyszukiwanie

  // Obsługa przycisku Szukaj
  const handleSearchSubmit = (e) => {
      e.preventDefault();
      setPage(1); // Reset do 1 strony
      setActiveSearch(searchTerm);
  };

  // 2. Funkcja importu
  const handleImport = async (globalProduct) => {
    try {
      const payload = {
        name: globalProduct.name,
        description: globalProduct.base_description,
        price: 0, 
        sku: globalProduct.ean_code, 
        tenant_id: 0, 
        global_ref_id: globalProduct.global_id 
      };

      await api.post('/catalog/local/', payload);
      alert(`✅ Zaimportowano: ${globalProduct.name}.`);
      
      if (onImportSuccess) onImportSuccess(); 
      
    } catch (err) {
      alert("Błąd importu. Może już masz ten produkt?");
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  }

  return (
    <div className="card border-warning mb-4 shadow-sm">
      <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
        <span>🌍 Hurtownia Centralna (Katalog)</span>
      </div>
      
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <p className="small text-muted mb-0">Wyszukaj produkt i kliknij "Importuj", aby dodać go do oferty.</p>
            
            {/* --- PASEK WYSZUKIWANIA --- */}
            <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <input 
                    type="text" 
                    className="form-control form-control-sm"
                    placeholder="Nazwa lub EAN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{minWidth: '200px'}}
                />
                <button type="submit" className="btn btn-dark btn-sm">Szukaj</button>
                {activeSearch && (
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setSearchTerm(""); setActiveSearch(""); setPage(1); }}>✕</button>
                )}
            </form>
        </div>

        {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
        ) : (
            <>
                <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                        <th>Nazwa Produktu</th>
                        <th>Kategoria</th>
                        <th>EAN / Kod</th>
                        <th style={{width: '100px'}}>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {globalProducts.length > 0 ? globalProducts.map(gp => (
                        <tr key={gp.global_id}>
                            <td className="fw-semibold">{gp.name}</td>
                            <td><span className="badge bg-secondary fw-normal">{gp.category}</span></td>
                            <td className="small font-monospace text-muted">{gp.ean_code}</td>
                            <td>
                            <button 
                                className="btn btn-sm btn-outline-success w-100"
                                onClick={() => handleImport(gp)}
                            >
                                📥 Importuj
                            </button>
                            </td>
                        </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center py-3 text-muted">Brak wyników wyszukiwania</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>

                {/* --- PAGINACJA --- */}
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-3">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page - 1)}>&laquo;</button>
                            </li>
                            <li className="page-item disabled"><span className="page-link text-dark fw-bold">Strona {page} z {totalPages}</span></li>
                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page + 1)}>&raquo;</button>
                            </li>
                        </ul>
                    </nav>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default GlobalCatalog;