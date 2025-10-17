// ELMAY-APP/frontend/src/pages/AdminPanel.jsx (REFACTORIZADO)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import AdminUserPanel from '../components/AdminUserPanel';
// El Header ya está en App.jsx, se remueve

function AdminPanel({ user }) { 
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let currentUser = user;
    
    // Si el usuario no se pasó como prop, lo cargamos de localStorage
    if (!currentUser) {
        const userData = localStorage.getItem('user');
        if (!userData) {
            return navigate('/login');
        }
        currentUser = JSON.parse(userData);
    }
    
    // Verificamos el rol localmente
    if (currentUser.role !== 'admin') {
        navigate('/'); 
    } else {
        setIsAdmin(true);
    }

    // Lógica para verificar acceso con llamada a la API protegida (por seguridad)
    const checkAccess = async (token) => {
        try {
            const response = await fetch('/api/users/admin', { 
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 403) {
                navigate('/'); // Acceso denegado (no admin)
            } else if (response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            } else if (!response.ok) {
                throw new Error('Error al verificar el acceso al panel de admin');
            }
            
        } catch (error) {
            console.error('Error de acceso al panel de administrador:', error);
            navigate('/');
        }
    };
    
    if (currentUser && currentUser.token) {
        checkAccess(currentUser.token);
    }

  }, [navigate, user]); 

  if (!isAdmin) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {user?.name}. Gestiona los roles y estados de los usuarios del sistema.</p>
        <AdminUserPanel/>
      </div>
    </div>
  );
}

export default AdminPanel;