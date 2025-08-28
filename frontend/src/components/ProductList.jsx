// ELMAY-APP/frontend/src/components/ProductList.jsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ProductList.css';
import axios from 'axios'; // Usaremos axios para la llamada DELETE

// Usamos forwardRef para permitir que el componente padre acceda a funciones internas
const ProductList = forwardRef((props, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los productos del vendedor
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No autorizado, por favor inicia sesión.');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.get('http://localhost:5000/api/products/seller', config);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching seller products:', err);
      setError(err.response?.data?.message || 'Error al cargar los productos del vendedor.');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para eliminar un producto
  const handleDelete = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      if (!token) {
        alert('No autorizado, por favor inicia sesión.');
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/products/${productId}`, config);
      // Vuelve a cargar los productos después de eliminar uno
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // El array vacío asegura que la llamada se haga solo una vez al cargar el componente

  // Exponemos la función fetchProducts al componente padre
  useImperativeHandle(ref, () => ({
    fetchProducts
  }));

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <h2>Mis Productos</h2>
      {products.length === 0 ? (
        <p>Aún no tienes productos. ¡Añade uno para empezar!</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product._id} className="product-card">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="product-stock">Stock: {product.stock}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(product._id)}
                className="delete-button"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductList;