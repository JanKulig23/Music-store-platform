import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StorePage from './pages/StorePage';
import HomePage from './pages/HomePage';

// --- NOWY IMPORT ---
import OwnerOrderManager from './modules/Orders/OwnerOrderManager';

// Strażnik (bez zmian - chroni panel właściciela)
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
        
        {/* 3. Panel Zarządzania Sklepem (Dla Właściciela - Chroniony) */}
        <Route 
          path="/store" 
          element={
            <ProtectedRoute>
              <StorePage />
            </ProtectedRoute>
          } 
        />

        {/* 4. [NOWE] Zarządzanie Zamówieniami (Dla Właściciela - Chronione) */}
        <Route 
          path="/manage-orders" 
          element={
            <ProtectedRoute>
              <OwnerOrderManager />
            </ProtectedRoute>
          } 
        />
        
        {/* Przekierowania */}
        <Route path="/dashboard" element={<Navigate to="/store" replace />} />
        
        {/* Catch-all: Jak nie znajdzie trasy, wraca na stronę główną */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;