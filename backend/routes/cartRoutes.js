// ELMAY-APP/backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getUserCart,
    addItemToCart,
    updateCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware'); // Asumimos que el carrito requiere autenticación

// Ruta principal del carrito
router.route('/')
    .get(protect, getUserCart)  // GET: Obtener el carrito del usuario
    .post(protect, addItemToCart); // POST: Agregar un ítem al carrito

// Ruta para actualizar o eliminar un ítem específico del carrito
router.route('/:itemId')
    .put(protect, updateCartItem); // PUT: Actualizar cantidad o eliminar (si quantity=0)

module.exports = router;