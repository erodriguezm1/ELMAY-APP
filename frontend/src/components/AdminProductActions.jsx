import React, { useState } from 'react';
import axios from 'axios';

// Usamos la URL por defecto para la API. 
const API_URL = 'http://localhost:5000/api'; 

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
        <div className="admin-actions bg-gray-50 p-4 rounded-xl shadow-inner mt-4 border border-indigo-100">
            <h4 className="text-lg font-semibold text-indigo-700 mb-3">
                Acciones de Administración (Solo Admin)
            </h4>
            
            {loading && <p className="text-sm text-yellow-600">Actualizando...</p>}
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

            {/* Selector de Status (active, suspended) */}
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Producto:
                </label>
                <select
                    value={currentStatus}
                    onChange={(e) => {
                        const newStatus = e.target.value;
                        setCurrentStatus(newStatus);
                        handleUpdate('status', newStatus);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                >
                    <option value="active">Activo (Visible)</option>
                    <option value="suspended">Suspendido (Oculto)</option>
                </select>
            </div>

            {/* Checkbox isOffer */}
            <div className="flex items-center space-x-4 mb-2">
                <input
                    type="checkbox"
                    id={`isOffer-${product._id}`}
                    checked={isOfferChecked}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsOfferChecked(isChecked);
                        handleUpdate('isOffer', isChecked);
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    disabled={loading}
                />
                <label htmlFor={`isOffer-${product._id}`} className="text-sm font-medium text-gray-700">
                    Marcar como Oferta Destacada
                </label>
            </div>

            {/* Checkbox isMegaOffer */}
            <div className="flex items-center space-x-4">
                <input
                    type="checkbox"
                    id={`isMegaOffer-${product._id}`}
                    checked={isMegaOfferChecked}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsMegaOfferChecked(isChecked);
                        handleUpdate('isMegaOffer', isChecked);
                    }}
                    className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    disabled={loading}
                />
                <label htmlFor={`isMegaOffer-${product._id}`} className="text-sm font-medium text-gray-700">
                    Marcar como Mega Oferta
                </label>
            </div>
        </div>
    );
};

export default AdminProductActions;