import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage'; // Importujemy Twój przeniesiony sklep

// Strażnik: Jak nie masz tokena, wyjazd do logowania
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ścieżka publiczna - Logowanie */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Ścieżka chroniona - Twój Sklep */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;