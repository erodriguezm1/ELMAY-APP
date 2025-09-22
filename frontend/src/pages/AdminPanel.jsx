// ELMAY-APP/frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import AdminUserPanel from '../components/AdminUserPanel';
import Header from '../components/Header';

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
        <AdminUserPanel/>
      </div>
    </div>
  );
}

export default AdminPanel;
