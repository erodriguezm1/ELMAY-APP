import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './MegaOfferModal.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'; 

const MegaOfferModal = ({ show, onClose, offers }) => {
  const navigate = useNavigate();
  const offersToRender = offers; 

  // 🟢 HOOK 1: ESTADO PARA EL ÍNDICE (Debe estar aquí)
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);

  // 🟢 LÓGICA DE NAVEGACIÓN MANUAL (Usa el estado normal, esto es seguro)
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

  // 🟢 HOOK 2: EFECTO DE AUTO-AVANCE DEL CARRUSEL (Debe estar aquí, antes del return)
  useEffect(() => {
    let interval;
    if (show && offersToRender.length > 1) { 
      interval = setInterval(() => {
        // Lógica de actualización de estado autónoma y estable
        setCurrentOfferIndex((prevIndex) => 
            (prevIndex + 1) % offersToRender.length
        );
      }, 5000); 
    }

    // Limpieza, que se ejecuta correctamente al cambiar 'show' a false
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  // Dependencias estables
  }, [show, offersToRender.length]); 

  // 🚨 FIX CLAVE: EL RETORNO CONDICIONAL VA DESPUÉS DE TODOS LOS HOOKS
  if (!show || offersToRender.length === 0) return null; 

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
        
        {/* 🟢 TÍTULO PRINCIPAL DEL MODAL */}
        <h2 className="main-modal-title">OFERTA DE ENTRE SEMANA</h2>
        
        {/* 🟢 CONTENEDOR DEL CARRUSEL DE OFERTAS */}
        <div className="carousel-container">
          {/* FLECHAS... */}
          {offersToRender.length > 1 && (
            <>
              <button onClick={goToPreviousOffer} className="carousel-nav-btn prev">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button onClick={goToNextOffer} className="carousel-nav-btn next">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}

          {/* LA OFERTA ACTUAL */}
          {currentOffer && (
            <div key={currentOffer._id} className="carousel-item">
              <img 
                src={currentOffer.imageUrl} 
                alt={currentOffer.name} 
                className="carousel-image" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x300/FEE2E2/DC2626?text=OFERTA"; }}
              />

              <div className="carousel-text-content">
                <h3 className="carousel-offer-title">{currentOffer.name}</h3>
                <p className="carousel-offer-subtitle">{currentOffer.description}</p>
                <p className="carousel-discount">
                    Hasta un {((1 - currentOffer.price / (currentOffer.price * 1.3)) * 100).toFixed(0)}% de descuento
                </p>
              </div>

              <button
                onClick={() => handleViewDetail(currentOffer._id)}
                className="carousel-info-button"
              >
                MÁS INFORMACIÓN
              </button>
            </div>
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

        {/* 🟢 BOTÓN CERRAR */}
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