import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState(''); 

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (isRegistering) {
        await api.post('/auth/register', {
          email: email,
          password: password,
          company_name: companyName
        });
        
        setSuccessMsg("🎉 Sklep otwarty! Teraz możesz się zalogować.");
        setIsRegistering(false); 
        setPassword(''); 

      } else {
        const response = await api.post('/auth/login', {
          email: email,
          password: password
        });
        
        // Zapisujemy token
        localStorage.setItem('token', response.data.access_token);
        
        // Przekierowanie do sklepu (wcześniej było /dashboard, teraz /store)
        navigate('/store');
      }
    } catch (err) {
      console.error(err);
      // Pobieramy ładny komunikat błędu z backendu, jeśli istnieje
      const msg = err.response?.data?.detail || "Wystąpił błąd połączenia.";
      setError(msg);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">
            {isRegistering ? "Otwórz Sklep 🚀" : "Panel Sklepu 🎸"}
        </h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* Pole Nazwa Firmy - widoczne tylko przy rejestracji */}
          {isRegistering && (
            <div className="mb-3">
              <label className="form-label">Nazwa Twojego Sklepu</label>
              <input 
                type="text" 
                className="form-control" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required={isRegistering} // Wymagane tylko przy rejestracji
                placeholder="np. Janusz Music"
              />
            </div>
          )}

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

          <button type="submit" className="btn btn-primary w-100 py-2">
            {isRegistering ? "Zarejestruj firmę" : "Zaloguj się"}
          </button>
        </form>

        <hr className="my-4" />

        <div className="text-center">
          <small className="text-muted">
            {isRegistering ? "Masz już konto?" : "Nie masz jeszcze sklepu?"}
          </small>
          <br />
          {/* Przycisk przełączający tryb */}
          <button 
            className="btn btn-link text-decoration-none"
            onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null); // Czyścimy błędy przy przełączaniu
                setSuccessMsg(null);
            }}
          >
            {isRegistering ? "Wróć do logowania" : "Załóż darmowe konto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;