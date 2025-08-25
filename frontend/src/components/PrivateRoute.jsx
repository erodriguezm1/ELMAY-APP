// ELMAY-APP/frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const user = localStorage.getItem('user');

  // Si hay un usuario en el localStorage, permite el acceso
  // 'Outlet' renderiza el componente hijo de la ruta privada
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
