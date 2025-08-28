// ELMAY-APP/frontend/src/components/AddProductForm.jsx

import React, { useState } from 'react';
import './AddProductForm.css'; // Mantenemos el archivo de estilos
import axios from 'axios'; // Usaremos axios por su simplicidad

function AddProductForm({ isOpen, onClose, onProductCreated }) {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
  });
  const [message, setMessage] = useState('');

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // Maneja los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  // Maneja el envío del formulario a la API del backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const token = localStorage.getItem('authToken');

    if (!token) {
      setMessage('Error: No se encontró el token de autenticación. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', productData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });

      if (response.status === 201) {
        setMessage('Producto agregado con éxito.');
        setProductData({
          name: '',
          description: '',
          price: '',
          imageUrl: '',
          stock: '',
        });
        // Llama a la función del padre para cerrar el modal y recargar la lista
        if (onProductCreated) {
          onProductCreated();
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error desconocido al agregar el producto.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="add-product-form">
          <h2>Agregar Nuevo Producto</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                rows="3"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="price">Precio</label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="imageUrl">URL de la Imagen</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={productData.imageUrl}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={productData.stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </button>
          </form>
          {message && (
            <p className={`message ${message.startsWith('Error') ? 'error-message' : 'success-message'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddProductForm;