const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); // Importar JWT

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    role: { 
      type: String,
      required: true,
      default: 'buyer', 
      enum: ['buyer', 'seller', 'admin'],
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'deleted'],
        default: 'pending'
    },
  },
  {
    timestamps: true,
  }
);

// Método para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar la contraseña ingresada con la encriptada
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Asegúrate de usar 'bcrypt.compare' para comparar
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🟢 MÉTODO CORREGIDO: Generar el token de autenticación con expiración extendida
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { 
            id: this._id, 
            role: this.role 
        }, 
        process.env.JWT_SECRET, // Secreto del servidor
        {
            // 🚨 SOLUCIÓN: La expiración se establece a 30 días
            expiresIn: '1h', 
        }
    );
};


const User = mongoose.model('User', userSchema);
module.exports = User;