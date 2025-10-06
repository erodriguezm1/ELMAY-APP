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
      // Lógica para mostrar la Mega Oferta solo una vez por sesión de navegador
      const hasSeenOffer = localStorage.getItem('hasSeenMegaOffer');
      if (!hasSeenOffer) {
        setShowMegaOffer(true);
        // Marcamos que ya la vio para no mostrarla en recargas o navegaciones futuras
        localStorage.setItem('hasSeenMegaOffer', 'true');
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
