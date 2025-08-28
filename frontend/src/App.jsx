// ELMAY-APP/frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Importa los componentes de las páginas
import Home from './pages/Home';
import Login from './pages/Login';

// Importa tus componentes universales (como Header y Footer)
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import SellerPanel from './pages/SellerPanel.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error al parsear los datos del usuario en App.jsx:", error);
      setUser(null);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  return (
    <Router>
      <Header user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminPanel user={user} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/seller" 
          element={
            <PrivateRoute allowedRoles={['seller', 'admin']}>
              <SellerPanel user={user} />
            </PrivateRoute>
          } 
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
