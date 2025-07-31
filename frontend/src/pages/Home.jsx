import React from 'react';

function Home() {
  return (
        <div>
      <form>
        <label htmlFor="username">Usuario:</label><br />
        <input type="text" id="username" name="username" /><br /><br />

        <label htmlFor="password">Contraseña:</label><br />
        <input type="password" id="password" name="password" /><br /><br />

        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>

  );
}

export default Home;