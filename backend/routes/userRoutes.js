// ELMAY-APP/backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserProfile, 
  updateUserProfile,
  getPublicUsers 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// La ruta POST /api/users ejecutará la función registerUser
router.post('/register', registerUser);

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


// *************** RUTAS PARA EL PANEL DE ADMINISTRACIÓN ***************

// Rutas para obtener todos los usuarios y para gestionar un usuario específico
router.route('/')
    .get(protect, authorize('admin'), getUsers); // Cambiado a 'authorize('admin')'

router.route('/:id')
    .get(protect, authorize('admin'), getUserById) // Cambiado a 'authorize('admin')'
    .put(protect, authorize('admin'), updateUser) // Cambiado a 'authorize('admin')'
    .delete(protect, authorize('admin'), deleteUser); // Cambiado a 'authorize('admin')'

module.exports = router;
