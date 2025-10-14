import React, { useState, useEffect } from 'react';
import './MegaOfferModal.css'; // ⬅️ IMPORTACIÓN DEL NUEVO ARCHIVO CSS

// Componente de modal de oferta emergente con múltiples ofertas
const MegaOfferModal = ({ show, onClose, offers }) => {
  const [offersToDisplay, setOffersToDisplay] = useState([]);

  // Asegura que solo se muestren las primeras 3 ofertas (o las que existan)
  useEffect(() => {
    if (show && offers.length > 0) {
      setOffersToDisplay(offers.slice(0, 3));
    }
  }, [show, offers]);
    
  // Si no se debe mostrar o no hay ofertas válidas, no renderizar
  if (!show || offersToDisplay.length === 0) return null;
  
  return (
    <div 
      className="modal-overlay" // ⬅️ CLASE CSS DEL OVERLAY
      onClick={onClose} // Cierra si se hace clic fuera del modal
    >
      <div 
        className="modal-content" // ⬅️ CLASE CSS DEL CONTENIDO DEL MODAL (Aumentado en alto)
        onClick={(e) => e.stopPropagation()} // Evita que el clic interno cierre el modal
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-700 hover:text-red-600 transition-colors text-2xl font-bold"
          aria-label="Cerrar Oferta"
        >
          &times;
        </button>

        <div className="text-center">
          <h2 className="main-title"> {/* ⬅️ CLASE CSS PARA EL TÍTULO */}
            ¡MEGA OFERTA DEL DÍA!
          </h2>
          <p className="description-text"> {/* ⬅️ CLASE CSS PARA LA DESCRIPCIÓN */}
            Aprovecha este descuento único por tiempo limitado.
          </p>

          {/* Contenedor de ofertas */}
          <div className="space-y-4">
            {offersToDisplay.map(offer => (
              <div key={offer._id} className="offer-card"> {/* ⬅️ CLASE CSS PARA CADA OFERTA */}
                <img 
                  src={offer.imageUrl} 
                  alt={offer.name} 
                  className="offer-image" // ⬅️ CLASE CSS PARA LA IMAGEN
                  // Fallback por si la imagen no carga
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/FEE2E2/DC2626?text=OFERTA"; }}
                />
                <div className="offer-info"> {/* ⬅️ CLASE CSS PARA LA INFO */}
                  <h3 className="line-clamp-1">{offer.name}</h3>
                  <p className="line-clamp-2">{offer.description}</p>
                  <div className="offer-price-display"> {/* ⬅️ CLASE CSS PARA EL PRECIO */}
                    <span className="new-price">${offer.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Mensaje si hay más ofertas que las mostradas */}
            {offers.length > offersToDisplay.length && (
                <p className="text-sm text-gray-500 mt-2">
                    ...y {offers.length - offersToDisplay.length} ofertas más!
                </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-150"
          >
            Ver todas las ofertas y productos
          </button>
        </div>
      </div>
    </div>
  );
};

export default MegaOfferModal;