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
import SessionTimeout from './components/SessionTimeout';

function App() {
  const [user, setUser] = useState(null);

  const isTokenValid = (token) => {
    return !!token;
  };


  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');
      if (userData && isTokenValid(authToken)) {
        setUser(JSON.parse(userData));
      } else {
        // Si el token es inválido o no existe, cierra la sesión.
        onLogout();
      }
    } catch (error) {
      console.error("Error al parsear los datos del usuario en App.jsx:", error);
      setUser(null);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };
  return (
    <Router>
      <SessionTimeout />
      <Header user={user} onLogout={onLogout} />
      <main className="main-content">
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
        <script src="//code.tidio.co/cnpkfi4vnh0h2cauzgtxggyvrucrbi0z.js" async></script>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
