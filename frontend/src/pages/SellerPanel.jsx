// ELMAY-APP/frontend/src/pages/SellerPanel.jsx

// ELMAY-APP/frontend/src/pages/SellerPanel.jsx

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
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'seller' && parsedUser.role !== 'admin') {
          navigate('/');
        }
        setUser(parsedUser);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al parsear los datos del usuario:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Esta función se llama desde el modal cuando un producto se crea con éxito
  const handleProductCreated = () => {
    setIsModalOpen(false); // Cierra el modal
    setRefreshList(prev => !prev); // Alterna el estado para forzar la recarga de ProductList
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

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

        {/*
          ProductList se recarga cuando refreshList cambia.
          El cambio de `key` fuerza a React a "re-montar" el componente,
          ejecutando de nuevo su `useEffect` para obtener los datos más recientes.
        */}
        <ProductList key={refreshList} />
      </div>
    </div>
  );
  
}

export default SellerPanel;
