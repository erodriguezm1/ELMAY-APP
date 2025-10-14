// ELMAY-APP/frontend/src/pages/AdminPanel.jsx (MODIFICADO)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import AdminUserPanel from '../components/AdminUserPanel';
import Header from '../components/Header';

function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAccessAndLoadUser = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            return navigate('/login');
        }

        const parsedUser = JSON.parse(userData);

        // 1. Verificar acceso con una llamada a la API protegida
        try {
            const token = parsedUser.token; 
            
            // Intentar acceder a la ruta del panel de administrador
            const response = await fetch('/api/users/admin', { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Acceso concedido por el backend (rol 'admin')
                setUser(parsedUser);
            } else if (response.status === 403) {
                // Acceso denegado (rol incorrecto, no admin)
                navigate('/'); // Redirigir a la página principal
            } else if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                // Otro error
                throw new Error('Error al verificar el acceso al panel de admin');
            }
            
        } catch (error) {
            console.error('Error de acceso al panel de administrador:', error);
            navigate('/');
        }
    };

    checkAccessAndLoadUser();
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