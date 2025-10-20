// ELMAY-APP/frontend/src/components/EditProductForm.jsx (FINAL CORREGIDO a Vista In-line)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProductForm.css'; 
import ReactDOM from 'react-dom'; // 🟢 VUELVE ReactDOM para renderizar el modal en un portal

// =================================================================
// FUNCIÓN DE UTILIDAD CONSISTENTE PARA OBTENER DATOS DE USUARIO
// =================================================================
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al parsear el usuario de localStorage:", e);
        return null;
    }
};
// =================================================================

// Definición de las categorías principales y sus subcategorías (Se mantienen)
const MAIN_CATEGORIES = ['Electrónica', 'Hogar', 'Streaming', 'Alimentos', 'Herramientas'];
const SUBCATEGORIES_MAP = {
  'Electrónica': ['Mouse', 'RAM', 'Disco Duro', 'Teclado', 'Smartphones', 'Televisores', 'Audio'],
  'Hogar': ['Muebles', 'Decoración', 'Cocina', 'Limpieza'],
  'Streaming': ['Suscripciones', 'Dispositivos de Transmisión', 'Accesorios'],
  'Alimentos': ['Perecederos', 'Snacks', 'Bebidas'],
  'Herramientas': ['Manuales', 'Eléctricas', 'Jardinería'],
};

// =================================================================
// 🟢 COMPONENTE PRINCIPAL DE EDICIÓN
// =================================================================
function EditProductForm({ isOpen, onClose, productToEdit, onProductUpdated }) {
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    // 🎯 INICIALIZACIÓN DEL ESTADO CON EL PRODUCTO RECIBIDO
    const [productData, setProductData] = useState(productToEdit); 
    // 🎯 VISTA PREVIA DE IMAGEN
    const [previewUrl, setPreviewUrl] = useState(productToEdit?.imageUrl || '');

    // Efecto para sincronizar si el productoToEdit cambia desde el padre
    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
            setPreviewUrl(productToEdit.imageUrl || '');
        }
    }, [productToEdit]);


    if (!isOpen) {
        return null;
    }

    const availableSubcategories = SUBCATEGORIES_MAP[productData.category] || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'category') {
            setProductData(prev => ({
                ...prev,
                category: value,
                subcategory: '' // Reset subcategory when category changes
            }));
        } else {
            setProductData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
        
        // Lógica para actualizar la vista previa de la imagen
        if (name === 'imageUrl') {
            setPreviewUrl(value);
        }
    };
    
    // Manejo de error de carga de imagen para mostrar un mensaje si la URL falla
    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = "https://via.placeholder.com/150?text=URL+Inv%C3%A1lida"; 
        e.target.alt = "Imagen no disponible";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const userData = getUserData();
        const token = userData?.token;

        if (!token) {
            setMessage('Error: No autorizado. Por favor, inicia sesión para editar productos.');
            setLoading(false);
            onClose(); 
            return;
        }

        // Validación básica
        if (!productData.name || !productData.category || !productData.description || !productData.price || !productData.imageUrl || !productData.stock) {
            setMessage('Error: Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        if (availableSubcategories.length > 0 && !productData.subcategory) {
            setMessage('Error: Selecciona una subcategoría para la categoría elegida.');
            setLoading(false);
            return;
        }
        
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };
            
            // SOLICITUD PUT A LA RUTA DE PRODUCTOS
            const response = await axios.put(`/api/products/${productToEdit._id}`, productData, config);

            setMessage(`Producto "${response.data.name}" actualizado con éxito!`);
            
            // 🎯 LLAMAR AL CALLBACK PARA ACTUALIZAR LA LISTA EN EL PADRE
            if (onProductUpdated) {
                onProductUpdated(response.data);
            }
            
            // Cerrar después de un tiempo o dejar que el padre lo cierre.
            setTimeout(onClose, 1000); 

        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setMessage('Error: No tienes permiso o la sesión expiró. Vuelve a iniciar sesión.');
                localStorage.removeItem('user'); 
            } else {
                setMessage(`Error al actualizar el producto: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 🟢 Renderizado del Modal usando ReactDOM.createPortal
    return ReactDOM.createPortal(
        <div className="add-product-modal-overlay"> 
          <div className="add-product-modal-content">
            <div className="edit-product-form">
              <div className="form-header">
                <h2>Editar Producto: {productToEdit.name}</h2>
                <button className="add-product-close-button" onClick={onClose}>&times;</button>
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
                
                {/* ESTRUCTURA DE FILA PARA CATEGORÍA Y SUBCATEGORÍA */}
                <div className="form-row">
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
                    <div className="form-group">
                        <label htmlFor="subcategory">Subcategoría</label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={productData.subcategory}
                            onChange={handleInputChange}
                            required={availableSubcategories.length > 0} 
                            disabled={availableSubcategories.length === 0} 
                        >
                            <option value="">
                                {availableSubcategories.length > 0 ? 'Selecciona una Subcategoría' : 'N/A o Selecciona Categoría'}
                            </option>
                            {availableSubcategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
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
                
                {/* ESTRUCTURA DE FILA PARA URL DE IMAGEN Y VISTA PREVIA */}
                <div className="form-row image-preview-row">
                    <div className="form-group image-url-input">
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
                    
                    {/* Contenedor de Vista Previa */}
                    <div className="image-preview-container">
                        {previewUrl ? (
                            <img 
                                src={previewUrl} 
                                alt="Vista previa del producto"
                                className="image-preview"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="image-placeholder">
                                Vista Previa (150x150)
                            </div>
                        )}
                    </div>
                </div>

                {/* ESTRUCTURA DE FILA PARA PRECIO Y STOCK */}
                <div className="form-row">
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
                </div>
                
                <button
                    type="submit"
                    className="submit-button update-button"
                    disabled={loading || (availableSubcategories.length > 0 && !productData.subcategory)} 
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
              {message && (
                <p className={`message ${message.startsWith('Error') ? 'error-message' : 'success-message'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>,
        // Usamos el cuerpo del documento para montar el modal
        document.body 
    );
}

export default EditProductForm;