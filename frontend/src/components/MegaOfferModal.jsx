import React, { useState, useEffect } from 'react';

// Componente de modal de oferta emergente (Estilo Steam)
const MegaOfferModal = ({ show, onClose, offers }) => {
  const [offersToDisplay, setOffersToDisplay] = useState([]);

  // Usamos useEffect para asegurarnos de que solo se muestren 3 ofertas y para manejar el estado
  useEffect(() => {
    if (show && offers.length > 0) {
      // Tomamos hasta 3 ofertas para un diseño limpio y enfocado en el pop-up
      setOffersToDisplay(offers.slice(0, 3));
    }
  }, [show, offers]);
    
  // Si no se debe mostrar o no hay ofertas, no renderizar
  if (!show || offersToDisplay.length === 0) return null;
  
  // Puedes añadir un estado de carga si lo deseas, aunque la data ya está filtrada en Home.jsx
  
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
          <h2 className="text-4xl font-extrabold text-red-600 mb-6 animate-pulse">
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
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-200 shadow-lg uppercase tracking-wider"
          >
            ¡Explorar Ofertas Ahora!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MegaOfferModal;