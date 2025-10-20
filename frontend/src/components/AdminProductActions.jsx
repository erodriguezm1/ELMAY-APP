import React, { useState } from 'react';
import axios from 'axios';
import './AdminProductActions.css'; 
// 🟢 IMPORTAR EL COMPONENTE DE EDICIÓN
import EditProductForm from '../components/EditProductForm'; 

// ===============================================================
// CONSTANTES PARA EL MANEJO DE ESTADOS (Sincronizado con el modelo)
// ===============================================================
const PRODUCT_STATUSES = ['active', 'suspended', 'deleted'];

// Función de utilidad para mostrar etiquetas amigables
const getStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return '✅ Activo (Visible)';
        case 'suspended':
            return '⚠️ Suspendido (Oculto)';
        case 'deleted':
            return '🗑️ Eliminado (No Mostrar)';
        default:
            return 'Estado Desconocido';
    }
};
// ===============================================================

// Usamos la URL por defecto para la API. 
const API_URL = '/api'; 

const AdminProductActions = ({ product, onUpdate }) => {
    if (!product) {
        return null; 
    }
    
    // Inicializar estados
    const [currentStatus, setCurrentStatus] = useState(product?.status || 'active'); 
    const [isOfferChecked, setIsOfferChecked] = useState(product?.isOffer || false);
    const [isMegaOfferChecked, setIsMegaOfferChecked] = useState(product?.isMegaOffer || false); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // 🎯 NUEVO ESTADO: Controla la apertura del modal de edición
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 


    // Obtiene el token del objeto de usuario en localStorage
    const getToken = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).token : null;
    };

    const handleUpdate = async (field, value) => {
        setLoading(true);
        setError('');
        setSuccess('');

        const token = getToken();
        if (!token) {
            setError('Usuario no autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const updateData = {
                [field]: value 
            };

            // SOLICITUD PUT AL BACKEND
            const { data } = await axios.put(
                `${API_URL}/products/${product._id}`,
                updateData,
                config
            );

            setSuccess(`'${field}' actualizado a: ${getStatusLabel(data.product[field]) || data.product[field]}.`);
            onUpdate(data.product); 
            
        } catch (err) {
            console.error('Error al actualizar el producto (Servidor):', err.response || err);
            const errorMessage = err.response?.status === 500 
                ? 'Error 500: Fallo interno del servidor. Revisa tu lógica de backend para la ruta PUT /api/products/:id.'
                : err.response?.data?.message || 'Error al actualizar el producto.';
                
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // 🎯 Función de manejo después de que el formulario de edición guarda los cambios
    const handleProductEdited = (updatedProduct) => {
        onUpdate(updatedProduct); // Refresca la lista en el componente padre
        setSuccess('Producto editado con éxito.');
        setIsEditModalOpen(false); // Cierra el modal
    };


    return (
        <div className="product-actions-container">
            
            <h4 className="action-title">
                Acciones de Administración (Solo Admin)
            </h4>
            
            {/* 🎯 BOTÓN DE EDICIÓN */}
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="action-button edit-button"
                disabled={loading}
            >
                ✏️ Editar Producto
            </button>
            
            {loading && (
                <div className="loading-overlay">
                    Actualizando...
                </div>
            )}
            
            {error && <p className="message error-message">{error}</p>}
            {success && <p className="message success-message">{success}</p>}

            {/* Selector de Status */}
            <div className="action-group status-group">
                <label className="status-label">
                    Estado del Producto:
                </label>
                <select
                    value={currentStatus}
                    onChange={(e) => {
                        const newStatus = e.target.value;
                        setCurrentStatus(newStatus);
                        handleUpdate('status', newStatus);
                    }}
                    className="status-select"
                    disabled={loading}
                >
                    {PRODUCT_STATUSES.map(status => (
                        <option key={status} value={status}>
                            {getStatusLabel(status)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Checkbox isOffer */}
            <div className="action-group checkbox-group">
                <input
                    type="checkbox"
                    id={`isOffer-${product._id}`}
                    checked={isOfferChecked}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsOfferChecked(isChecked);
                        handleUpdate('isOffer', isChecked);
                    }}
                    className="checkbox-input"
                    disabled={loading}
                />
                <label htmlFor={`isOffer-${product._id}`} className="checkbox-label">
                    Oferta Destacada
                </label>
            </div>

            {/* Checkbox isMegaOffer */}
            <div className="action-group checkbox-group">
                <input
                    type="checkbox"
                    id={`isMegaOffer-${product._id}`}
                    checked={isMegaOfferChecked}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsMegaOfferChecked(isChecked);
                        handleUpdate('isMegaOffer', isChecked);
                    }}
                    className="checkbox-input mega-offer-input"
                    disabled={loading}
                />
                <label htmlFor={`isMegaOffer-${product._id}`} className="checkbox-label">
                    Mega Oferta
                </label>
            </div>
            
            {/* 🎯 RENDERIZADO CONDICIONAL DEL FORMULARIO DE EDICIÓN */}
            {isEditModalOpen && (
                <EditProductForm
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    productToEdit={product}
                    onProductUpdated={handleProductEdited}
                />
            )}
        </div>
    );
};

export default AdminProductActions;