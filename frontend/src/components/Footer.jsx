// ELMAY-APP/frontend/src/components/Footer.jsx

import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
// 🟢 IMPORTANTE: Importar el componente de Font Awesome para React
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 

function Footer() {
  return (
    // Se mantiene la estructura mejorada de Footer
    <footer className="main-footer">
        {/* Sección de Contenido Principal del Footer (Expansión) */}
        <div className="footer-content-container">
            {/* Columna 1: Información de la Tienda */}
            <div className="footer-section info-section">
                <h3>ELMAY E-Commerce</h3>
                <p>Tu destino digital para las mejores ofertas en electrónica, hogar y streaming. Compromiso con la calidad y el servicio.</p>
                <div className="social-links">
                    {/* 🟢 CORRECCIÓN: Usar <FontAwesomeIcon> con el prefijo ['fab', 'icon'] */}
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <FontAwesomeIcon icon={['fab', 'facebook-f']} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FontAwesomeIcon icon={['fab', 'twitter']} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FontAwesomeIcon icon={['fab', 'instagram']} />
                    </a>
                </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="footer-section links-section">
                <h3>Enlaces Rápidos</h3>
                <ul>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/about">Sobre Nosotros</Link></li>
                    <li><Link to="/products">Todos los Productos</Link></li>
                    <li><Link to="/faq">Preguntas Frecuentes</Link></li>
                </ul>
            </div>

            {/* Columna 3: Contacto y Soporte */}
            <div className="footer-section contact-section">
                <h3>Contacto y Soporte</h3>
                <p>📍 Av. Principal #123, Guayaquil, Ecuador</p>
                <p>📞 +593 999 888 777</p>
                <p>📧 <a href="mailto:soporte@elmay.com">soporte@elmay.com</a></p>
                <p className="support-hours">Horario: Lun - Vie, 9:00 - 18:00</p>
            </div>
        </div>

        {/* Sección de Copyright (Barra Inferior) */}
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ELMAY. Todos los derechos reservados.</p>
        </div>
    </footer>
  );
}

export default Footer;