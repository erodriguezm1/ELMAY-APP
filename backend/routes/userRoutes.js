// ELMAY-APP/backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// La ruta POST /api/users ejecutará la función registerUser
router.post('/', registerUser);

// La nueva ruta POST /api/users/login
router.post('/login', loginUser);

// Ruta de prueba protegida
router.get('/profile', protect, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!` });
});

// Nueva ruta protegida con autorización (solo para sellers, y admins)
router.get('/dashboard', protect, authorize('seller', 'admin'), (req, res) => {
  res.json({ message: `Welcome to the seller dashboard, ${req.user.username}!` });
});

// Nueva ruta protegida con autorización (para todos los perfiles)
router.get('/index', protect, authorize('buyer', 'seller', 'admin'), (req, res) => {
  res.json({ message: `Welcome to the buyer dashboard, ${req.user.username}!` });
});

// Nueva ruta protegida con autorización (solo para admins)
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.json({ message: `Welcome to the admin dashboard, ${req.user.username}!` });
});

module.exports = router;