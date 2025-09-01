// ELMAY-APP/frontend/src/components/ProductList.jsx

import React, { useState, useEffect, forwardRef, useImperativeHandle, use } from 'react';
import './ProductList.css';
import axios from 'axios'; // Usaremos axios para la llamada DELETE
import {useNavigate} from "react-router-dom"; 
 
// Usamos forwardRef para permitir que el componente padre acceda a funciones internas
const ProductList = forwardRef((props, ref) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showAllProducts, setShowAllProducts] = useState(false);
  const user =JSON.parse(localStorage.getItem('user'));

  // Función para obtener los productos del vendedor
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
  
      if (!token) {
        setError('No autorizado, por favor inicia sesión.');
        setLoading(false);
        // Redirige al login si el token no es valido o caduco
        navigate("/login");
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const endpoint = (user?.role === 'admin' && showAllProducts)
        ? 'http://localhost:5000/api/products/all' // Endpoint para administradores
        : 'http://localhost:5000/api/products/seller'; // Endpoint para el vendedor logeado
      
      const response = await axios.get(endpoint, config);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status == 401) {
        // ERROR CRUCIAL:
        // Si la respuesta es 401, elimina el token y redirige al login
        localStorage.removeItem("authToken");
        navigate("/login");
        setError("La sesión ha expirado, por favor inicia sesión de nuevo.");
      } else {
      console.error('Error fetching seller products:', err);
      setError(err.response?.data?.message || 'Error al cargar los productos del vendedor.');
      }
      console.error("Error fetching seller products:", err);
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
  }, [showAllProducts]); // El hook se ejecuta cuando cambia showAllProducts

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
      <h2 className="text-2xl font-bold mb-4">
        {user?.role === 'admin' && showAllProducts ? 'Todos los Productos' : 'Mis Productos'}
      </h2>

      {user?.role === 'admin' && (
        <button
          onClick={() => setShowAllProducts(!showAllProducts)}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors mb-4"
        >
          {showAllProducts ? 'Mostrar mis productos' : 'Mostrar todos los productos'}
        </button>
      )}
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
                <p className="product-creator">Creado por: {product.seller.name}</p>
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