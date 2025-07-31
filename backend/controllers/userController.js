// ELMAY-APP/backend/controllers/userController.js
const User = require('../models/User'); // Importamos nuestro modelo de usuario
const asyncHandler = require('express-async-handler'); // Utilidad para manejar errores asíncronos

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password, role } = req.body;

  // 1. Validar que todos los campos requeridos existen
  if (!username || !name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // 2. Verificar si el usuario ya existe
  const userExists = await User.findOne({ username });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 3. Crear el usuario
  const user = await User.create({
    username,
    name,
    email,
    password,
    role: role || 'buyer', // Asigna el rol si se envía, de lo contrario, por defecto es 'buyer'
  });

  // 4. Enviar una respuesta con el token JWT
  if (user) {
    res.status(201).json({
      _id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.generateAuthToken(), // Genera y devuelve el token
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
  
});
// @desc    Autenticar un usuario
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // 1. Verificar si el usuario existe por su email
  const user = await User.findOne({ username });

  // 2. Si el usuario existe y la contraseña es correcta, devolver el token
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.generateAuthToken(), // Genera y devuelve el token
    });
  } else {
    res.status(401); // 401 Unauthorized
    throw new Error('Invalid email or password');
  }
});

module.exports = {
  registerUser,
  loginUser,
};

