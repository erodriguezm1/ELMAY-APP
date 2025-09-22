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

    // 3. Crear el usuario con 'status' por defecto a 'true'
    const user = await User.create({
        username,
        name,
        email,
        password,
        role: role || 'buyer', // Asigna el rol si se envía, de lo contrario, por defecto es 'buyer'
        status: "pending", // Nuevo atributo: siempre true al registrar
    });

    // 4. Enviar una respuesta con el token JWT
    if (user) {
        res.status(201).json({
            _id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
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

    // 1. Verificar si el usuario existe por su username
    const user = await User.findOne({ username });

    // 2. Si el usuario existe, la contraseña es correcta Y el status es 'true', devolver el token
    if (user && user.status && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            token: user.generateAuthToken(), // Genera y devuelve el token
        });
    } else {
        res.status(401); // 401 Unauthorized
        // Mensaje de error más específico para el usuario
        throw new Error('Invalid credentials or account is deactivated');
    }
});

// @desc    Obtener todos los usuarios (para el panel de admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    try {
        // En el panel de admin se muestran TODOS los usuarios, sin importar su status
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
});

// @desc    Actualizar un usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role, status } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role !== undefined ? role : user.role;
            user.status = status !== undefined ? status : user.status;

            const updatedUser = await user.save();
            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
});

// @desc    "Eliminar" (desactivar) un usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.status = "deleted"; // Soft delete: cambia el estado en lugar de eliminar
            await user.save();
            res.status(200).json({ message: 'Usuario desactivado con éxito' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar el usuario', error: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.username = req.body.username || user.username;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            token: updatedUser.generateAuthToken(),
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Get public users (with restricted fields)
// @route   GET /api/users/public
// @access  Public
const getPublicUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ status: true }).select('username name role');
    res.json(users);
});

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
    getPublicUsers
};
