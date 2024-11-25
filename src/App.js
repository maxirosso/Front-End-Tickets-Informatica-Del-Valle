import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginRegisterForm from './LoginRegisterForm/LoginRegisterForm';
import TicketList from './TicketList/TicketList';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <h1>Manejo de Tickets</h1>
        {/* Show Logout button if authenticated */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            Cerrar Sesion
          </button>
        )}
        
        {/* Define routes */}
        <Routes>
          {/* Redirect to /login if not authenticated */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/tickets" /> : <Navigate to="/login" />}
          />
          {/* Login route */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginRegisterForm onLoginSuccess={handleLoginSuccess} isLogin={true} /> : <Navigate to="/tickets" />}
          />
          {/* Register route */}
          <Route
            path="/register"
            element={!isAuthenticated ? <LoginRegisterForm isLogin={false} /> : <Navigate to="/tickets" />}
          />
          {/* Ticket List route */}
          <Route
            path="/tickets"
            element={isAuthenticated ? <TicketList /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
