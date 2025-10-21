// ELMAY-APP/frontend/src/screens/CartScreen.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './CartScreen.css'; 

const API_URL = '/api/cart';

// Función de utilidad para obtener el token del usuario
const getUserToken = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData).token : null;
    } catch (e) {
        console.error("Error al obtener token del usuario:", e);
        return null;
    }
};

const CartScreen = () => {
    const navigate = useNavigate();
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null });
    const token = getUserToken();

    // Encabezados para solicitudes protegidas
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    
    // Función central para cargar el carrito
    const fetchCart = useCallback(async () => {
        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(API_URL, config);
            setCart(data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("Error al cargar el carrito:", err);
            // Si el error es 401, redirigir al login
            if (err.response && err.response.status === 401) {
                navigate('/login');
            } else {
                setError('Error al cargar el carrito. Intenta nuevamente.');
                setLoading(false);
            }
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);


    // =================================================================
    // 💡 MANEJO DE CANTIDAD Y ELIMINACIÓN
    // =================================================================

    const updateItemQuantity = async (itemId, newQuantity) => {
        if (updateStatus.loading) return;

        setUpdateStatus({ loading: true, error: null });

        try {
            // Llama a la ruta PUT con el nuevo ID del ítem y la cantidad
            const { data } = await axios.put(`${API_URL}/${itemId}`, 
                { quantity: newQuantity }, 
                config
            );
            
            // Actualiza el estado local del carrito con la respuesta del backend
            setCart(data); 

            setUpdateStatus({ loading: false, error: null });
        } catch (err) {
            console.error("Error al actualizar la cantidad:", err);
            const errorMessage = err.response?.data?.message || 'Error al actualizar el ítem. Verifica el stock.';
            setUpdateStatus({ loading: false, error: errorMessage });
            // Después de un error, recargar el carrito para sincronizar el estado
            setTimeout(fetchCart, 2000); 
        }
    };

    const removeItemFromCart = (itemId) => {
        // Al actualizar a cantidad 0, el backend lo elimina
        if (window.confirm('¿Estás seguro de que deseas eliminar este artículo del carrito?')) {
            updateItemQuantity(itemId, 0); 
        }
    };

    const checkoutHandler = () => {
        // Lógica de navegación a la pantalla de Checkout/Pago
        navigate('/checkout'); 
    };

    // =================================================================

    if (loading) {
        return <div className="cart-container loading-state">Cargando tu carrito...</div>;
    }

    if (error) {
        return <div className="cart-container error-state">{error}</div>;
    }

    // Si el carrito existe y no tiene ítems
    if (cart.items.length === 0) {
        return (
            <div className="cart-container info-state">
                <h1 className="cart-title">Tu Cesta de Compras</h1>
                <p>Tu carrito está vacío. ¡Es hora de empezar a comprar!</p>
                <Link to="/" className="back-to-shop-btn">
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver a la Tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1 className="cart-title">Tu Cesta de Compras ({cart.totalItems} Artículos)</h1>

            {updateStatus.error && (
                <div className="notification error">{updateStatus.error}</div>
            )}
            {updateStatus.loading && (
                 <div className="notification loading-update">Actualizando carrito...</div>
            )}

            <div className="cart-content-grid">
                
                {/* COLUMNA 1: Listado de Ítems */}
                <div className="cart-items-list">
                    {cart.items.map(item => (
                        <div key={item._id} className="cart-item-card">
                            
                            {/* Imagen y Nombre */}
                            <Link to={`/product/${item.product._id}`} className="cart-item-image-link">
                                <img 
                                    src={item.product.imageUrl || '/default-product.jpg'} 
                                    alt={item.product.name} 
                                    className="cart-item-image"
                                />
                            </Link>
                            
                            <div className="cart-item-details">
                                <Link to={`/product/${item.product._id}`} className="cart-item-name">
                                    {item.product.name}
                                </Link>
                                <p className="price-at-purchase">
                                    Precio: <span>${item.priceAtPurchase.toFixed(2)}</span>
                                </p>
                                <p className="seller-info">
                                    Vendedor: <span>{item.product.seller?.name || 'Vendedor Desconocido'}</span>
                                </p>
                            </div>

                            {/* Controles de Cantidad */}
                            <div className="cart-item-controls">
                                <label htmlFor={`qty-${item._id}`}>Cantidad:</label>
                                <select 
                                    id={`qty-${item._id}`}
                                    value={item.quantity} 
                                    onChange={(e) => updateItemQuantity(item._id, Number(e.target.value))}
                                    // Limita el máximo al stock disponible del producto
                                    disabled={updateStatus.loading}
                                >
                                    {[...Array(item.product.stock).keys()].map(x => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                                
                                <span className="item-subtotal">
                                    Subtotal: <strong>${(item.priceAtPurchase * item.quantity).toFixed(2)}</strong>
                                </span>
                            </div>

                            {/* Botón de Eliminar */}
                            <button 
                                className="remove-item-btn" 
                                onClick={() => removeItemFromCart(item._id)}
                                disabled={updateStatus.loading}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* COLUMNA 2: Resumen de la Orden */}
                <div className="cart-summary-box">
                    <h2>Resumen de la Orden</h2>
                    <div className="summary-line">
                        <span>Subtotal ({cart.totalItems} artículos)</span>
                        <span>${(cart.totalPrice).toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                        <span>Costo de Envío (Est.)</span>
                        <span className="shipping-cost">Gratis</span> 
                    </div>
                    <div className="summary-line total">
                        <span>Total Estimado</span>
                        <span className="final-price">${(cart.totalPrice).toFixed(2)}</span>
                    </div>
                    
                    <button 
                        onClick={checkoutHandler} 
                        className="checkout-btn"
                        disabled={cart.totalItems === 0 || updateStatus.loading}
                    >
                        Proceder al Pago
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartScreen;