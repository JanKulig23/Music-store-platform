import React, { useState } from 'react';
import api from '../../api'; // Używamy naszego api z tokenem

const AddProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sku: '',
    tenant_id: 0, // Backend i tak to nadpisze, ale musi być w JSON
    global_ref_id: null
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Wysyłamy dane do backendu (token leci automatycznie dzięki api.js)
      await api.post('/catalog/local/', {
        ...formData,
        price: parseFloat(formData.price) // Cena musi być liczbą
      });

      setMessage({ type: 'success', text: 'Produkt dodany pomyślnie!' });
      
      // Czyścimy formularz
      setFormData({ name: '', price: '', description: '', sku: '', tenant_id: 0, global_ref_id: null });
      
      // Odświeżamy listę produktów na stronie głównej
      if (onProductAdded) onProductAdded();

    } catch (error) {
      console.error(error);
      setMessage({ type: 'danger', text: 'Błąd podczas dodawania produktu.' });
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-primary">
      <div className="card-header bg-primary text-white">
        🛠️ Panel Właściciela: Dodaj nowy produkt
      </div>
      <div className="card-body">
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nazwa Produktu</label>
            <input name="name" value={formData.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-3">
            <label className="form-label">Cena (PLN)</label>
            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-3">
            <label className="form-label">SKU (Kod)</label>
            <input name="sku" value={formData.sku} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-12">
            <label className="form-label">Opis</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="2"></textarea>
          </div>
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-success">➕ Dodaj do sklepu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;