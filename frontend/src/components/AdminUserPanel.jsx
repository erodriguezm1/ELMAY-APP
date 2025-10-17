// ELMAY-APP/frontend/src/components/AdminUserPanel.jsx (VERSIÓN FINAL CON NUEVOS STATUS)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminUserPanel.css';
import { useNavigate } from "react-router-dom";
import ReactDOM from 'react-dom';

// =================================================================
// 🟢 FUNCIÓN DE UTILIDAD CONSISTENTE PARA OBTENER DATOS DE USUARIO
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

const ROLES = ['buyer', 'seller', 'admin'];

// 🎯 LISTA DE ESTADOS DE USUARIO ACTUALIZADA
const STATUSES = ['pending', 'active', 'suspended', 'deleted']; 

// Función de utilidad para obtener la etiqueta y el icono del estado
const getStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return '✅ Activo';
        case 'pending':
            return '⌛ Pendiente';
        case 'suspended':
            return '🚫 Suspendido';
        case 'deleted':
            return '🗑️ Eliminado';
        default:
            return 'Desconocido';
    }
}
// =================================================================


// 🟢 MODALES CON REACT PORTALS (Se mantienen igual para evitar el parpadeo)
// ... (ConfirmationModal y MessageModal se mantienen igual) ...

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return ReactDOM.createPortal(
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <p className="modal-message">{message}</p>
                <div className="modal-buttons">
                    <button onClick={onCancel} className="cancel-btn">Cancelar</button>
                    <button onClick={onConfirm} className="confirm-btn">Confirmar</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const MessageModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return ReactDOM.createPortal(
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <p className="modal-message">{message}</p>
                <div className="modal-buttons">
                    <button onClick={onClose} className="confirm-btn">Cerrar</button>
                </div>
            </div>
        </div>,
        document.body
    );
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

    const userData = getUserData();
    const adminToken = userData?.token;
    
    const handleAuthError = useCallback(() => {
        localStorage.removeItem("user");
        navigate("/login");
    }, [navigate]);

    const fetchUsers = useCallback(async () => {
        if (!adminToken) {
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
            
            const response = await axios.get(API_URL, config); 
            
            const filteredUsers = response.data.filter(user => user._id !== userData._id); 
            setUsers(filteredUsers);
            setError(null);

        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleAuthError();
            } else {
                setError(err.response?.data?.message || "Error al cargar la lista de usuarios.");
            }
        } finally {
            setLoading(false);
        }
    }, [adminToken, handleAuthError, userData]); 

    useEffect(() => {
        if (adminToken) {
            fetchUsers();
        } else {
            setLoading(false); 
        }
    }, [fetchUsers, adminToken]);
    
    
    // ⬇️ LÓGICA DE MODIFICACIÓN DE ROL ⬇️
    const handleUpdateRole = async (userId, newRole) => {
        setModalState({
            isOpen: true,
            message: `¿Estás seguro de cambiar el rol del usuario ${userId.slice(-4)} a "${newRole}"?`,
            action: async () => {
                setModalState({ isOpen: false, message: '', action: null, params: null });

                try {
                    setLoading(true);
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    };
                    const response = await axios.put(`${API_URL}/${userId}`, { role: newRole }, config);

                    const updatedUserRole = response.data.role || newRole; 

                    setUsers(users.map(user => 
                        user._id === userId ? { ...user, role: updatedUserRole } : user
                    ));
                    setMessageModalState({ isOpen: true, message: `Rol de usuario ${userId.slice(-4)} actualizado a "${updatedUserRole}" con éxito.` });

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
    // ⬇️ LÓGICA DE MODIFICACIÓN DE ESTATUS (ACTUALIZADA) ⬇️
    // ==================================================
    const handleUpdateStatus = async (userId, newStatus) => {
        setModalState({
            isOpen: true,
            // 🎯 Usamos la función de utilidad para el mensaje de confirmación
            message: `¿Estás seguro de cambiar el estado del usuario ${userId.slice(-4)} a "${getStatusLabel(newStatus).replace(/[^a-zA-ZáéíóúÁÉÍÓÚ\s]/g, '').trim()}"?`,
            action: async () => {
                setModalState({ isOpen: false, message: '', action: null, params: null });
                
                try {
                    setLoading(true);
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    };
                    
                    const response = await axios.put(`${API_URL}/${userId}`, { status: newStatus }, config);

                    // Corregido: Usar el 'status' de la respuesta o el 'newStatus'
                    const updatedUserStatus = response.data.status || newStatus; 
                    
                    setUsers(users.map(user => 
                        user._id === userId ? { ...user, status: updatedUserStatus } : user
                    ));
                    setMessageModalState({ 
                        // 🎯 Usamos la función de utilidad para el mensaje de éxito
                        isOpen: true, 
                        message: `Estado de usuario ${userId.slice(-4)} actualizado a "${getStatusLabel(updatedUserStatus).replace(/[^a-zA-ZáéíóúÁÉÍÓÚ\s]/g, '').trim()}" con éxito.` 
                    });

                } catch (err) {
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        handleAuthError();
                    } else {
                        setMessageModalState({ isOpen: true, message: `Error al actualizar el estado: ${err.response?.data?.message || err.message}` });
                    }
                } finally {
                    setLoading(false);
                }
            },
            params: { userId, newStatus }
        });
    };
    
    // ⬇️ LÓGICA DE ELIMINACIÓN DE USUARIO ⬇️
    const handleDeleteUser = async (userId) => {
        setModalState({
            isOpen: true,
            message: `⚠️ ¿Estás seguro de ELIMINAR al usuario ${userId.slice(-4)}? Esta acción es irreversible.`,
            action: async () => {
                setModalState({ isOpen: false, message: '', action: null, params: null });
                
                try {
                    setLoading(true);
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                        },
                    };
                    await axios.delete(`${API_URL}/${userId}`, config);
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
    // ⬇️ RENDERING PRINCIPAL ⬇️
    // ==================================================
    return (
        <>
            <ConfirmationModal 
                isOpen={modalState.isOpen}
                message={modalState.message}
                onConfirm={modalState.action}
                onCancel={() => setModalState({ isOpen: false, message: '', action: null, params: null })}
            />
             <MessageModal 
                isOpen={messageModalState.isOpen}
                message={messageModalState.message}
                onClose={() => setMessageModalState({ isOpen: false, message: '' })}
            />
            
            <div className="container">
                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando usuarios...</p>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="panel">
                        <div className="table-responsive">
                            <table className="user-table">
                                <thead>
                                    <tr className="table-header">
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Usuario</th>
                                        <th>Rol</th>
                                        <th>Estado</th> 
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="table-row">
                                            <td className="table-cell">{user.name}</td>
                                            <td className="table-cell">{user.email}</td>
                                            <td className="table-cell font-medium">{user.username}</td>
                                            
                                            {/* SELECT PARA EL ROL */}
                                            <td className="table-cell">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                    className="select-action"
                                                >
                                                    {ROLES.map(role => (
                                                        <option key={role} value={role}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* 🎯 SELECT PARA EL ESTADO (ACTUALIZADO) */}
                                            <td className="table-cell">
                                                <select
                                                    // Usamos 'pending' como estado por defecto si no está definido (según tu modelo)
                                                    value={user.status || 'pending'} 
                                                    onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                                                    // 🎯 Añadimos una clase dinámica para el color de fondo
                                                    className={`select-action select-status-${user.status || 'pending'}`}
                                                >
                                                    {STATUSES.map(status => (
                                                        <option key={status} value={status}>
                                                            {getStatusLabel(status)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            
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