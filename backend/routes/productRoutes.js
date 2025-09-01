// ELMAY-APP/backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getSellerProducts, getProductsAll } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware'); 
// Ruta para crear un producto. Requiere que el usuario esté autenticado.
router.route('/').post(protect, createProduct);
// @route   GET /api/products
// @desc    Ruta pública para obtener todos los productos

router.get('/', getProducts);
router.get('/all', getProductsAll);
// @route   GET /api/products/seller
// @desc    Ruta privada para obtener los productos del vendedor logueado
router.get('/seller', protect, getSellerProducts);



module.exports = router;
