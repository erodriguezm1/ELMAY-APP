const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const ProductDetail = require('../models/ProductDetail');

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
    const products = await Product.find({ status: 'active' }).populate('seller', 'name').populate('details');; 
    res.status(200).json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name').populate('details');;

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
    
    // 1. Verificar si el producto existe antes de intentar actualizar
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado');
    }

    // 2. Validar Permisos
    const isAdmin = req.user.role === 'admin';
    const isOwner = product.seller.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
        res.status(401);
        throw new Error('No estás autorizado para actualizar este producto. Solo el vendedor o un administrador.');
    }
    
    // 3. Construir el objeto de actualización basado en req.body y permisos
    let updateFields = {};
    const bodyKeys = Object.keys(req.body);

    for (const [key, value] of Object.entries(req.body)) {
        
        // --- CÓMO MANEJAR CADA CAMPO ---
        
        // A. Campos sensibles solo para el Administrador (status, isOffer, isMegaOffer)
        if (['status', 'isOffer', 'isMegaOffer'].includes(key)) {
            if (isAdmin) {
                // Si el administrador envía el campo, lo añade al objeto de actualización.
                updateFields[key] = value;
            } else {
                // Ignora silenciosamente si un vendedor intenta cambiar campos de admin
                console.warn(`Vendedor ${req.user._id} intentó cambiar el campo de administrador: ${key}`);
                continue; 
            }
        } 
        
        // B. Campos básicos (permitido por Admin o Dueño)
        else if (['name', 'category', 'subcategory', 'description', 'price', 'imageUrl', 'stock'].includes(key)) {
            // Asigna directamente el valor.
            updateFields[key] = value;
        }
        
        // C. Ignorar otros campos inesperados
    }

    // 4. Verificar si hubo un intento de actualizar un campo de administrador sin ser admin
    if (!isAdmin && bodyKeys.some(key => ['status', 'isOffer', 'isMegaOffer'].includes(key)) && Object.keys(updateFields).length === 0) {
         res.status(403);
         throw new Error('No tienes permiso para modificar el estado o las ofertas.');
    }
    
    // 5. Realizar la actualización en un solo paso con Mongoose (findByIdAndUpdate)
    // Esto es mucho más robusto para actualizaciones parciales y maneja mejor los campos 'required'.
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields }, // Usa $set para actualizar solo los campos en updateFields
        { new: true, runValidators: true } // 'new: true' devuelve el doc actualizado. 'runValidators' valida los campos que se actualizan.
    )
    .populate('seller', 'name'); // Popula el vendedor para que el frontend lo reciba

    if (!updatedProduct) {
        // En caso de que el producto se haya borrado justo antes de la actualización
        res.status(404);
        throw new Error('Producto no encontrado después del intento de actualización');
    }
    
    res.status(200).json(updatedProduct);
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

// @desc    Crea o Actualiza los detalles avanzados de un producto
// @route   POST /api/products/:id/details
// @access  Private (Seller/Admin)
const createOrUpdateProductDetail = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { longDescription, additionalImages, specifications } = req.body;
    
    // 1. Verificación de Seguridad y Existencia del Producto
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Producto principal no encontrado.');
    }

    // 2. Verificación de Permisos (Solo el dueño o un admin)
    const isOwner = product.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
        res.status(403); // Forbidden
        throw new Error('No autorizado. Solo el vendedor original o un administrador pueden gestionar los detalles.');
    }
    
    // 3. Crear o Actualizar usando findOneAndUpdate (Upsert)
    // Buscamos un detalle que tenga la referencia a este producto
    const detailData = { longDescription, additionalImages, specifications, product: productId };

    const detail = await ProductDetail.findOneAndUpdate(
        { product: productId }, // Criterio de búsqueda
        { $set: detailData }, // Los datos a actualizar/insertar
        { 
            new: true, // Devuelve el documento después de la actualización
            upsert: true, // CRÍTICO: Si no existe, lo crea
            setDefaultsOnInsert: true // Aplica los valores por defecto si se crea
        }
    );

    res.status(200).json(detail);
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    createOrUpdateProductDetail,
    getSellerProducts,
    updateProduct,
    deleteProduct
};
