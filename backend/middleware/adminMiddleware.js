const jwt = require('jsonwebtoken');

const admin = (req, res, next) => {
    // La propiedad 'user' se añade al request en el middleware 'protect'
    if (req.user && req.user.isAdmin) {
        next(); // El usuario es admin, permite el acceso a la siguiente función
    } else {
        res.status(403).json({ message: 'Acceso no autorizado: No es un administrador' });
    }
};

module.exports = { admin };