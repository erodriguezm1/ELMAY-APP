// ELMAY-APP/frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Función para verificar si hay un usuario logeado
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user');
        // Si hay datos, los parseamos y actualizamos el estado
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error('Error al leer datos de usuario del localStorage:', error);
        setUser(null);
      }
    };

    // Cerramos el dropdown si el usuario hace clic fuera de él
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    // Llamamos la función al montar el componente
    checkUser();

    // Añadimos un listener para el evento personalizado
    // que se dispara desde el componente de Login
    window.addEventListener('localStorageUpdated', checkUser);
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiamos los listeners al desmontar el componente para evitar fugas de memoria
    return () => {
      window.removeEventListener('localStorageUpdated', checkUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez

  const onLogout = () => {
    localStorage.removeItem('user');
    
    // Disparamos el evento para que otros componentes sepan que el localStorage cambió
    window.dispatchEvent(new Event('localStorageUpdated'));
    
    navigate('/');
  };

  const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
  }

  return (
    <header className="main-header">
      <Link className="logo-header" to="/">
         <img src="../../static/index/image/elmay-logo.webp" alt="Logo de ELMAY" className="logo" />
        <span className="site-name">ELMAY</span>
        <span className="site-desc">Venta de productos y servicios</span>
      </Link>
      <nav>
        <ul className='ul-nav'>
          <li><Link to="/" className='a-nav'>Inicio</Link></li>
          {user ? (
            <li className="user-dropdown" ref={dropdownRef}>
              <span className="user-name" onClick={toggleDropdown}>Hola, {user.name} {user.role !== 'buyer' && (user.role)} </span>
              {showDropdown && (
                <ul className="dropdown-menu">
                  {/* Condicional anidada: muestra el enlace al panel de admin solo si el rol es 'admin' */}
                  {user.role === 'admin' && (
                    <>
                      <li><Link to="/admin" className='a-nav' onClick={toggleDropdown}>Panel de Admin</Link></li>
                      <li><Link to="/seller" className='a-nav' onClick={toggleDropdown}>Panel de Vendedor</Link></li>
                    </>
                  )}
                  {/* Condicional anidada: muestra el enlace al panel de vendedor solo si el rol es 'seller' */}
                  {user.role === 'seller' && (
                    <>
                      <li><Link to="/seller" className='a-nav' onClick={toggleDropdown}>Panel de Vendedor</Link></li>
                    </>
                  )}
                  <li><button onClick={() => { onLogout(); toggleDropdown(); }} className='button-nav'>Cerrar Sesión</button></li>
                </ul>
              )}
            </li>
          ) : (
            <>
              <li><Link to="/login" className='a-nav'>Sign In</Link></li>
            </>
          )}
		      <li><Link to="/cart" className='a-nav'>Cesta</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;