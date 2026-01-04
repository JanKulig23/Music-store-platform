import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // FastAPI wymaga danych jako "form-data", a nie JSON
    const formData = new FormData();
    formData.append('username', email); // FastAPI domyślnie szuka pola 'username'
    formData.append('password', password);

    try {
      const response = await api.post('/auth/login', formData);
      
      // Sukces! Zapisujemy token w przeglądarce
      localStorage.setItem('token', response.data.access_token);
      
      // Przekierowujemy do panelu głównego
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Nieprawidłowy email lub hasło.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Panel Sklepu 🎸</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Hasło</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-100">
            Zaloguj się
          </button>
        </form>
        <div className="text-center mt-3">
          <small className="text-muted">Nie masz konta? Użyj API do rejestracji.</small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;