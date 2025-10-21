// ELMAY-APP/frontend/src/screens/ProductScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import ReviewsSection from '../components/ReviewsSection'; // Componente de reseñas a futuro
import './ProductScreen.css'; 

const API_URL = '/api';

const ProductScreen = () => {
    // Hooks de React Router
    const navigate = useNavigate();
    const { id: productId } = useParams(); 
    
    // Estados para la gestión de datos
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ESTADO CLAVE: Cantidad a comprar (inicia en 1)
    const [qty, setQty] = useState(1); 

    // Hook para cargar los datos del producto
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

    // Función de navegación para volver atrás
    const goBack = () => {
        navigate(-1); 
    };
    
    // Función que maneja cambios directos en el input de cantidad
    const handleQtyChange = (e) => {
        // Asegura que el valor sea un número entero positivo, mínimo 1
        const value = Math.max(1, parseInt(e.target.value, 10) || 1);
        setQty(value);
    };
    
    // Función que maneja la adición al carrito
    const addToCartHandler = () => {
        // Redirección simulada al carrito con los parámetros de ID y cantidad
        navigate(`/cart/${productId}?qty=${qty}`);
        console.log(`Añadiendo producto ${productId} con cantidad: ${qty} al carrito.`);
    };


    // Manejo de estados de UI
    if (loading) {
        return <div className="loading-screen">Cargando detalles del producto...</div>;
    }

    if (error) {
        return <div className="error-screen">{error}</div>;
    }

    if (!product) {
        return <div className="error-screen">Producto no encontrado.</div>;
    }
    
    // Desestructurar detalles y calcular el precio total
    const details = product.details || {}; 
    const totalPrice = (product.price * qty).toFixed(2); // Calculado en tiempo real

    // Función para renderizar especificaciones técnicas
    const renderSpecifications = (specs) => {
        if (!specs || Object.keys(specs).length === 0) {
            return <p>No hay especificaciones técnicas disponibles.</p>;
        }
        return (
            <ul className="specifications-list">
                {Object.entries(specs).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key.replace(/_/g, ' ')}:</strong> <span>{value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="product-screen-container">
            {/* 1. SECCIÓN PRINCIPAL: Imagen, Título, Precio y Resumen */}
            <button onClick={goBack} className="back-button">
                ← Volver a la Lista
            </button>
            <section className="product-header-section">
                
                {/* Panel de Imagen y Galería */}
                <div className="main-image-gallery">
                    <img src={product.imageUrl} alt={product.name} className="main-product-image" />
                </div>
                
                {/* Panel de Información, Precios y Compra */}
                <div className="product-info-panel">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-summary">{product.description}</p>
                    
                    <div className="price-section">
                        
                        {/* Visualización de Precios (Unitario y Total) */}
                        <div className="price-display">
                            <span className="price-label">Precio Unitario:</span>
                            <span className="price-tag">${product.price.toFixed(2)}</span>
                            
                            {/* Bloque del Total a Pagar (Destacado) */}
                            <div className="total-price-tag">
                                <span className="total-label">Total a Pagar:</span>
                                <span className="total-value">${totalPrice}</span>
                            </div>
                        </div>

                        {/* Controles de Cantidad y Botón de Carrito */}
                        <div className="add-to-cart-controls">
                            {/* Control de Cantidad con botones +/- */}
                            <div className="quantity-selector-group">
                                <label htmlFor="qty">Cantidad:</label>
                                <div className="quantity-controls">
                                    {/* Botón de Decremento */}
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => setQty(prev => Math.max(1, prev - 1))}
                                        disabled={qty <= 1}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        id="qty"
                                        name="qty"
                                        min="1"
                                        value={qty}
                                        onChange={handleQtyChange}
                                        className="qty-input"
                                    />
                                    {/* Botón de Incremento */}
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => setQty(prev => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            
                            {/* Botón de Agregar al Carrito */}
                            <button 
                                onClick={addToCartHandler} 
                                className="add-to-cart-button"
                            >
                                Añadir al Carrito ({qty})
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* 2. SECCIÓN DE DESCRIPCIÓN LARGA */}
            <section className="description-section">
                <h2>Descripción Detallada</h2>
                {/* Renderizar HTML si existe (usar con precaución) */}
                {details.longDescription ? (
                    <div 
                        className="long-description-content" 
                        dangerouslySetInnerHTML={{ __html: details.longDescription }} 
                    />
                ) : (
                    <p>No hay descripción detallada para este producto.</p>
                )}
            </section>

            {/* 3. SECCIÓN DE ESPECIFICACIONES */}
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
                {/* Aquí se integrará el componente <ReviewsSection productId={productId} /> */}
                <p>¡Este es el lugar donde los usuarios comentarán y calificarán!</p>
            </section>
        </div>
    );
};

export default ProductScreen;