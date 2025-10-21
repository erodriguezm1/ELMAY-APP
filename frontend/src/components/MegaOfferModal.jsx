import React, { useState, useEffect } from 'react'; // 👈 Importamos useState y useEffect
import { useNavigate } from 'react-router-dom';
import './MegaOfferModal.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// 👈 Añadimos íconos para las flechas de navegación
import { faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'; 

const MegaOfferModal = ({ show, onClose, offers }) => {
  const navigate = useNavigate();
  // Mostraremos todas las ofertas que vengan, no solo las 3 primeras.
  // Pero si hay muchas, puedes limitar aquí: offers.slice(0, 5); por ejemplo.
  const offersToRender = offers; 

  // 🟢 ESTADO PARA EL ÍNDICE DE LA OFERTA ACTUAL
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  if (!show || offersToRender.length === 0) return null;

  // 🟢 LÓGICA DE NAVEGACIÓN DEL CARRUSEL
  const goToNextOffer = () => {
    setCurrentOfferIndex((prevIndex) => 
      (prevIndex + 1) % offersToRender.length
    );
  };

  const goToPreviousOffer = () => {
    setCurrentOfferIndex((prevIndex) => 
      (prevIndex - 1 + offersToRender.length) % offersToRender.length
    );
  };

  const goToOffer = (index) => {
    setCurrentOfferIndex(index);
  };

  // 🟢 EFECTO DE AUTO-AVANCE DEL CARRUSEL
  useEffect(() => {
    let interval;
    if (show && offersToRender.length > 1) { // Solo si hay más de una oferta
      interval = setInterval(() => {
        goToNextOffer();
      }, 5000); // Cambiar cada 5 segundos (ajusta a tu gusto)
    }

    // Limpieza del intervalo al desmontar o si el modal se cierra
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [show, offersToRender.length, goToNextOffer]); // Dependencias para re-ejecutar el efecto

  // Manejador para el botón "Ver Detalle"
  const handleViewDetail = (productId) => {
    onClose(); 
    navigate(`/product/${productId}`);
  };

  // Obtenemos la oferta actual a mostrar
  const currentOffer = offersToRender[currentOfferIndex];

  return (
    <div 
      className="mega-offer-modal-overlay"
      onClick={onClose} 
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="modal-close-button"
          aria-label="Cerrar Oferta"
        >
          &times;
        </button>
        
        {/* 🟢 TÍTULO PRINCIPAL DEL MODAL - COMO EL DE STEAM */}
        <h2 className="main-modal-title">OFERTA DE ENTRE SEMANA</h2>
        
        {/* 🟢 CONTENEDOR DEL CARRUSEL DE OFERTAS */}
        <div className="carousel-container">
          {/* 🟢 FLECHA IZQUIERDA */}
          {offersToRender.length > 1 && (
            <button onClick={goToPreviousOffer} className="carousel-nav-btn prev">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {/* 🟢 LA OFERTA ACTUAL */}
          {currentOffer && (
            <div key={currentOffer._id} className="carousel-item">
              <img 
                src={currentOffer.imageUrl} 
                alt={currentOffer.name} 
                className="carousel-image" // Clase para la imagen grande
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x300/FEE2E2/DC2626?text=OFERTA"; }}
              />

              {/* 🟢 SECCIÓN DE TEXTO COMO LA DE STEAM */}
              <div className="carousel-text-content">
                <h3 className="carousel-offer-title">{currentOffer.name}</h3>
                <p className="carousel-offer-subtitle">{currentOffer.description}</p>
                <p className="carousel-discount">
                    Hasta un {((1 - currentOffer.price / (currentOffer.price * 1.3)) * 100).toFixed(0)}% de descuento
                </p>
              </div>

              {/* 🟢 BOTÓN MÁS INFORMACIÓN */}
              <button
                onClick={() => handleViewDetail(currentOffer._id)}
                className="carousel-info-button"
              >
                MÁS INFORMACIÓN
              </button>
            </div>
          )}

          {/* 🟢 FLECHA DERECHA */}
          {offersToRender.length > 1 && (
            <button onClick={goToNextOffer} className="carousel-nav-btn next">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>
        
        {/* 🟢 PAGINACIÓN INFERIOR (GUIONES) */}
        {offersToRender.length > 1 && (
          <div className="pagination-indicators">
            {offersToRender.map((_, index) => (
                <span 
                    key={index} 
                    className={`pagination-dash ${index === currentOfferIndex ? 'active' : ''}`}
                    onClick={() => goToOffer(index)}
                >
                    — 
                </span>
            ))}
          </div>
        )}

        {/* 🟢 BOTÓN CERRAR - Como el de Steam */}
        <button
          onClick={onClose}
          className="close-bottom-button"
        >
          Cerrar
        </button>

        {/* 🟢 TEXTO INFERIOR DE COPYRIGHT (Ejemplo) */}
        <p className="modal-footer-text">
            © 2025 ELMAY App. All trademarks are property of their respective owners.
        </p>
      </div>
    </div>
  );
};

export default MegaOfferModal;