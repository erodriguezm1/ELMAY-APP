// ELMAY-APP/backend/controllers/productController.js
const Product = require('../models/Product');

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private (se necesita autenticación de vendedor)
const createProduct = async (req, res) => {
  const { name, description, price, imageUrl, stock } = req.body;
  
  // Asumimos que el ID del vendedor está disponible en el request
  // después de la autenticación. Por ejemplo, req.user._id
  const sellerId = req.user._id;

  if (!name || !description || !price || !imageUrl || !stock) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      stock,
      seller: sellerId,
      status: true,
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Producto creado con éxito',
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};
// @desc    Obtener TODOS los productos (ruta pública)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Encuentra todos los productos sin filtros
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

const getProductsAll = async (req, res) => {
  try {
    const products = await Product.find({}).populate('seller', 'name'); // Encuentra todos los productos sin filtros
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// @desc    Obtener los productos del vendedor logueado (ruta privada)
// @route   GET /api/products/seller
// @access  Private
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ seller: sellerId }).populate('seller', 'name'); // Filtra por el ID del vendedor
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos del vendedor', error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductsAll,
  getSellerProducts,
};
