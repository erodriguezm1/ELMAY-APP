import React, { useState } from 'react';
import axios from 'axios';
// 🟢 IMPORTANTE: Importar el CSS asociado
import './AdminProductActions.css'; 

// Usamos la URL por defecto para la API. 
const API_URL = '/api'; 

const AdminProductActions = ({ product, onUpdate }) => {
    // Verificar si el producto existe para evitar errores.
    if (!product) {
        return null; 
    }
    
    // Inicializar estados de manera defensiva.
    const [currentStatus, setCurrentStatus] = useState(product?.status || 'active');
    const [isOfferChecked, setIsOfferChecked] = useState(product?.isOffer || false);
    const [isMegaOfferChecked, setIsMegaOfferChecked] = useState(product?.isMegaOffer || false); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

            setSuccess(`Estado de '${field}' actualizado con éxito a ${value}.`);
            // Llama a onUpdate para refrescar la lista en el componente padre
            onUpdate(data.product); 
            
        } catch (err) {
            console.error('Error al actualizar el producto (Servidor):', err.response || err);
            // Mensaje específico para el error 500, guiando al usuario a revisar su backend
            const errorMessage = err.response?.status === 500 
                ? 'Error 500: Fallo interno del servidor. Revisa tu lógica de backend para la ruta PUT /api/products/:id.'
                : err.response?.data?.message || 'Error al actualizar el producto.';
                
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        // 🎯 CLASE PRINCIPAL CORREGIDA
        <div className="product-actions-container">
            
            <h4 className="action-title">
                Acciones de Administración (Solo Admin)
            </h4>
            
            {/* 🎯 Mostrar overlay de carga */}
            {loading && (
                <div className="loading-overlay">
                    Actualizando...
                </div>
            )}
            
            {/* 🎯 Clases de mensaje corregidas */}
            {error && <p className="message error-message">{error}</p>}
            {success && <p className="message success-message">{success}</p>}

            {/* Selector de Status (active, suspended) */}
            {/* 🎯 Uso de action-group y status-group */}
            <div className="action-group status-group">
                <label className="status-label">
                    Estado:
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
                    <option value="active">Activo (Visible)</option>
                    <option value="suspended">Suspendido (Oculto)</option>
                </select>
            </div>

            {/* Checkbox isOffer */}
            {/* 🎯 Uso de action-group y checkbox-group */}
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
        </div>
    );
};

export default AdminProductActions;