const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Privado (se necesita autenticación de vendedor)
const createProduct = asyncHandler(async (req, res) => {
    // status y isOffer tienen valores por defecto en el esquema, por lo que 
    // no los requerimos en la validación inicial
    const { name, category, subcategory, description, price, imageUrl, stock } = req.body;
    
    // Asumimos que el ID del vendedor está disponible en el request
    const sellerId = req.user._id;

    // CRITICAL FIX: Retiramos 'status' y 'isOffer' de la validación ya que tienen defaults
    if (!name || !category || !subcategory || !description || !price || !imageUrl || !stock) {
        res.status(400);
        throw new Error('Los campos obligatorios (nombre, categoría, descripción, precio, url de imagen y stock) deben ser proporcionados.');
    }

    // Nota: 'status' y 'isOffer' se pasan solo si se proveen en el body,
    // de lo contrario, Mongoose usará los valores 'active' y false.
    const newProduct = new Product({
        name,
        category,
        subcategory,
        description,
        price,
        imageUrl,
        stock,
        seller: sellerId,
        // Usamos desestructuración aquí para capturar isOffer, status, e isMegaOffer si vienen, o usamos defaults
        status: req.body.status,
        isOffer: req.body.isOffer,
        isMegaOffer: req.body.isMegaOffer,
    });

    const createdProduct = await newProduct.save();

    res.status(201).json({
        message: 'Producto creado con éxito',
        product: createdProduct,
    });
});

// @desc    Obtener TODOS los productos (ruta pública)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // CRITICAL FIX: Solo mostrar productos que estén 'active'.
    const products = await Product.find({ status: 'active' }).populate('seller', 'name'); 
    res.status(200).json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name');

    // CRITICAL FIX: Si el producto está "deleted", se considera no encontrado para el público.
    if (product && product.status !== 'deleted') {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Obtener los productos del vendedor logueado (ruta privada)
// @route   GET /api/products/seller
// @access  Private
const getSellerProducts = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;
    // CRITICAL FIX: Mostrar todos los productos del vendedor, excepto los 'deleted'
    // Los vendedores deberían poder ver sus productos 'suspended'.
    const products = await Product.find({ 
        seller: sellerId,
        status: { $ne: 'deleted' } // $ne significa "not equal"
    }).populate('seller', 'name');
    
    res.status(200).json(products);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
    // Agregamos isMegaOffer a la desestructuración de req.body
    const { name, category, subcategory, description, price, imageUrl, stock, status, isOffer, isMegaOffer } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // Validar si el usuario autenticado es el mismo que el vendedor del producto
        // Permite a los administradores actualizar cualquier producto
        const isAdmin = req.user.role === 'admin';
        const isOwner = product.seller.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            res.status(401);
            throw new Error('No estás autorizado para actualizar este producto. Solo el vendedor o un administrador.');
        }
        
        // 1. Actualización de campos básicos (permitido por Admin o Dueño)
        product.name = name !== undefined ? name : product.name;
        product.category = category !== undefined ? category : product.category;
        product.subcategory = subcategory !== undefined ? subcategory : product.subcategory;
        product.description = description !== undefined ? description : product.description;
        product.price = price !== undefined ? price : product.price;
        product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
        product.stock = stock !== undefined ? stock : product.stock;
        
        // 2. CONTROL DE ESTADO (active, suspended, deleted)
        // Solo el administrador puede cambiar el 'status'
        if (isAdmin && status !== undefined) {
             // Permite al Admin cambiar entre 'active', 'suspended', 'deleted' (aunque deleteProduct es preferida para 'deleted')
             product.status = status;
        }

        // 3. CONTROL DE OFERTAS (isOffer, isMegaOffer)
        // Solo el administrador puede controlar si el producto es una Oferta o Mega Oferta
        if (isAdmin) {
            if (isOffer !== undefined) {
                product.isOffer = isOffer;
            }
            // NOTA: Debes añadir 'isMegaOffer' como campo booleano a tu Product Schema.
            if (isMegaOffer !== undefined) {
                product.isMegaOffer = isMegaOffer; 
            }
        }
        
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
});

// @desc    Eliminar un producto (Soft Delete)
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }
    
    // CRITICAL FIX: El rol del usuario está en req.user.role, no en product.user.role.
    // Verificación de Rol: Solo los 'admin' pueden marcar como 'deleted'.
    if (req.user.role !== 'admin') {
        res.status(403); // 403 Forbidden
        throw new Error('Acceso denegado. Solo los administradores pueden eliminar (soft delete) productos.');
    }

    // Implementación de Soft Delete
    product.status = 'deleted';
    await product.save();
    
    // El producto ya no estará visible en las rutas GET
    res.json({ message: 'Producto marcado como eliminado (soft delete) con éxito' });
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getSellerProducts,
    updateProduct,
    deleteProduct
};
