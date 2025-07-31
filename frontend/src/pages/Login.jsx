// ELMAY-APP/frontend/src/pages/Login.jsx
import React, { useState } from 'react';

function Login() {
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

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form>
        <label htmlFor="username">Usuario:</label><br />
        <input 
          type="text" 
          id="username" 
          name="username"
          value={username}
          onChange={onChange}
        /><br /><br />

        <label htmlFor="password">Contraseña:</label><br />
        <input 
          type="password" 
          id="password" 
          name="password"
          value={password}
          onChange={onChange}
        /><br /><br />

        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;