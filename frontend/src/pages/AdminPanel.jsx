// ELMAY-APP/frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Redirigir al login si no hay datos de usuario
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error);
      navigate('/login');
    }
  }, [navigate]);

  const onLogout = () => {
    localStorage.removeItem('user');
    navigate('/'); // Redirige a la página principal pública al cerrar sesión
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user.name}!</p>
        <p>Aquí podrás gestionar los productos de la tienda.</p>
        <button onClick={onLogout}>Cerrar Sesión</button>
      </div>
    </div>
  );
}

export default AdminPanel;
