import React from 'react'; 
import './MegaOfferModal.css';

// Componente de modal de oferta emergente con múltiples ofertas
const MegaOfferModal = ({ show, onClose, offers }) => {
  
  const offersToRender = offers.slice(0, 3);

  if (!show || offersToRender.length === 0) return null;
  
  return (
    <div 
      // CLASE CORREGIDA: Usamos un nombre más específico para evitar conflictos
      className="mega-offer-modal-overlay"
      onClick={onClose} 
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-700 hover:text-red-600 transition-colors text-2xl font-bold"
          aria-label="Cerrar Oferta"
        >
          &times;
        </button>
        
        <h2 className="modal-title">¡Mega Ofertas Exclusivas!</h2>
        <p className="modal-subtitle">No te pierdas estas promociones por tiempo limitado.</p>
        
        <div className="offers-list">
          {offersToRender.map((offer, index) => (
            <div key={index} className="offer-item">
              <img 
                src={offer.imageUrl} 
                alt={offer.name} 
                className="offer-image"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/FEE2E2/DC2626?text=OFERTA"; }}
              />
              <div className="offer-info">
                <h3 className="line-clamp-1">{offer.name}</h3>
                <p className="line-clamp-2">{offer.description}</p>
                <div className="offer-price-display">
                  <span className="new-price">${offer.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          {offers.length > offersToRender.length && (
              <p className="text-sm text-gray-500 mt-2">
                  ...y {offers.length - offersToRender.length} ofertas más!
              </p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-150"
        >
          Entendido, ir a la tienda
        </button>
      </div>
    </div>
  );
};

export default MegaOfferModal;