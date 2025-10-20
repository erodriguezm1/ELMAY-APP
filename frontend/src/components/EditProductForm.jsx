// ELMAY-APP/frontend/src/components/EditProductForm.jsx (FINAL CORREGIDO a Vista In-line)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🛑 ReactDOM ya no se necesita.
import './EditProductForm.css'; 

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

const initialProductData = {
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    imageUrl: '',
    stock: 0,
};

// 🛑 ELIMINAR: la prop 'isOpen'.
function EditProductForm({ onClose, product, onProductUpdated }) {
    
    // Si no hay producto, no renderizar (el padre debe asegurar que esto no suceda, pero es una protección)
    if (!product) {
        return null; 
    }
    
    const [productData, setProductData] = useState(initialProductData);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const userData = getUserData();
    const availableSubcategories = productData.category ? SUBCATEGORIES_MAP[productData.category] || [] : [];
    
    // Llenar el formulario cuando la prop 'product' cambie
    useEffect(() => {
        if (product) {
            setProductData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || 0,
                category: product.category || '',
                subcategory: product.subcategory || '',
                imageUrl: product.imageUrl || '',
                stock: product.stock || 0,
            });
            setMessage(''); // Limpiar mensajes al cargar nuevo producto
        }
    }, [product]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'category') {
            setProductData(prev => ({
                ...prev,
                category: value,
                subcategory: ''
            }));
        } else {
            setProductData(prev => ({ 
                ...prev, 
                [name]: name === 'price' || name === 'stock' ? Number(value) : value 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // ... (Validación de datos)

        try {
            const token = userData?.token;
            if (!token) {
                setMessage('Error: Usuario no autenticado.');
                setLoading(false);
                return;
            }
            
            const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
            
            const dataToSend = {
                ...productData,
                subcategory: availableSubcategories.length === 0 ? undefined : productData.subcategory,
            };

            if (dataToSend.subcategory === '') {
                delete dataToSend.subcategory;
            }

            const response = await axios.put(`/api/products/${product._id}`, dataToSend, config);

            setMessage('¡Producto actualizado con éxito!');
            
            if (onProductUpdated) {
                onProductUpdated(response.data); 
            }

        } catch (err) {
            console.error('Error al actualizar producto:', err.response || err);
            const errorMessage = err.response?.data?.message || 'Error al actualizar el producto.';
            setMessage(`Error: ${errorMessage}`);
            setLoading(false);
        }
    };
    
    return (
        // 🛑 Se eliminan los contenedores modal-overlay y modal-content
        <div className="edit-product-form">
            <div className="form-header">
                <h2>Editar Producto: {product.name}</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            
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
                
                {/* CAMPO: CATEGORÍA */}
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
                        {MAIN_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* CAMPO: SUBCATEGORÍA (Condicional) */}
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
                            <option value="" disabled>Selecciona una subcategoría</option>
                            {availableSubcategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                )}

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
                    className="submit-button update-button"
                    disabled={loading || (productData.category && availableSubcategories.length > 0 && !productData.subcategory)} 
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
    );
}

export default EditProductForm;