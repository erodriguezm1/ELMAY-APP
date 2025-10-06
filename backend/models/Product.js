// ELMAY-APP/backend/models/Product.js
const mongoose = require('mongoose');

// Definimos el esquema del producto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  seller: {
    // Referencia al ID del vendedor que creó el producto
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    },
  isOffer: {
    type: Boolean,
    required: true,
    default: false,
  },
  isMegaOffer: {
    type: Boolean,
    required: true,
    default: false,
  },

}, {
  timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
});

// Creamos el modelo a partir del esquema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;