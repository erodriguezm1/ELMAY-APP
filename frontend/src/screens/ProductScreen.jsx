// ELMAY-APP/frontend/src/screens/ProductScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import ReviewsSection from '../components/ReviewsSection'; // Componente de reseñas a futuro
import './ProductScreen.css'; 

const API_URL = '/api';
const CART_API_URL = '/api/cart'; // 👈 URL de tu API de carrito

// Función de utilidad para obtener el token del usuario
const getUserToken = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData).token : null;
    } catch (e) {
        return null;
    }
};

const ProductScreen = () => {
    // Hooks de React Router
    const navigate = useNavigate();
    const { id: productId } = useParams(); 
    
    // Estados para la gestión de datos
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ESTADOS CLAVE PARA EL CARRITO
    const [qty, setQty] = useState(1); // Cantidad a comprar
    const [isAdding, setIsAdding] = useState(false); // 👈 Estado de carga al añadir
    const [notification, setNotification] = useState(null); // 👈 Para mensajes de éxito/error

    const token = getUserToken(); 

    // Hook para cargar los datos del producto (Mantenemos esta lógica)
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Asume que esta ruta trae todos los detalles necesarios
                const { data } = await axios.get(`${API_URL}/products/${productId}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError('No se pudo cargar el detalle del producto.');
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    // =================================================================
    // 💡 FUNCIÓN MODIFICADA: Añadir al carrito (llama a la API sin redirigir)
    // =================================================================
    const addToCartHandler = async () => {
        if (!token) {
            setNotification({ type: 'error', message: 'Debes iniciar sesión para añadir productos al carrito.' });
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (qty < 1 || qty > product.stock) {
            setNotification({ type: 'warning', message: `Cantidad inválida. Stock disponible: ${product.stock}.` });
            return;
        }

        setIsAdding(true);
        setNotification(null);

        try {
            // 🚨 LLAMADA CLAVE: POST /api/cart con el ID y la cantidad
            await axios.post(CART_API_URL, 
                { productId: productId, quantity: qty },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Éxito: Muestra la notificación y el usuario puede seguir navegando
            setNotification({ type: 'success', message: `${product.name} (x${qty}) añadido al carrito! 🎉` });
            
        } catch (err) {
            console.error("Error al añadir al carrito:", err);
            const errorMessage = err.response?.data?.message || 'Error al añadir el producto al carrito.';
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsAdding(false);
            // Limpiar la notificación después de 5 segundos
            setTimeout(() => setNotification(null), 5000);
        }
    };
    // =================================================================
    
    const goBack = () => {
        navigate(-1); 
    };

    const handleQtyChange = (newQty) => {
        const numQty = Number(newQty);
        // Validar que la cantidad sea positiva y no exceda el stock
        if (numQty < 1) {
            setQty(1);
        } else if (product && numQty > product.stock) {
            setQty(product.stock);
            setNotification({ type: 'warning', message: `Stock máximo alcanzado: ${product.stock}` });
            setTimeout(() => setNotification(null), 3000);
        } else {
            setQty(numQty);
        }
    };

    // Función para renderizar la lista de especificaciones (asume un objeto simple)
    const renderSpecifications = (specs) => {
        if (!specs || Object.keys(specs).length === 0) {
            return <p>No hay especificaciones disponibles.</p>;
        }
        return (
            <ul className="specifications-list">
                {Object.entries(specs).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return <div className="loading-state">Cargando producto...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    if (!product) {
        return <div className="not-found-state">Producto no encontrado.</div>;
    }
    
    // Los detalles extendidos se asumen que vienen en product.details
    const details = product.details || {};
    const totalPrice = (product.price * qty).toFixed(2);


    return (
        <div className="product-screen-container">
            <button onClick={goBack} className="back-button">
                ← Volver a la Lista
            </button>
            
            {/* 🚨 NOTIFICACIÓN: Se puede estilizar en ProductScreen.css */}
            {notification && (
                 <div className={`notification ${notification.type}`}>
                     {notification.message}
                 </div>
            )}

            {/* 1. CABECERA (Imagen y Controles) */}
            <section className="product-header-section">
                {/* 1.1 IMAGEN PRINCIPAL */}
                <div className="main-image-gallery">
                    <img 
                        src={product.imageUrl || '/default-product.jpg'} 
                        alt={product.name} 
                        className="main-product-image" 
                    />
                </div>

                {/* 1.2 INFORMACIÓN Y CONTROLES */}
                <div className="product-controls-box">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-summary">{product.description}</p>
                    
                    {/* Información de Vendedor y Stock */}
                    <div className="seller-stock-info">
                        <p className="seller-name">Vendido por: <strong>{product.seller.name}</strong></p>
                        <p className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? `En Stock: ${product.stock}` : 'Agotado'}
                        </p>
                    </div>

                    <div className="price-section">
                        <div className="price-display">
                            <span className="price-label">Precio Unitario</span>
                            <span className="price-tag">${product.price.toFixed(2)}</span>
                            <span className="old-price">${(product.price * 1.3).toFixed(2)}</span>
                        </div>

                        {/* CONTROLES DE CANTIDAD */}
                        <div className="add-to-cart-controls">
                            <label htmlFor="qty-input" className="qty-label">Cantidad:</label>
                            <input 
                                id="qty-input"
                                type="number" 
                                value={qty} 
                                onChange={(e) => handleQtyChange(e.target.value)} 
                                min="1" 
                                max={product.stock}
                                className="qty-input"
                                disabled={product.stock <= 0 || isAdding}
                            />
                            
                            <div className="total-price-display">
                                <span className="total-label">Total Est.</span>
                                <span className="total-value">${totalPrice}</span>
                            </div>

                            <button 
                                onClick={addToCartHandler} 
                                className="add-to-cart-button"
                                disabled={product.stock <= 0 || isAdding}
                            >
                                {isAdding ? 'Añadiendo...' : '🛒 Añadir al Carrito'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* 2. DESCRIPCIÓN LARGA */}
            {details.longDescription && (
                <section className="description-section">
                    <h2>Descripción Detallada</h2>
                    <p>{details.longDescription}</p>
                </section>
            )}

            {/* 3. ESPECIFICACIONES */}
            <section className="specifications-section">
                <h2>Especificaciones Técnicas</h2>
                {renderSpecifications(details.specifications)}
            </section>

            {/* 4. SECCIÓN DE IMÁGENES ADICIONALES (Galería Secundaria) */}
            {details.additionalImages && details.additionalImages.length > 0 && (
                <section className="additional-images-section">
                    <h2>Galería de Imágenes</h2>
                    <div className="additional-images-grid">
                        {details.additionalImages.map((img, index) => (
                            <figure key={index} className="additional-image-figure">
                                <img src={img.url} alt={img.caption || `Imagen adicional ${index + 1}`} />
                                {img.caption && <figcaption>{img.caption}</figcaption>}
                            </figure>
                        ))}
                    </div>
                </section>
            )}

            {/* 5. SECCIÓN DE COMENTARIOS Y CALIFICACIONES (A futuro) */}
            <section className="reviews-section">
                <h2>Comentarios y Calificaciones</h2>
                <p>¡Aquí se integrará el componente de reseñas!</p>
            </section>
        </div>
    );
};

export default ProductScreen;