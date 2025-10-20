// ELMAY-APP/frontend/src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  // Nuevo estado para controlar el menú móvil
  const [showMobileMenu, setShowMobileMenu] = useState(false); 
  
  const dropdownRef = useRef(null);
  // Nueva referencia para el menú móvil
  const menuRef = useRef(null); 

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

    // Cerramos el dropdown y el menú móvil si el usuario hace clic fuera de ellos
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
        // Lógica para cerrar el menú móvil al hacer clic fuera del menú o del botón 'menu-toggle'
        if (showMobileMenu && menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.menu-toggle')) {
            setShowMobileMenu(false);
        }
    };

    // Llamamos la función al montar el componente
    checkUser();

    // Añadimos listeners
    window.addEventListener('localStorageUpdated', checkUser);
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiamos los listeners al desmontar el componente
    return () => {
      window.removeEventListener('localStorageUpdated', checkUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]); // Añadimos showMobileMenu para que el hook actualice el listener al cambiar el estado

  const onLogout = () => {
    localStorage.removeItem('user');
    
    // Disparamos el evento para que otros componentes sepan que el localStorage cambió
    window.dispatchEvent(new Event('localStorageUpdated'));
    
    navigate('/');
  };

  const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
  }
  
  // Función para alternar el menú móvil
  const toggleMobileMenu = () => {
      setShowMobileMenu(!showMobileMenu);
  }

  // Función para cerrar el menú móvil al hacer clic en un enlace (importante para UX)
  const closeMenuAndNavigate = () => {
    // El enlace Link de react-router-dom manejará la navegación
    setShowMobileMenu(false); // Cierra el menú móvil
  };


  return (
    <header className="main-header">
      <Link className="logo-header" to="/">
         <img src="../../static/index/image/logo-totalmente-transparente.png" alt="Logo de ELMAY" className="logo" />
        <div className="logo-text-container"> 
          <span className="site-name">ELMAY</span>
          <span className="site-desc">Venta de productos y servicios</span>
        </div>
      </Link>
      
      {/* BOTÓN DE MENÚ HAMBURGUESA - Visible solo en móvil */}
      <button className="menu-toggle" onClick={toggleMobileMenu} aria-expanded={showMobileMenu} aria-label={showMobileMenu ? 'Cerrar menú' : 'Abrir menú'}>
        {/* Usamos un ícono simple como '☰' o 'X' */}
        {showMobileMenu ? '✕' : '☰'} 
      </button>

      {/* La navegación utiliza la clase 'mobile-open' para deslizarse en móvil */}
      <nav className={showMobileMenu ? 'mobile-open' : ''} ref={menuRef}>
        <ul className='ul-nav'>
          {/* Enlaces con onClick para asegurar que el menú móvil se cierra */}
          <li><Link to="/" className='a-nav' onClick={closeMenuAndNavigate}>Inicio</Link></li>
          {user ? (
            <li className="user-dropdown" ref={dropdownRef}>
              <span className="user-name" onClick={toggleDropdown}>Hola, {user.name} {user.role !== 'buyer' && (user.role)} </span>
              {showDropdown && (
                <ul className="dropdown-menu">
                  {/* Condicional para Admin */}
                  {user.role === 'admin' && (
                    <>
                      <li><Link to="/admin" className='a-nav' onClick={() => { toggleDropdown(); closeMenuAndNavigate(); }}>Panel de Admin</Link></li>
                      <li><Link to="/seller" className='a-nav' onClick={() => { toggleDropdown(); closeMenuAndNavigate(); }}>Panel de Vendedor</Link></li>
                    </>
                  )}
                  {/* Condicional para Vendedor */}
                  {user.role === 'seller' && (
                    <>
                      <li><Link to="/seller" className='a-nav' onClick={() => { toggleDropdown(); closeMenuAndNavigate(); }}>Panel de Vendedor</Link></li>
                    </>
                  )}
                  <li><button onClick={() => { onLogout(); toggleDropdown(); closeMenuAndNavigate(); }} className='button-nav'>Cerrar Sesión</button></li>
                </ul>
              )}
            </li>
          ) : (
            <>
              <li><Link to="/login" className='a-nav' onClick={closeMenuAndNavigate}>Sign In</Link></li>
            </>
          )}
		      <li><Link to="/cart" className='a-nav' onClick={closeMenuAndNavigate}>Cesta</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;