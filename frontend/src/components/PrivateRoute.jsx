// ELMAY-APP/frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  // Lógica para obtener el usuario del almacenamiento local o del contexto de tu app
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  if (!user) {
    // Si no hay usuario logueado, redirige a la página de inicio de sesión.
    // El 'replace: true' evita que el usuario pueda volver a la página anterior con el botón del navegador.
    return <Navigate to="/login" replace={true} />;
  }

  // Verifica si el rol del usuario está en la lista de roles permitidos.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si el rol del usuario no está permitido, redirige a una página de no autorizado o al inicio.
    // En este caso, redirige a la página de inicio.
    return <Navigate to="/" replace={true} />;
  }

  // Si todas las condiciones se cumplen, muestra el componente hijo (por ejemplo, AdminPanel).
  return children;
};

export default PrivateRoute;
