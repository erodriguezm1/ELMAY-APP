import React from 'react';

function Login() {
  return (
    <div>
      <form>
        <label for="username">Usuario:</label><br>
        <input type="text" id="username" name="username"><br><br>
        <label for="password">Contraseña:</label><br>
        <input type="password" id="password" name="password"><br><br>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;