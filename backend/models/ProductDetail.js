// ELMAY-APP/backend/models/ProductDetail.js
const mongoose = require('mongoose');

// Sub-esquema para las Calificaciones/Reviews
const reviewSchema = mongoose.Schema({
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional, si permites reviews de usuarios
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});

const productDetailSchema = mongoose.Schema(
    {
        // VINCULACIÓN: Referencia al producto padre
        // Este ID DEBE ser igual al _id del documento Product.
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            unique: true, 
        },
        // Múltiples imágenes
        additionalImages: [
            {
                url: { type: String, required: true },
                caption: { type: String, trim: true },
            }
        ],
        // Descripciones más detalladas
        longDescription: {
            type: String,
            trim: true,
            default: '',
        },
        // Especificaciones técnicas
        specifications: { 
            type: Object, // Usamos Object para flexibilidad (ej: { weight: '1kg', dimensions: '10x10x10' })
            default: {},
        },
        // Reviews (Sub-documentos)
        reviews: [reviewSchema],
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Aquí puedes añadir la lógica para actualizar el averageRating si lo deseas.

const ProductDetail = mongoose.model('ProductDetail', productDetailSchema);

module.exports = ProductDetail;