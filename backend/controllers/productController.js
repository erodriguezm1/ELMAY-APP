const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Privado (se necesita autenticación de vendedor)
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, imageUrl, stock } = req.body;
    
    // Asumimos que el ID del vendedor está disponible en el request
    const sellerId = req.user._id;

    if (!name || !description || !price || !imageUrl || !stock) {
        res.status(400);
        throw new Error('Todos los campos son obligatorios');
    }

    const newProduct = new Product({
        name,
        description,
        price,
        imageUrl,
        stock,
        seller: sellerId,
        status: 'pending', // Usamos 'pending' según el enum de tu modelo
    });

    const createdProduct = await newProduct.save();

    res.status(201).json({
        message: 'Producto creado con éxito',
        product: createdProduct,
    });
});

// @desc    Obtener TODOS los productos (ruta pública)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // Aquí puedes decidir si quieres poblar el vendedor por defecto
    const products = await Product.find({}).populate('seller', 'name'); 
    res.status(200).json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Obtener los productos del vendedor logueado (ruta privada)
// @route   GET /api/products/seller
// @access  Private
const getSellerProducts = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;
    const products = await Product.find({ seller: sellerId }).populate('seller', 'name');
    res.status(200).json(products);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, imageUrl, stock, status } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Validar si el usuario autenticado es el mismo que el vendedor del producto
        if (product.seller.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('No estás autorizado para actualizar este producto');
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.imageUrl = imageUrl || product.imageUrl;
        product.stock = stock || product.stock;
        product.status = status || product.status;
        
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // Validar si el usuario autenticado es el mismo que el vendedor del producto
        if (product.seller.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('No estás autorizado para eliminar este producto');
        }

        await product.remove();
        res.json({ message: 'Producto eliminado con éxito' });
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getSellerProducts,
    updateProduct,
    deleteProduct
};
