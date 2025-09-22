const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware para proteger rutas, asegurando que el usuario está autenticado.
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Verificamos si hay un token en los encabezados de la solicitud
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Obtenemos el token de los encabezados
            token = req.headers.authorization.split(' ')[1];

            // 3. Verificamos el token con la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Buscamos al usuario por el ID decodificado del token, excluyendo la contraseña
            req.user = await User.findById(decoded.id).select('-password');

            // 5. Si no se encuentra al usuario, lanzamos un error
            if (!req.user) {
                res.status(401);
                throw new Error('No autorizado, usuario no encontrado');
            }

            // 6. Si todo está bien, pasamos al siguiente middleware
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('No autorizado, el token ha fallado');
        }
    }

    // 7. Si no hay token en los encabezados, lanzamos un error
    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no hay token');
    }
});

// Middleware para autorizar roles específicos
const authorize = (...roles) => {
    return (req, res, next) => {
        // Verificamos si el rol del usuario está incluido en la lista de roles permitidos
        if (!roles.includes(req.user.role)) {
            res.status(403); // 403 Forbidden
            throw new Error(`El rol del usuario (${req.user.role}) no está autorizado para acceder a esta ruta`);
        }
        next();
    };
};

module.exports = { protect, authorize };
