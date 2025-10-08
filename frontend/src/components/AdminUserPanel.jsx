import React, { useState, useEffect, useCallback } from 'react'; // Importado useCallback
import axios from 'axios';
import './AdminUserPanel.css';
import { useNavigate } from "react-router-dom";

const AdminUserPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [modalState, setModalState] = useState({ isOpen: false, message: '', action: null, params: null });
    const [messageModalState, setMessageModalState] = useState({ isOpen: false, message: '' });

    // URL base de la API
    // Si tienes problemas de proxy (como recibir HTML), intenta cambiar esto a '/api/users' 
    // y configura tu servidor de desarrollo para redirigir esa ruta.
    const API_URL = '/api/users';

    // Obtener el token directamente de localStorage
    const adminToken = localStorage.getItem('authToken');

    // Función para limpiar token y redirigir (memorizada)
    const handleAuthError = useCallback(() => {
        localStorage.removeItem("authToken");
        navigate("/login");
    }, [navigate]);

    // Función para obtener todos los usuarios de la API (usando axios y memorizada)
    const fetchUsers = useCallback(async () => {
        if (!adminToken) {
            setError("No autorizado. Por favor, inicia sesión con una cuenta de administrador.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            };
            const response = await axios.get(API_URL, config);
            setUsers(response.data);
            setError(null);
        } catch (err) {
            // Manejo mejorado de errores con axios
            if (err.response && err.response.status === 401) {
                handleAuthError();
            } else if (err.response) {
                // Captura mensajes de error del backend si están disponibles
                setError(err.response.data.message || `Error ${err.response.status}: Error al cargar los usuarios.`);
            } else {
                // Error de red (servidor caído, CORS, o Proxy mal configurado)
                setError('Error de red al cargar los usuarios. Revisa la conexión o el backend.');
            }
            console.error("Error en fetchUsers:", err);
        } finally {
            setLoading(false);
        }
    }, [adminToken, handleAuthError]); // Dependencias de useCallback

    useEffect(() => {
        // Llama a la versión memoizada de fetchUsers
        fetchUsers();
    }, [fetchUsers]); // Dependencia del efecto: la función memoizada

    // Handlers para las acciones que activan el modal de confirmación
    const handleUpdateRole = (userId, newRole) => {
        setModalState({
            isOpen: true,
            message: `¿Estás seguro de que deseas cambiar el rol de este usuario a ${newRole}?`,
            action: 'updateRole',
            params: { userId, newRole }
        });
    };

    const handleDeleteUser = (userId) => {
        setModalState({
            isOpen: true,
            message: '¿Estás seguro de que deseas eliminar a este usuario?',
            action: 'deleteUser',
            params: { userId }
        });
    };

    // Función para ejecutar la acción confirmada
    const handleModalConfirm = async () => {
        const { action, params } = modalState;
        setModalState({ ...modalState, isOpen: false });

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminToken}`,
                },
            };

            if (action === 'updateRole') {
                const { userId, newRole } = params;
                // NOTA: Asegúrate de que API_URL no tenga la barra final, ya que se agrega aquí con ${userId}
                await axios.put(`${API_URL.replace(/\/users$/, '')}/${userId}`, { role: newRole }, config); 
                setMessageModalState({ isOpen: true, message: 'Rol de usuario actualizado exitosamente.' });
            } else if (action === 'deleteUser') {
                const { userId } = params;
                await axios.delete(`${API_URL.replace(/\/users$/, '')}/${userId}`, config);
                setMessageModalState({ isOpen: true, message: 'Usuario eliminado exitosamente.' });
            }
            fetchUsers(); // Recarga la lista de usuarios después de la acción
        } catch (err) {
             // Manejo de error específico para acciones PUT/DELETE
             if (err.response && err.response.status === 401) {
                handleAuthError();
            } else if (err.response) {
                setError(err.response.data.message || `Error ${err.response.status}: Error al realizar la acción.`);
            } else {
                setError('Error de red al realizar la acción. Por favor, revisa la consola.');
            }
            console.error("Error en handleModalConfirm:", err.response ? err.response.data : err);
        }
    };

    return (
        <>
            {/* Confirmation Modal */}
            {modalState.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">{modalState.message}</p>
                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={handleModalConfirm}>Sí</button>
                            <button className="cancel-btn" onClick={() => setModalState({ ...modalState, isOpen: false })}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageModalState.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="modal-message">{messageModalState.message}</p>
                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={() => setMessageModalState({ ...messageModalState, isOpen: false })}>Ok</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container">
                <h1 className="title">Panel de Administración de Usuarios</h1>
                <p className="subtitle">Gestiona los perfiles y roles de los usuarios registrados.</p>

                {loading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="panel">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header th">ID de Usuario</th>
                                        <th className="table-header th">Nombre</th>
                                        <th className="table-header th">Correo Electrónico</th>
                                        <th className="table-header th">Rol</th>
                                        <th className="table-header th">Estado</th>
                                        <th className="table-header th">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="table-row">
                                            <td className="table-cell font-mono text-gray-500">{user._id}</td>
                                            <td className="table-cell font-medium text-gray-900">{user.name}</td>
                                            <td className="table-cell text-gray-500">{user.email}</td>
                                            <td className="table-cell">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                    className="select-role"
                                                >
                                                    <option value="user">Usuario</option>
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
