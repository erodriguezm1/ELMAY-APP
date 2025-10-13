import React, { useState, useEffect } from 'react';

// Componente de modal de oferta emergente con múltiples ofertas
const MegaOfferModal = ({ show, onClose, offers }) => {
  const [offersToDisplay, setOffersToDisplay] = useState([]);

  // Asegura que solo se muestren las primeras 3 ofertas (o las que existan)
  // Esto es un buen UX para un modal emergente, que no debe ser demasiado grande.
  useEffect(() => {
    if (show && offers.length > 0) {
      setOffersToDisplay(offers.slice(0, 3));
    }
  }, [show, offers]);
    
  // Si no se debe mostrar o no hay ofertas válidas, no renderizar
  if (!show || offersToDisplay.length === 0) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose} // Cierra si se hace clic fuera del modal
    >
      <div 
        className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-xl w-11/12 transform transition-transform duration-300 scale-100 relative"
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
          <h2 className="text-4xl font-extrabold text-red-600 mb-6">
            💥 ¡MEGA OFERTAS EXCLUSIVAS! 💥
          </h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Iterar sobre las ofertas filtradas para mostrarlas */}
            {offersToDisplay.map((offer) => (
              <div key={offer._id} className="bg-red-50 p-4 rounded-lg border border-red-300 flex flex-col sm:flex-row items-center space-x-4">
                <img 
                  src={offer.imageUrl} 
                  alt={offer.name} 
                  className="w-24 h-24 object-cover rounded-md shadow-md flex-shrink-0"
                  // Fallback por si la imagen no carga
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/FEE2E2/DC2626?text=OFERTA"; }}
                />
                <div className="text-left flex-grow mt-2 sm:mt-0">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{offer.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="text-3xl font-black text-red-700">${offer.price.toFixed(2)}</span>
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
            className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-200 shadow-lg uppercase tracking-wider"
          >
            Ver Todas las Ofertas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MegaOfferModal;