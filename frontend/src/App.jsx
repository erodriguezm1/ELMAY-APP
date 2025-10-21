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
import MegaOfferModal from './components/MegaOfferModal.jsx';
import ProductScreen from './screens/ProductScreen.jsx';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faTwitter, faInstagram, faGooglePlusG, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'; // Importa los iconos que necesites
import { faHeart } from '@fortawesome/free-solid-svg-icons'; // Importa los iconos de sólidos que necesites

// Añade los iconos a la librería global de Font Awesome
library.add(faFacebookF, faTwitter, faInstagram, faGooglePlusG, faLinkedinIn, faHeart);

function App() {
  const [user, setUser] = useState(null);

  const [showMegaOffer, setShowMegaOffer] = useState(false);

  // Datos de ejemplo para la mega oferta
  const megaOffer = {
    name: "Laptop Gamer Xtreme",
    oldPrice: "1,500.00",
    newPrice: "999.99",
    image: "https://placehold.co/400x160/FEE2E2/DC2626?text=OFERTA+33%25+OFF"
  };

  // 🟢 CORRECCIÓN: Función simplificada. La validación de expiración la hace el backend.
  const isTokenValid = (token) => {
    // Basta con verificar que el string del token exista. 
    // Los componentes protegidos (AdminPanel, SellerPanel) 
    // se encargarán de la validación de expiración llamando al backend.
    return !!token;
  };


  useEffect(() => {
    // 🟢 CORRECCIÓN: Sólo verificamos la clave 'user'
    const userData = localStorage.getItem('user');
    
    if (userData) {
        try {
            const parsedUser = JSON.parse(userData);
            
            // Verificar si el token existe dentro del objeto 'user'
            if (parsedUser.token && isTokenValid(parsedUser.token)) {
                // El usuario existe en localStorage y tiene un token. Establecer la sesión.
                setUser(parsedUser);
            } else {
                // El token no es válido o falta. Limpiar.
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch (e) {
            // Error al parsear JSON, limpiar sesión.
            console.error("Error al cargar la sesión desde localStorage:", e);
            localStorage.removeItem('user');
            setUser(null);
        }
    }
  }, []); // Se ejecuta solo al montar el componente

  const onLogout = () => {
    localStorage.removeItem('user'); // 🟢 CORRECCIÓN: Sólo elimina la clave única 'user'
    // localStorage.removeItem('token'); // ❌ SE ELIMINÓ
    setUser(null);
  };

  // Función para cerrar el modal de la oferta
  const handleCloseMegaOffer = () => {
    setShowMegaOffer(false);
  };

  return (
    <Router>
      {/* 1. Modal de Mega Oferta (Visible si showMegaOffer es true) */}
      <MegaOfferModal 
        show={showMegaOffer} 
        onClose={handleCloseMegaOffer} 
        offerDetails={megaOffer}
      />
      {/* NOTA: SessionTimeout debe usar el mismo estado 'user' si lo necesita */}
      <SessionTimeout user={user} onLogout={onLogout} /> 
      <div className="header-fixed-container"> 
        <Header user={user} onLogout={onLogout} />
      </div>
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
          <Route 
            path="/product/:id" 
            element={
              <ProductScreen />
            } 
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;