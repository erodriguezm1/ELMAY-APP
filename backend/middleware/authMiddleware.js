// ELMAY-APP/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token de los encabezados (headers)
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Adjuntar el usuario de la base de datos a la petición
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401); // No autorizado
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden
      throw new Error('User role is not authorized to access this route');
    }
    next();
  };
};

module.exports = { protect, authorize };