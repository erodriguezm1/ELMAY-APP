// ELMAY-APP/backend/models/Cart.js
const mongoose = require('mongoose');

// Sub-esquema para los ítems dentro del carrito
const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Referencia al modelo Product
        required: true,
    },
    // Capturamos el precio en el momento de agregarlo al carrito para evitar problemas si el precio cambia
    priceAtPurchase: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, {
    // Esto es útil si quieres saber cuándo se agregó un artículo al carrito
    timestamps: true,
});

const cartSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // Cada usuario solo puede tener un carrito activo
        },
        items: [cartItemSchema], // Arreglo de los ítems del carrito
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalItems: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true, // Registra cuándo se creó o actualizó el carrito
    }
);

// Middleware (pre-save) para calcular el total antes de guardar el carrito
cartSchema.pre('save', function(next) {
    let total = 0;
    let totalQuantity = 0;
    
    this.items.forEach(item => {
        // Se asegura de que el precio y la cantidad sean números válidos
        const price = item.priceAtPurchase || 0;
        const qty = item.quantity || 0;
        
        total += price * qty;
        totalQuantity += qty;
    });

    this.totalPrice = total;
    this.totalItems = totalQuantity;
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;