// ELMAY-APP/frontend/src/pages/SellerPanel.jsx (MODIFICADO)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductList from '../components/ProductList.jsx';
import AddProductForm from '../components/AddProductForm.jsx';
import './SellerPanel.css';

function SellerPanel() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshList, setRefreshList] = useState(false); // Estado para forzar la recarga

    useEffect(() => {
        const checkAccessAndLoadUser = async () => {
            const userData = localStorage.getItem('user');
            if (!userData) {
                return navigate('/login');
            }

            const parsedUser = JSON.parse(userData);

            // 1. Verificar acceso haciendo una llamada a la API protegida
            try {
                const token = parsedUser.token; 
                
                // Intentar acceder a la ruta del dashboard de vendedor
                const response = await fetch('/api/users/dashboard', { 
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Acceso concedido por el backend (rol 'seller' o 'admin')
                    setUser(parsedUser);
                } else if (response.status === 403) {
                    // Acceso denegado (rol incorrecto o no admin)
                    navigate('/'); // Redirigir a la página principal
                } else if (response.status === 401) {
                    // Token inválido o expirado
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    // Otro error
                    throw new Error('Error al verificar el acceso al panel');
                }
                
            } catch (error) {
                console.error('Error de acceso al panel de vendedor:', error);
                navigate('/');
            }
        };

        checkAccessAndLoadUser();
    }, [navigate]);

    // Esta función se llama desde el modal cuando un producto se crea con éxito
    const handleProductCreated = () => {
        setIsModalOpen(false); // Cierra el modal
        setRefreshList(prev => !prev); // Alterna el estado para forzar la recarga de ProductList
    };
  
    // Función para recargar la lista de productos tras una actualización (status/oferta)
    const handleProductUpdated = () => {
        setRefreshList(prev => !prev);
    };

    if (!user) {
        return <div>Cargando...</div>;
    }
  
    const isAdmin = user.role === 'admin';

    return (
        <div className="seller-panel-container">
            <div className="seller-panel-card">
                <h1>Panel de Vendedor</h1>
                <p>Bienvenido, {user.name}!</p>
                <p>Aquí podrás gestionar tus productos y ventas.</p>

                {/* Botón para abrir el modal */}
                <button className="add-product-button" onClick={() => setIsModalOpen(true)}>
                    Añadir Producto
                </button>

                {/* Usa tu componente AddProductForm como un modal */}
                <AddProductForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onProductCreated={handleProductCreated}
                />

                <ProductList 
                    key={refreshList} 
                    isAdmin={isAdmin} 
                    onProductUpdated={handleProductUpdated}
                />
            </div>
        </div>
    );
}

export default SellerPanel;