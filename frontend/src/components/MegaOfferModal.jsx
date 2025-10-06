import React from 'react';

// Componente de modal de oferta emergente
// Se muestra una sola vez al cargar la página de inicio.
const MegaOfferModal = ({ show, onClose, offerDetails }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose} // Cierra si se hace clic fuera del modal
    >
      <div 
        className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-lg w-11/12 transform transition-transform duration-300 scale-100 relative"
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
          <h2 className="text-4xl font-extrabold text-red-600 mb-2 animate-pulse">
            ¡MEGA OFERTA DEL DÍA!
          </h2>
          <p className="text-gray-700 mb-6 text-lg">
            Aprovecha este descuento único por tiempo limitado.
          </p>

          {/* Producto de ejemplo */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-300">
            <h3 className="text-2xl font-semibold text-gray-800 mb-1">{offerDetails.name}</h3>
            <img 
              src={offerDetails.image} 
              alt={offerDetails.name} 
              className="w-full h-40 object-cover rounded-lg my-4 shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x160/FEE2E2/DC2626?text=OFERTA"; }}
            />
            <div className="flex justify-center items-baseline space-x-4">
              <span className="text-xl text-gray-500 line-through">${offerDetails.oldPrice}</span>
              <span className="text-4xl font-black text-red-700">${offerDetails.newPrice}</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition duration-200 shadow-lg"
          >
            Ver Detalles y Comprar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default MegaOfferModal;
