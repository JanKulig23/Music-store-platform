import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage';
import HomePage from './pages/HomePage'; // <--- Nowy import

// Strażnik (bez zmian)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Strona Główna (Dla Klienta - Publiczna) */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Logowanie i Rejestracja (Dla Właściciela) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 3. Panel Zarządzania (Dla Właściciela - Chroniony) */}
        <Route 
          path="/store" 
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Przekierowania */}
        <Route path="/dashboard" element={<Navigate to="/store" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;