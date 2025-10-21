// ELMAY-APP/frontend/src/screens/ProductScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import ReviewsSection from '../components/ReviewsSection'; // Lo harás más adelante
import './ProductScreen.css'; // Crearás este CSS

const API_URL = '/api';

const ProductScreen = () => {
    // Obtener el ID del producto de la URL
    const navigate = useNavigate();
    const { id: productId } = useParams(); 
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Llama a la ruta que ahora pobla los 'details'
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

    const goBack = () => {
        navigate(-1); 
    };

    if (loading) {
        return <div className="loading-screen">Cargando detalles del producto...</div>;
    }

    if (error) {
        return <div className="error-screen">{error}</div>;
    }

    if (!product) {
        return <div className="error-screen">Producto no encontrado.</div>;
    }
    
    // Extraer los detalles avanzados. Si no existen, usamos un objeto vacío.
    // Recuerda que 'product.details' es el objeto ProductDetail completo.
    const details = product.details || {}; 

    // Función para renderizar especificaciones
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
            {/* 💡 CLAVE 2: Botón de Retroceso */}
            <button onClick={goBack} className="back-button">
                ← Volver a la Lista
            </button>
            <section className="product-header-section">
                <div className="main-image-gallery">
                    <img src={product.imageUrl} alt={product.name} className="main-product-image" />
                    {/* Más imágenes adicionales aquí (si hay) */}
                </div>
                
                <div className="product-info-panel">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-summary">{product.description}</p>
                    <div className="price-section">
                        <span className="price-tag">${product.price.toFixed(2)}</span>
                        {/* Aquí puedes añadir lógica de stock, botones de compra, etc. */}
                        <button className="add-to-cart-button">Añadir al Carrito</button>
                    </div>
                </div>
            </section>
            
            {/* 2. SECCIÓN DE DESCRIPCIÓN LARGA */}
            <section className="description-section">
                <h2>Descripción Detallada</h2>
                {/* 🚨 PRECAUCIÓN: Renderizar HTML usando dangerouslySetInnerHTML */}
                {/* Esto es necesario porque guardamos la descripción larga como un string HTML */}
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