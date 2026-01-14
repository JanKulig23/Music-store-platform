import React, { useEffect, useState } from 'react';
import api from '../../api';

const GlobalCatalog = ({ onImportSuccess }) => {
  const [globalProducts, setGlobalProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Pobieramy produkty z bazy globalnej
  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const response = await api.get('/catalog/global/');
        setGlobalProducts(response.data);
      } catch (err) {
        console.error("Błąd hurtowni:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobal();
  }, []);

  // 2. Funkcja importu (To jest kluczowe!)
  const handleImport = async (globalProduct) => {
    try {
      // Wysyłamy do Twojego endpointu "local", ale wypełniamy go danymi z "global"
      // Zwróć uwagę na global_ref_id!
      const payload = {
        name: globalProduct.name,
        description: globalProduct.base_description,
        price: 0, // Cenę ustala sklep, więc domyślnie 0 lub do edycji
        sku: globalProduct.ean_code, 
        tenant_id: 0, 
        global_ref_id: globalProduct.global_id // <--- TWORZYMY POWIĄZANIE
      };

      await api.post('/catalog/local/', payload);
      alert(`✅ Zaimportowano: ${globalProduct.name}. Ustal teraz jego cenę w swoim sklepie!`);
      
      if (onImportSuccess) onImportSuccess(); // Odświeżamy listę w sklepie
      
    } catch (err) {
      alert("Błąd importu. Może już masz ten produkt?");
      console.error(err);
    }
  };

  if (loading) return <div>Ładowanie hurtowni...</div>;

  return (
    <div className="card border-warning mb-4">
      <div className="card-header bg-warning text-dark fw-bold">
        🌍 Hurtownia Centralna (Dostępne produkty)
      </div>
      <div className="card-body">
        <p className="small text-muted">Kliknij "Importuj", aby dodać produkt do swojej oferty bez wpisywania danych ręcznie.</p>
        <div className="table-responsive">
            <table className="table table-sm table-hover">
            <thead>
                <tr>
                <th>Nazwa</th>
                <th>Kategoria</th>
                <th>Opis</th>
                <th>Akcja</th>
                </tr>
            </thead>
            <tbody>
                {globalProducts.map(gp => (
                <tr key={gp.global_id}>
                    <td>{gp.name}</td>
                    <td><span className="badge bg-secondary">{gp.category}</span></td>
                    <td className="small">{gp.base_description}</td>
                    <td>
                    <button 
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleImport(gp)}
                    >
                        📥 Importuj
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalCatalog;