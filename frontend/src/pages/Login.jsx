// ELMAY-APP/frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
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
    //funcion de submit para inicio de sesion
  const onSubmit = async (e) => {
      e.preventDefault();
      const userData = {username,password};
      try{
        const response = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        if (response.ok){
          const data = await response.json();
          localStorage.setItem('user',JSON.stringify(data))
          console.log('Respuesta del backend:', data);
          //redireccionar a la pagina principal
          navigate('/');
        } else {
          console.log('Error al iniciar sesion:', response.statusText);
        }
      } catch (error) {
        console.error('Error al iniciar sesion:', error);
      }
  };

  return (
    <div className="loginPageContainer">
      <div className="panelLogin" >
        <h1>Iniciar Sesión</h1>
        <form onSubmit={onSubmit} className="formLogin">
          <label htmlFor="username">Usuario:</label><br />
          <input 
            type="text" 
            id="username" 
            name="username"
            value={username}
            onChange={onChange}
            className="username"
          /><br /><br />

          <label htmlFor="password">Contraseña:</label><br />
          <input 
            type="password" 
            id="password" 
            name="password"
            value={password}
            onChange={onChange}
            className="password"
          /><br /><br />

          <button type="submit" className="login">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}

export default Login;