import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="main-header">
		
		<a className="logo-header" href="#">
			<span className="site-name">FranciscoAMK</span>
			<span className="site-desc">Diseño web / WordPress / Tutoriales</span>
		</a> 

		<nav>
			<ul>
				<li><a href="#">Inicio</a></li>
				<li><a href="#">Acerca de</a></li>
				<li><a href="#">Contacto</a></li>
			</ul>
		</nav>

	</header>

  );
}

export default Header;