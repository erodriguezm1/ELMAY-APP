// src/components/SessionTimeout.jsx
import React, { useEffect, useCallback } from "react";

// Configura el tiempo de inactividad en milisegundos.
// Por ejemplo, 15 * 60 * 1000 = 15 minutos
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

const SessionTimeout = () => {
  let timeout;

  // Usa useCallback para memoizar la función y evitar que se recree en cada render
  // Esto es clave para que los event listeners funcionen correctamente
  const logout = useCallback(() => {
    // 1. Limpiar el token de autenticación del almacenamiento local
    localStorage.removeItem("token");
    console.log("Sesión expirada por inactividad. Redireccionando a la página de inicio de sesión.");

    // 2. Redirigir al usuario a la página de inicio de sesión
    //    Puedes usar react-router-dom useNavigate() si lo prefieres
    window.location.href = "/login"; // o "/iniciar-sesion"
  }, []);

  // Función para reiniciar el temporizador
  const resetTimer = useCallback(() => {
    // Limpiar el temporizador anterior para evitar múltiples temporizadores
    clearTimeout(timeout);
    // Establecer un nuevo temporizador
    timeout = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    // Definir los eventos que reiniciarán el temporizador
    const events = ["mousemove", "keydown", "click"];

    // Agregar event listeners al documento
    const addEventListeners = () => {
      events.forEach((event) => {
        document.addEventListener(event, resetTimer);
      });
    };

    // Eliminar event listeners cuando el componente se desmonte
    const removeEventListeners = () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };

    // Configurar el temporizador inicial
    resetTimer();
    // Agregar los listeners al montar el componente
    addEventListeners();

    // Función de limpieza del efecto
    return () => {
      clearTimeout(timeout);
      removeEventListeners();
    };
  }, [resetTimer, logout]);

  // Este componente no renderiza nada en el DOM, solo maneja la lógica
  return null;
};

export default SessionTimeout;
