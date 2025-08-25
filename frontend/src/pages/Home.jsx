// ELMAY-APP/frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a la Tienda ELMAY</h1>
        <p>Explora nuestra increíble colección de productos.</p>
        <nav>
          <ul className="nav-links">
            <li><Link to="/login">Iniciar Sesión</Link></li>
            {/* Futuros enlaces a otras páginas públicas, como un carrito */}
          </ul>
        </nav>
      </header>
      <main className="home-content">
        <section className="product-list">
          <h2>Productos Destacados</h2>
          {/* Aquí es donde se renderizarían los productos en el futuro */}
          <div className="product-placeholder">
            <p>Producto 1</p>
          </div>
          <div className="product-placeholder">
            <p>Producto 2</p>
          </div>
          <div className="product-placeholder">
            <p>Producto 3</p>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <p>© 2024 ELMAY. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Home;