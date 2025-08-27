// ELMAY-APP/frontend/src/pages/SellerPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import './SellerPanel.css'; // Crearás este archivo CSS a continuación

function SellerPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Opcional: Redirige si el usuario no tiene el rol de vendedor
        if (parsedUser.role !== 'seller' && parsedUser.role !== 'admin') {
          navigate('/');
        }
        setUser(parsedUser);
      } else {
        // Redirige al login si no hay datos de usuario
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error);
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="seller-panel-container">
      <div className="seller-panel-card">
        <h1>Panel de Vendedor</h1>
        <p>Bienvenido, {user.name}!</p>
        <p>Aquí podrás gestionar tus productos y ventas.</p>
        {/* Aquí puedes agregar la lógica para mostrar los productos del vendedor */}
      </div>
    </div>
  );
}

export default SellerPanel;