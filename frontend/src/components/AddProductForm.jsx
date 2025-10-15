import React, { useState } from 'react';
import './AddProductForm.css'; 
import axios from 'axios'; 

// =================================================================
// 🟢 FUNCIÓN DE UTILIDAD CONSISTENTE PARA OBTENER DATOS DE USUARIO
// =================================================================
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        // Si userData existe, parseamos y devolvemos el objeto completo
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al parsear el usuario de localStorage:", e);
        // Opcional: Limpiar el almacenamiento local si el objeto está corrupto
        localStorage.removeItem('user'); 
        return null;
    }
};
// =================================================================


// Definición de las categorías principales y sus subcategorías
const MAIN_CATEGORIES = ['Electrónica', 'Hogar', 'Streaming', 'Alimentos', 'Herramientas'];

// Mapeo de subcategorías
const SUBCATEGORIES_MAP = {
  'Electrónica': ['Mouse', 'RAM', 'Disco Duro', 'Teclado', 'Smartphones', 'Televisores', 'Audio'],
  'Hogar': ['Muebles', 'Decoración', 'Cocina', 'Limpieza'],
  'Streaming': ['Suscripciones', 'Dispositivos de Transmisión', 'Accesorios'],
  'Alimentos': ['Perecederos', 'Snacks', 'Bebidas'],
  'Herramientas': ['Manuales', 'Eléctricas', 'Jardinería'],
};

function AddProductForm({ isOpen, onClose, onProductCreated }) {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    category: '', // Ahora es la categoría principal
    subcategory: '', // Nuevo campo para la subcategoría
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
  });
  const [message, setMessage] = useState('');

  // Si el modal no está abierto, no renderizamos nada para optimizar
  if (!isOpen) {
    return null;
  }

  // Lógica para determinar subcategorías disponibles
  const availableSubcategories = SUBCATEGORIES_MAP[productData.category] || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia la categoría principal, limpiamos la subcategoría
    if (name === 'category') {
      setProductData(prev => ({
        ...prev,
        category: value,
        subcategory: '' // Resetear subcategoría
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 🟢 FUNCIÓN DE SUBMISIÓN CORREGIDA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 🟢 1. OBTENER TOKEN DE FORMA CONSISTENTE
    const userData = getUserData();
    const token = userData?.token;

    if (!token) {
        // 🔴 Manejar el error si no hay token (usuario no autenticado)
        setMessage('Error: No autorizado. Por favor, inicia sesión para añadir productos.');
        setLoading(false);
        onClose(); // Cerrar el formulario si no hay token
        return;
    }

    // Validación básica de campos obligatorios
    if (!productData.name || !productData.category || !productData.description || !productData.price || !productData.imageUrl || !productData.stock) {
      setMessage('Error: Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }

    // Validación de subcategoría
    if (availableSubcategories.length > 0 && !productData.subcategory) {
        setMessage('Error: Selecciona una subcategoría para la categoría elegida.');
        setLoading(false);
        return;
    }
    
    try {
        // 🟢 2. INCLUIR EL TOKEN EN LOS HEADERS DE LA CONFIGURACIÓN
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // ¡Añadido el token!
            },
        };
        
        // Llamada a la API de creación de producto (asumiendo que es /api/products)
        const response = await axios.post('/api/products', productData, config);

        setMessage(`Producto "${response.data.name}" agregado con éxito!`);
        
        // Limpiar el formulario
        setProductData({
            name: '', category: '', subcategory: '', description: '',
            price: '', imageUrl: '', stock: ''
        });
        
        // Llamar a la función del padre para notificar la creación y actualizar la lista
        if (onProductCreated) {
            onProductCreated(response.data);
        }

    } catch (error) {
        // Manejo de error 401/403 (No autorizado/Acceso denegado)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            setMessage('Error: No tienes permiso o la sesión expiró. Vuelve a iniciar sesión.');
            localStorage.removeItem('user'); // Limpiar token
        } else {
            setMessage(`Error al agregar el producto: ${error.response?.data?.message || error.message}`);
        }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="add-product-form">
          <div className="form-header">
            <h2>Añadir Nuevo Producto</h2>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* CAMPO: NOMBRE */}
            <div className="form-group">
              <label htmlFor="name">Nombre del Producto</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* CAMPO: CATEGORÍA PRINCIPAL */}
            <div className="form-group">
                <label htmlFor="category">Categoría Principal</label>
                <select
                    id="category"
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Selecciona una Categoría</option>
                    {MAIN_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* CAMPO: SUBCATEGORÍA (CONDICIONAL) */}
            {availableSubcategories.length > 0 && (
                <div className="form-group">
                    <label htmlFor="subcategory">Subcategoría</label>
                    <select
                        id="subcategory"
                        name="subcategory"
                        value={productData.subcategory}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Selecciona una Subcategoría</option>
                        {availableSubcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* CAMPO: DESCRIPCIÓN */}
            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* CAMPO: PRECIO */}
            <div className="form-group">
              <label htmlFor="price">Precio</label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            
            {/* CAMPO: URL DE IMAGEN */}
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
            
            {/* CAMPO: STOCK */}
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
              disabled={loading || (availableSubcategories.length > 0 && !productData.subcategory)} 
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