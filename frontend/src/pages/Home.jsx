// ELMAY-APP/frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  // Estado para guardar la lista de productos
  const [products, setProducts] = useState([]);
  // Estado para manejar si los datos están cargando
  const [loading, setLoading] = useState(true);
  // Estado para manejar si hay un error
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función asíncrona para obtener los productos del backend
    const fetchProducts = async () => {
      try {
        setLoading(true); // Inicia el estado de carga
        // Llama a la ruta pública de la API. No se necesita un token aquí.
        const response = await fetch('http://localhost:5000/api/products');

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setProducts(data); // Actualiza el estado con los productos recibidos
        setError(null);    // Limpia cualquier error anterior
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchProducts();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente

  // Muestra un mensaje de carga mientras se obtienen los productos
  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  // Muestra un mensaje de error si la llamada a la API falla
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <h1 className="main-title">Bienvenido a la tienda</h1>
      {products.length === 0 ? (
        <p>No hay productos disponibles en este momento.</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;