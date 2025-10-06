import React, { useState } from 'react';
import './AddProductForm.css'; // Solución: El CSS ahora existe
import axios from 'axios'; // Usaremos axios por su simplicidad

// Definición de las categorías principales y sus subcategorías
const MAIN_CATEGORIES = ['Electrónica', 'Hogar', 'Streaming', 'Alimentos', 'Herramientas'];

// Mapeo de subcategorías basado en el ejemplo que proporcionaste
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

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // Maneja los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si la categoría cambia, reseteamos la subcategoría
    if (name === 'category') {
        setProductData({
            ...productData,
            [name]: value,
            subcategory: '', // Importante: Resetear subcategoría al cambiar la principal
        });
    } else {
        setProductData({
            ...productData,
            [name]: value,
        });
    }
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

    // Asegurarse de que el precio y el stock sean números (ya que se envían como strings del input)
    const payload = {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10)
    };
    
    // Si la categoría seleccionada no tiene subcategorías, aseguramos que el campo subcategory no se envíe vacío si es innecesario.
    const hasSubcategories = SUBCATEGORIES_MAP[productData.category] && SUBCATEGORIES_MAP[productData.category].length > 0;
    
    if (!hasSubcategories) {
        // Enviar solo la categoría principal si no hay subcategorías
        delete payload.subcategory;
    }


    try {
      const response = await axios.post('http://localhost:5000/api/products', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });

      if (response.status === 201) {
        setMessage('Producto agregado con éxito.');
        setProductData({
          name: '',
          category: '',
          subcategory: '', // Resetear subcategoría
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

  // Obtiene las subcategorías disponibles para la categoría seleccionada
  const availableSubcategories = SUBCATEGORIES_MAP[productData.category] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="add-product-form">
          <h2>Agregar Nuevo Producto</h2>
          <form onSubmit={handleSubmit}>
            
            {/* CAMPO: NOMBRE */}
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
            
            {/* CAMPO: CATEGORÍA PRINCIPAL (SELECT) */}
            <div className="form-group">
              <label htmlFor="category">Categoría Principal</label>
              <select
                id="category"
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Selecciona una categoría</option>
                {MAIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* CAMPO: SUBCATEGORÍA (SELECT CONDICIONAL) */}
            {productData.category && availableSubcategories.length > 0 && (
                <div className="form-group">
                    <label htmlFor="subcategory">Subcategoría</label>
                    <select
                        id="subcategory"
                        name="subcategory"
                        value={productData.subcategory}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="" disabled>Selecciona una subcategoría</option>
                        {availableSubcategories.map((subcat) => (
                            <option key={subcat} value={subcat}>{subcat}</option>
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
                rows="3"
                required
              ></textarea>
            </div>
            
            {/* CAMPO: PRECIO */}
            <div className="form-group">
              <label htmlFor="price">Precio ($)</label>
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
            
            {/* CAMPO: URL IMAGEN */}
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
              // Deshabilitar si se requiere subcategoría y no ha sido seleccionada
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