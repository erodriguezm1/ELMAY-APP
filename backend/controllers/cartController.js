// ELMAY-APP/backend/controllers/cartController.js
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Necesario para obtener el precio actual

// @desc    Obtener el carrito del usuario (o crearlo si no existe)
// @route   GET /api/cart
// @access  Private (Usuario autenticado)
const getUserCart = asyncHandler(async (req, res) => {
    // Usamos findOneAndUpdate con upsert para asegurar que siempre haya un carrito.
    let cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { user: req.user._id }, // Asegura que el campo 'user' esté en el documento si se crea
        { 
            new: true, // Devuelve el nuevo documento
            upsert: true, // Crea si no existe
            setDefaultsOnInsert: true
        }
    ).populate('items.product', 'name imageUrl price stock'); 
    // Populamos los datos básicos del producto para el frontend

    res.status(200).json(cart);
});

// @desc    Agregar un ítem al carrito o actualizar la cantidad
// @route   POST /api/cart
// @access  Private (Usuario autenticado)
const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);
    
    if (!productId || qty < 1) {
        res.status(400);
        throw new Error('Debe especificar un producto y una cantidad válida (mínimo 1).');
    }

    // 1. Obtener el producto para verificar existencia, precio y stock
    const product = await Product.findById(productId);

    if (!product || product.status !== 'active') {
        res.status(404);
        throw new Error('Producto no encontrado o inactivo.');
    }

    if (qty > product.stock) {
        res.status(400);
        throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
    }

    // 2. Encontrar o crear el carrito del usuario
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // 3. Verificar si el ítem ya existe en el carrito
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Ítem existe: actualizar la cantidad
        const currentQty = cart.items[itemIndex].quantity;
        const newTotalQty = currentQty + qty;
        
        if (newTotalQty > product.stock) {
            res.status(400);
            throw new Error(`No se puede agregar. El stock disponible es ${product.stock} y ya tienes ${currentQty} en el carrito.`);
        }
        
        cart.items[itemIndex].quantity = newTotalQty;
    } else {
        // Ítem no existe: agregarlo
        const item = {
            product: productId,
            priceAtPurchase: product.price, // Guardamos el precio actual del producto
            quantity: qty,
        };
        cart.items.push(item);
    }
    
    // 4. Guardar el carrito (el middleware 'pre-save' recalculará los totales)
    await cart.save();
    
    // 5. Devolver el carrito actualizado con los productos populados
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name imageUrl price stock');

    res.status(200).json(updatedCart);
});

// @desc    Actualizar la cantidad de un ítem en el carrito o removerlo si quantity es 0
// @route   PUT /api/cart/:itemId
// @access  Private (Usuario autenticado)
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const itemId = req.params.itemId; // El ID del sub-documento (cartItem)
    const qty = Number(quantity);

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Carrito no encontrado.');
    }
    
    // 1. Encontrar el índice del ítem en el carrito
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex < 0) {
        res.status(404);
        throw new Error('Ítem de carrito no encontrado.');
    }

    // 2. Si la cantidad es 0 o menos, eliminar el ítem
    if (qty <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        // 3. Actualizar la cantidad (con verificación de stock)
        const productId = cart.items[itemIndex].product;
        const product = await Product.findById(productId);
        
        if (!product || product.status !== 'active') {
            // Producto descontinuado o eliminado, se recomienda remover del carrito
            cart.items.splice(itemIndex, 1);
            await cart.save();
            res.status(400);
            throw new Error('El producto ya no está disponible. Ítem removido.');
        }

        if (qty > product.stock) {
            res.status(400);
            throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        }
        
        cart.items[itemIndex].quantity = qty;
    }

    // 4. Guardar y devolver
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name imageUrl price stock');
    res.status(200).json(updatedCart);
});

// Exportar funciones
module.exports = {
    getUserCart,
    addItemToCart,
    updateCartItem,
};