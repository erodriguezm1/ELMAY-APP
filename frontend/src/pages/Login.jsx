// ELMAY-APP/frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  // Estado para gestionar si el panel derecho está activo
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { username, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Función para manejar el clic del botón de "Sign In"
  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };

  // Función para manejar el clic del botón de "Sign Up"
  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const userData = { username, password };
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data));
        console.log('Respuesta del backend:', data);
        navigate('/');
      } else {
        console.log('Error al iniciar sesion:', response.statusText);
      }
    } catch (error) {
      console.error('Error al iniciar sesion:', error);
    }
  };
    // Función de submit para REGISTRO
  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username,
      email,
      password: registerPassword,
      username: registerUsername, // Asegúrate de que tu backend espera 'username' para registro
    };
    try {
      const response = await fetch('http://localhost:5000/api/users/register', { // <-- Asegúrate de que esta sea tu ruta de registro
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data)); // Inicia sesión automáticamente después del registro
        console.log('Respuesta del backend (Registro):', data);
        navigate('/');
      } else {
        console.log('Error al registrar usuario:', response.statusText);
        // Aquí podrías añadir lógica para mostrar un mensaje de error al usuario
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      // Aquí podrías añadir lógica para mostrar un mensaje de error al usuario
    }
  };

  return (
    <div className="loginPageContainer">
      <h2>Weekly Coding Challenge #1: Sign in/up Form</h2>
      <div 
        className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} 
        id="container"
      >
        <div className="form-container sign-up-container">
          <form action="#">
            <h1>Create Account</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form action="#" onSubmit={onSubmit}>
            <h1>Sign in</h1>
            <div className="social-container">
              <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
              <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
            </div>
            <span>or use your account</span>
            {/* Es importante conectar estos inputs al estado */}
            <input 
              type="text" 
              placeholder="Username" 
              name="username" 
              value={username} 
              onChange={onChange} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              value={password} 
              onChange={onChange} 
            />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;