// ELMAY-APP/frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// 🟢 FUNCIÓN DE VERIFICACIÓN DE SEGURIDAD
const checkPasswordStrength = (password) => {
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        upperCase: /[A-Z]/.test(password),
        lowerCase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (requirements.length) strength += 1;
    if (requirements.upperCase) strength += 1;
    if (requirements.lowerCase) strength += 1;
    if (requirements.number) strength += 1;
    if (requirements.specialChar) strength += 1;
    
    // Nivel de seguridad (0 a 100%)
    let percent = (strength / 5) * 100;

    let text = 'Muy Débil';
    if (percent > 0) text = 'Débil';
    if (percent >= 60) text = 'Media';
    if (percent === 100) text = 'Fuerte';
    
    // Si la longitud es muy corta, forzar a "Débil"
    if (password.length > 0 && password.length < 8) {
        text = 'Débil';
        percent = Math.max(percent, 20); // Aseguramos que tenga al menos un 20% si hay texto
    }
    if (password.length === 0) {
        text = '';
        percent = 0;
    }

    return { percent, text, requirements };
};


function Login() {
  const navigate = useNavigate();
  // Estado para gestionar si el panel derecho está activo
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensajes de error
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensaje de éxito del registro
  
  // 🟢 Estado para el indicador de seguridad
  const [passwordStrength, setPasswordStrength] = useState({ 
      percent: 0, 
      text: '', 
      requirements: {} 
  });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

   // Estado para el formulario de REGISTRO
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    email: '',
    password: '',
    username: '', 
  });

  const { username, password } = formData;
  const { name, email, password: registerPassword, username: registerUsername } = registerFormData; 

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage(''); // Limpiar errores al cambiar de input
    setSuccessMessage('');
  };

  const onRegisterChange = (e) => {
    const { name: fieldName, value } = e.target;
    
    setRegisterFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    setErrorMessage(''); // Limpiar errores al cambiar de input
    setSuccessMessage('');
    
    // 🟢 Si el campo es 'password', actualiza la seguridad
    if (fieldName === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Función para manejar el clic del botón de "Sign In"
  const handleSignInClick = () => {
    setIsRightPanelActive(false);
    setErrorMessage('');
    // Mantenemos el mensaje de éxito para que se vea en el panel de Login
  };

  // Función para manejar el clic del botón de "Sign Up"
  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
    setErrorMessage('');
    setSuccessMessage('');
  };
  
  // 🟢 LÓGICA DE INICIO DE SESIÓN
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Llamada a la API de Login (Ajusta la URL si es necesario)
      const response = await axios.post('/api/users/login', {
        username,
        password,
      });

      // 2. Desestructurar los datos de la respuesta (ajusta si tu API devuelve algo diferente)
      const { token, name, role } = response.data; 

      // 3. Guardar datos en el almacenamiento local
      localStorage.setItem('user', JSON.stringify({ name, role, token }));
      // localStorage.setItem('token', token); 
      
      // 4. Disparar evento para actualizar el Header
      window.dispatchEvent(new Event('localStorageUpdated'));
      
      // 5. Redireccionar basado en el rol
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/'); // Por defecto a la página de inicio para 'buyer'
      }

    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      // Manejo de errores de la API
      setErrorMessage(error.response?.data?.message || 'Credenciales inválidas o error de conexión.');
    }
  };
  
  // 🟢 LÓGICA DE REGISTRO
  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // 🔴 REQUISITO: NO PERMITIR REGISTRO CON CONTRASEÑA DÉBIL
    if (passwordStrength.text === 'Débil' || passwordStrength.text === 'Muy Débil') {
        setErrorMessage('La contraseña es demasiado débil. Debe tener al menos 8 caracteres, mayúsculas, minúsculas y un número.');
        return; 
    }
    
    try {
      // 1. Llamada a la API de Registro (Ajusta la URL si es necesario)
      const response = await axios.post('/api/users/register', {
        name,
        email,
        username: registerUsername,
        password: registerPassword,
        role: 'buyer' // Ajusta si el rol se define en el backend
      });

      // 2. Si el registro es exitoso (código de estado 201 o lo que devuelva tu backend)
      if (response.status === 201 || response.data.success) {
        
        // 🎯 Limpiar los campos del formulario de registro
        setRegisterFormData({
            name: '',
            email: '',
            password: '',
            username: '',
        });
        // 🎯 Limpiar el indicador de seguridad
        setPasswordStrength({ percent: 0, text: '', requirements: {} });

        // 🎯 Mostrar mensaje de éxito
        setSuccessMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
        
        // 🎯 Mover al panel de Sign In
        handleSignInClick(); 
        
      } else {
         setErrorMessage('Registro completado, pero no se recibió confirmación clara.');
      }
      
    } catch (error) {
      console.error('Error de registro:', error);
      // Manejo de errores de la API
      setErrorMessage(error.response?.data?.message || 'Error al registrar usuario. Intenta de nuevo.');
    }
  };


  return (
    <div className='loginPageContainer'>
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        
        {/* FORMULARIO DE REGISTRO (SIGN UP) */}
        <div className="form-container sign-up-container">
          <form onSubmit={onRegisterSubmit}>
            <img src="../../static/index/image/logo-totalmente-transparente.png" alt="Logo ELMAY" className="form-logo" /> 
            <h1>Crear Cuenta</h1>
            <div className="social-container">
              <a href="#" className="social" role="button" aria-label="Registrarse con Google">
                <FontAwesomeIcon icon={['fab', 'google-plus-g']} />
              </a>
            </div>
            <span>o usa tu email para registrarte</span>
            
            {/* Mensajes de feedback */}
            {isRightPanelActive && errorMessage && <p className="error-message">{errorMessage}</p>}
            
            <input 
              type="text" 
              placeholder="Nombre" 
              name="name" 
              value={name} 
              onChange={onRegisterChange} 
              required
            />
            <input 
              type="text" 
              placeholder="Usuario" 
              name="username" 
              value={registerUsername} 
              onChange={onRegisterChange} 
              required
            />
            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              value={email} 
              onChange={onRegisterChange} 
              required
            />
            
            {/* CAMPO DE CONTRASEÑA */}
            <input 
              type="password" 
              placeholder="Contraseña" 
              name="password" 
              value={registerPassword} 
              onChange={onRegisterChange} 
              required
            />
            
            {/* 🟢 INDICADOR DE SEGURIDAD */}
            {isRightPanelActive && registerPassword.length > 0 && (
                <div className="password-strength-indicator">
                    <div className="bar-container">
                        <div 
                            className={`bar ${passwordStrength.text.toLowerCase().replace(/ /g, '-')}`} 
                            style={{ width: `${passwordStrength.percent}%` }}
                        ></div>
                    </div>
                    <span className={`strength-text ${passwordStrength.text.toLowerCase().replace(/ /g, '-')}`}>
                        Seguridad: {passwordStrength.text}
                    </span>
                    <ul className="requirements-list">
                        <li className={passwordStrength.requirements.length ? 'met' : 'not-met'}>
                            {passwordStrength.requirements.length ? '✓' : '✕'} 8+ caracteres
                        </li>
                        <li className={passwordStrength.requirements.upperCase ? 'met' : 'not-met'}>
                            {passwordStrength.requirements.upperCase ? '✓' : '✕'} Mayúscula
                        </li>
                        <li className={passwordStrength.requirements.number ? 'met' : 'not-met'}>
                            {passwordStrength.requirements.number ? '✓' : '✕'} Número
                        </li>
                    </ul>
                </div>
            )}
            
            <button type="submit">Sign Up</button>
          </form>
        </div>
        
        {/* FORMULARIO DE INICIO DE SESIÓN (SIGN IN) */}
        <div className="form-container sign-in-container">
          <form onSubmit={onSubmit}>
            <img src="../../static/index/image/logo-totalmente-transparente.png" alt="Logo ELMAY" className="form-logo" /> 
            <h1>Iniciar Sesión</h1>
            <div className="social-container">
              <a href="#" className="social" role="button" aria-label="Iniciar sesión con Google">
                <FontAwesomeIcon icon={['fab', 'google-plus-g']} />
              </a>
            </div>
            <span>o usa tu cuenta</span>
            
            {/* Mensajes de feedback */}
            {!isRightPanelActive && errorMessage && <p className="error-message">{errorMessage}</p>}
            {!isRightPanelActive && successMessage && <p className="success-message">{successMessage}</p>} 

            <input 
              type="text" 
              placeholder="Usuario" 
              name="username" 
              value={username} 
              onChange={onChange} 
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              name="password" 
              value={password} 
              onChange={onChange} 
              required
            />
            <a href="#">¿Olvidaste tu contraseña?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>
        
        {/* CAPAS DE OVERLAY (Fondo y Botones de Cambio) */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Overlay Izquierdo: Muestra Sign In */}
            <div className="overlay-panel overlay-left">
              <img src="../../static/index/image/logo-totalmente-transparente.png" alt="Logo ELMAY" className="overlay-logo" /> 
              <h1>¡Bienvenido de Nuevo!</h1>
              <p>Para mantenerte conectado, por favor inicia sesión con tu información personal</p>
              <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
            </div>
            {/* Overlay Derecho: Muestra Sign Up */}
            <div className="overlay-panel overlay-right">
              <img src="../../static/index/image/logo-totalmente-transparente.png" alt="Logo ELMAY" className="overlay-logo" /> 
              <h1>¡Hola, Amigo!</h1>
              <p>Ingresa tus datos personales y comienza esta aventura con nosotros</p>
              <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;