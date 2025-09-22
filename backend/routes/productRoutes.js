const express = require('express');
const router = express.Router();
const { 
    createProduct,
    getProducts,
    getProductById,
    getSellerProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Importamos el middleware de protección, si no lo tienes, deberás crearlo
const { protect } = require('../middleware/authMiddleware');

// @desc    Ruta para obtener todos los productos (pública) y crear un producto (privada)
// Las rutas más generales van antes que las específicas
router.route('/')
    .get(getProducts)
    .post(protect, createProduct);

router.get('/all', getProducts);

// @desc    Ruta para obtener los productos del vendedor logueado
// @route   GET /api/products/seller
// @access  Privado
router.get('/seller', protect, getSellerProducts);

// @desc    Rutas para obtener, actualizar y eliminar un producto por su ID
// @route   GET /api/products/:id
// @route   PUT /api/products/:id
// @route   DELETE /api/products/:id
// @access  GET es público, PUT y DELETE son privados
router.route('/:id')
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
