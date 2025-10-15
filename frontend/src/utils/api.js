// ELMAY-APP/frontend/src/utils/api.js

/**
 * Función centralizada para realizar llamadas a la API que requieren autenticación.
 * * @param {string} endpoint - La ruta específica del backend (ej: /users/admin, /products).
 * @param {object} options - Opciones de la solicitud (method, body, etc.).
 * @returns {Promise<object>} - Los datos de la respuesta.
 */
export async function authenticatedFetch(endpoint, options = {}) {
    // 1. Obtener el token del almacenamiento local
    const userData = localStorage.getItem('user'); // 🟢 CORRECCIÓN: Usar la clave 'user'
    const authToken = userData ? JSON.parse(userData).token : null; // 🟢 CORRECCIÓN: Extraer el token

    if (!authToken) {
        // Si no hay token, lanza un error de inmediato
        throw new Error("No hay token de autenticación disponible. Sesión expirada o no iniciada.");
    }

    // 2. Definir la URL base de la API (ajustar si es necesario)
    const BASE_URL = import.meta.env.VITE_APP_API_URL || '/api';
    
    // 3. Configurar los encabezados (Headers)
    const headers = {
        'Content-Type': 'application/json',
        // 🚨 CRÍTICO: Adjuntar el token JWT en el formato Bearer
        'Authorization': `Bearer ${authToken}`, 
        ...options.headers, // Permitir headers personalizados
    };
    
    // 4. Configurar la solicitud final
    const config = {
        method: options.method || 'GET', // Método por defecto
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            // Manejo específico del 401/403: forzar el cierre de sesión si el token es inválido/expirado/no autorizado
            console.error("Token inválido, expirado o rol no autorizado. Forzando cierre de sesión.");
            localStorage.removeItem('user'); // 🟢 CORRECCIÓN: Sólo elimina la clave 'user'
            // localStorage.removeItem('authToken'); // ❌ SE ELIMINÓ
            window.location.href = '/login'; // Redirigir
            return; // Detener la ejecución
        }
        
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || `Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en authenticatedFetch:', error);
        throw error; // Propagar el error para que el componente lo maneje
    }
}