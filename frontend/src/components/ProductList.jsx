// ELMAY-APP/frontend/src/components/ProductList.jsx

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ProductList.css'; // Asegúrate de tener este CSS
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom"; 
// Asume que tienes un componente para acciones de Admin
import AdminProductActions from './AdminProductActions.jsx'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

// URL de la API
const API_URL = '/api'; 
const CART_API_URL = '/api/cart'; 

// Función de utilidad para obtener datos del usuario de localStorage de manera segura y consistente
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al parsear el usuario de localStorage:", e);
        return null;
    }
};

// =================================================================
// 💡 ProductList usa forwardRef para que el padre (Home/AdminPanel) pueda 
// llamar a la función de recarga
// =================================================================
const ProductList = forwardRef((props, ref) => {
    // Destructuramos las props del componente padre
    const { isAdmin, isSeller, filterCategory, filterSubcategory, searchQuery, onProductUpdated } = props;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null); // Para notificaciones rápidas
    const [isActionLoading, setIsActionLoading] = useState(false); // Para el botón de carrito
    const navigate = useNavigate();
    
    // Obtener datos del usuario de forma consistente
    const userData = getUserData();
    const userRole = userData?.role;
    const userToken = userData?.token;
    const isUserLoggedIn = !!userToken;

    // =================================================================
    // 💡 FUNCIÓN CLAVE: Recarga la lista de productos
    // =================================================================
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        // 1. Construir la URL de la API con los filtros
        let url = `${API_URL}/products`;
        
        // Si no es Admin/Seller, usamos la ruta pública de todos los productos
        if (!isAdmin && !isSeller) {
            url = `${API_URL}/products/all`;
        } else {
            // Si es Admin/Seller, podemos cargar todos los productos o solo los del vendedor
            // Aquí puedes ajustar para cargar solo los del vendedor si es necesario
            if (isSeller && !isAdmin) {
                url = `${API_URL}/products/seller/${userData._id}`; 
            }
        }

        // 2. Añadir parámetros de búsqueda y filtro
        const params = new URLSearchParams();
        if (filterCategory) params.append('category', filterCategory);
        if (filterSubcategory) params.append('subcategory', filterSubcategory);
        if (searchQuery) params.append('search', searchQuery);

        const fullUrl = `${url}?${params.toString()}`;

        try {
            const { data } = await axios.get(fullUrl);
            setProducts(data);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError('No se pudieron cargar los productos. Inténtalo más tarde.');
            setProducts([]); // Asegura que no se muestre data antigua
        } finally {
            setLoading(false);
        }
    };
    // =================================================================


    // Ejecutar la carga de productos al inicio y cuando cambian los filtros
    useEffect(() => {
        fetchProducts();
    }, [filterCategory, filterSubcategory, searchQuery, isAdmin, isSeller]); // Dependencias

    
    // =================================================================
    // 💡 LÓGICA DE AÑADIR AL CARRITO (Función Rápida)
    // =================================================================
    const addToCartQuickHandler = async (productId, productName, stock) => {
        if (!isUserLoggedIn) {
            setNotification({ type: 'error', message: 'Debes iniciar sesión para añadir productos al carrito.' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (stock < 1) {
            setNotification({ type: 'error', message: `El producto ${productName} está agotado.` });
            return;
        }
        
        setIsActionLoading(true);
        setNotification(null); // Limpiar notificaciones previas

        try {
            // 🚨 LLAMADA CLAVE: POST /api/cart para añadir 1 unidad
            await axios.post(CART_API_URL, 
                { productId: productId, quantity: 1 }, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            // Éxito: Muestra la notificación y el usuario puede seguir navegando
            setNotification({ type: 'success', message: `${productName} añadido al carrito! 🎉` });

        } catch (err) {
            console.error("Error al añadir al carrito:", err);
            const errorMessage = err.response?.data?.message || 'Error al añadir el producto al carrito.';
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsActionLoading(false);
            // Limpiar la notificación después de 4 segundos
            setTimeout(() => setNotification(null), 4000);
        }
    };
    // =================================================================


    // =================================================================
    // 💡 LÓGICA DE ELIMINACIÓN (Solo Admin/Seller)
    // =================================================================
    const handleDelete = async (productId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción es irreversible.')) {
            return;
        }
        
        setIsActionLoading(true);

        try {
            await axios.delete(`${API_URL}/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });

            // Actualiza la lista eliminando el producto
            setProducts(products.filter(p => p._id !== productId));
            setNotification({ type: 'success', message: 'Producto eliminado con éxito.' });
            
            // Llama a la función de prop si existe para notificar al padre
            if (onProductUpdated) onProductUpdated();
            
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            const errorMessage = err.response?.data?.message || 'Error al eliminar el producto.';
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsActionLoading(false);
            setTimeout(() => setNotification(null), 4000);
        }
    };
    // =================================================================

    // Función que se expone al componente padre (usando useImperativeHandle)
    useImperativeHandle(ref, () => ({
        refreshProducts: fetchProducts,
    }));


    // Función para manejar la actualización de un producto (desde AdminProductActions)
    const handleProductUpdate = (updatedProduct) => {
        setProducts(products.map(p => 
            p._id === updatedProduct._id ? updatedProduct : p
        ));
        if (onProductUpdated) onProductUpdated();
    };


    if (loading) {
        return <div className="loading-state">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    if (products.length === 0) {
        // Mensaje diferente si es un vendedor o un cliente
        if (isSeller) {
             return <div className="info-state">Aún no has agregado ningún producto.</div>;
        }
        return <div className="info-state">No se encontraron productos que coincidan con los filtros.</div>;
    }

    // El ID del vendedor (si está logueado)
    const sellerId = userData?._id; 
    
    return (
        <div className="product-list-container">
            {/* 🚨 NOTIFICACIÓN RÁPIDA */}
            {notification && (
                 <div className={`notification ${notification.type}`}>
                     {notification.message}
                 </div>
            )}

            <div className="product-grid">
                {products.map(product => (
                    <div key={product._id} className="product-card">
                        
                        {/* 1. Imagen y enlace al detalle */}
                        <Link to={`/product/${product._id}`} className="product-image-link">
                            <img 
                                src={product.imageUrl || '/default-product.jpg'} 
                                alt={product.name} 
                                className="product-image" 
                            />
                        </Link>

                        {/* 2. Cuerpo de la tarjeta */}
                        <div className="product-info">
                            <h3 className="product-name">
                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                            </h3>

                            {/* Detalle de precio y estado */}
                            <div className="price-status-group">
                                <span className="product-price offer-price">${product.price.toFixed(2)}</span>
                                <span className="original-price">${(product.price * 1.3).toFixed(2)}</span>
                                <span className={`status-badge ${product.status}`}>
                                    {product.status?.toUpperCase()}
                                </span>
                            </div>

                            {/* Stock */}
                            <p className={`stock-level ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                            </p>

                            {/* 3. Acciones de Usuario (Carrito y Detalle) */}
                            <div className="user-actions">
                                <button
                                    onClick={() => addToCartQuickHandler(product._id, product.name, product.stock)}
                                    className="add-to-cart-quick-button"
                                    disabled={product.stock <= 0 || isActionLoading}
                                >
                                    <FontAwesomeIcon icon={faShoppingCart} /> Añadir
                                </button>
                                <Link to={`/product/${product._id}`} className="view-details-button">
                                    Ver Detalle
                                </Link>
                            </div>
                            
                            {/* 4. Acciones de Administración / Vendedor */}
                            {(isAdmin || (isSeller && product.seller._id === sellerId)) && (
                                <div className="admin-seller-actions">
                                    {/* Componente para editar (modal) */}
                                    <AdminProductActions 
                                        product={product} 
                                        onUpdate={handleProductUpdate} 
                                        isSellerView={isSeller && !isAdmin} // Para ajustar la vista del componente
                                    />
                                    
                                    {/* Botón de eliminar (solo para el dueño o admin) */}
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="delete-button"
                                        disabled={isActionLoading}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ProductList;