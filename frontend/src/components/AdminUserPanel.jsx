// ELMAY-APP/frontend/src/components/AdminUserPanel.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminUserPanel.css';
import { useNavigate } from "react-router-dom";

// =================================================================
// 🟢 FUNCIÓN DE UTILIDAD CONSISTENTE PARA OBTENER DATOS DE USUARIO
// =================================================================
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user'); // 🟢 ¡Clave corregida!
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al parsear el usuario de localStorage:", e);
        return null;
    }
};
// =================================================================

const AdminUserPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [modalState, setModalState] = useState({ isOpen: false, message: '', action: null, params: null });
    const [messageModalState, setMessageModalState] = useState({ isOpen: false, message: '' });
    
    const API_URL = '/api/users';

    // 🟢 Obtener el token y los datos del usuario de forma consistente
    const userData = getUserData();
    const adminToken = userData?.token;
    
    // Función para limpiar token y redirigir (memorizada)
    const handleAuthError = useCallback(() => {
        localStorage.removeItem("user"); // 🟢 ¡Clave corregida!
        navigate("/login");
    }, [navigate]);

    // Función para obtener todos los usuarios de la API (usando axios y memorizada)
    const fetchUsers = useCallback(async () => {
        if (!adminToken) {
            // Esto es lo que causaba el error de "No autorizado" previamente
            setError("No autorizado. Por favor, inicia sesión con una cuenta de administrador."); 
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                },
            };
            
            // Llama a la ruta GET /api/users, que debe estar protegida por el rol 'admin'
            const response = await axios.get(API_URL, config); 
            
            // Filtramos al usuario actual para que no pueda modificarse a sí mismo (opcional)
            // Asumiendo que el objeto userData tiene un _id
            const filteredUsers = response.data.filter(user => user._id !== userData._id); 
            setUsers(filteredUsers);
            setError(null);

        } catch (err) {
            // Manejar 401 (token fallido/expirado) o 403 (rol incorrecto)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                setError(err.response?.data?.message || "Error al cargar la lista de usuarios.");
            }
        } finally {
            setLoading(false);
        }
    }, [adminToken, handleAuthError, userData]); 

    // Cargar usuarios al montar el componente o cuando se requiera refrescar
    useEffect(() => {
        if (adminToken) {
            fetchUsers();
        } else {
            setLoading(false); 
        }
    }, [fetchUsers, adminToken]);
    
    // ... (El resto de la lógica de handleUpdateRole, handleDeleteUser y Modales permanece igual)
    // El resto del componente...

    // ==================================================
    // ⬇️ LÓGICA DE MODIFICACIÓN DE ROL ⬇️
    // ==================================================
    const handleUpdateRole = async (userId, newRole) => {
        // 1. Mostrar modal de confirmación
        setModalState({
            isOpen: true,
            message: `¿Estás seguro de cambiar el rol del usuario ${userId.slice(-4)} a "${newRole}"?`,
            action: async () => {
                // 2. Ejecutar la actualización después de la confirmación
                setLoading(true);
                setModalState({ isOpen: false, message: '', action: null, params: null });

                try {
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    };
                    
                    await axios.put(`${API_URL}/${userId}`, { role: newRole }, config);

                    // 3. Actualizar el estado localmente
                    setUsers(users.map(user => 
                        user._id === userId ? { ...user, role: newRole } : user
                    ));
                    setMessageModalState({ isOpen: true, message: `Rol de usuario ${userId.slice(-4)} actualizado a "${newRole}" con éxito.` });

                } catch (err) {
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        handleAuthError();
                    } else {
                        setMessageModalState({ isOpen: true, message: `Error al actualizar el rol: ${err.response?.data?.message || err.message}` });
                    }
                } finally {
                    setLoading(false);
                }
            },
            params: { userId, newRole }
        });
    };

    // ==================================================
    // ⬇️ LÓGICA DE ELIMINACIÓN DE USUARIO ⬇️
    // ==================================================
    const handleDeleteUser = async (userId) => {
        // 1. Mostrar modal de confirmación
        setModalState({
            isOpen: true,
            message: `⚠️ ¿Estás seguro de ELIMINAR al usuario ${userId.slice(-4)}? Esta acción es irreversible.`,
            action: async () => {
                // 2. Ejecutar la eliminación después de la confirmación
                setLoading(true);
                setModalState({ isOpen: false, message: '', action: null, params: null });

                try {
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    };
                    
                    await axios.delete(`${API_URL}/${userId}`, config);

                    // 3. Actualizar el estado localmente
                    setUsers(users.filter(user => user._id !== userId));
                    setMessageModalState({ isOpen: true, message: `Usuario ${userId.slice(-4)} eliminado con éxito.` });

                } catch (err) {
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        handleAuthError();
                    } else {
                        setMessageModalState({ isOpen: true, message: `Error al eliminar el usuario: ${err.response?.data?.message || err.message}` });
                    }
                } finally {
                    setLoading(false);
                }
            },
            params: { userId }
        });
    };
    
    // ==================================================
    // ⬇️ RENDERING DE MODALES ⬇️
    // ==================================================
    const ConfirmationModal = ({ isOpen, message, onConfirm, onClose }) => {
        if (!isOpen) return null;
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>{message}</p>
                    <div className="modal-actions">
                        <button onClick={onConfirm} className="confirm-button">Confirmar</button>
                        <button onClick={onClose} className="cancel-button">Cancelar</button>
                    </div>
                </div>
            </div>
        );
    };

    const MessageModal = ({ isOpen, message, onClose }) => {
        if (!isOpen) return null;
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>{message}</p>
                    <button onClick={onClose} className="confirm-button">Aceptar</button>
                </div>
            </div>
        );
    };

    // ==================================================
    // ⬇️ RENDERING PRINCIPAL ⬇️
    // ==================================================
    return (
        <>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                message={modalState.message}
                onConfirm={modalState.action}
                onClose={() => setModalState({ isOpen: false, message: '', action: null, params: null })}
            />
            <MessageModal
                isOpen={messageModalState.isOpen}
                message={messageModalState.message}
                onClose={() => setMessageModalState({ isOpen: false, message: '' })}
            />

            <div className="admin-user-panel p-6 bg-white rounded-lg shadow-xl">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Usuarios</h3>

                {loading && <div className="text-center py-4">Cargando usuarios...</div>}
                {error && <div className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</div>}

                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="table-header">ID (últimos 4 dígitos)</th>
                                        <th className="table-header">Nombre</th>
                                        <th className="table-header">Email</th>
                                        <th className="table-header">Rol</th>
                                        <th className="table-header">Estado</th>
                                        <th className="table-header">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="table-cell font-mono text-xs">{user._id.slice(-4)}</td>
                                            <td className="table-cell font-medium">{user.name}</td>
                                            <td className="table-cell text-gray-500">{user.email}</td>
                                            <td className="table-cell">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                    className="select-role"
                                                >
                                                    <option value="buyer">Comprador</option>
                                                    <option value="seller">Vendedor</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            </td>
                                            <td className="table-cell text-gray-500">{user.status}</td>
                                            <td className="table-cell font-medium">
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="delete-button"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminUserPanel;