import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './ProductList.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; 
import AdminProductActions from './AdminProductActions.jsx'; // Importamos el componente de acciones de administración

// URL de la API
const API_URL = 'http://localhost:5000/api'; 

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

// Usamos forwardRef para permitir que el componente padre acceda a funciones internas
const ProductList = forwardRef((props, ref) => {
    // Destructuramos las props del componente padre
    const { isAdmin, onProductUpdated } = props;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showAllProducts, setShowAllProducts] = useState(false);
    
    // Obtener datos del usuario de forma consistente
    const userData = getUserData();
    const userRole = userData?.role;
    const userToken = userData?.token;

    // Función para obtener los productos del vendedor
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = userToken; // Usamos el token del objeto de usuario

            if (!token) {
                setError('No autorizado, por favor inicia sesión.');
                setLoading(false);
                navigate("/login");
                return;
            }
            
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            
            // Lógica para alternar entre "mis productos" y "todos los productos" (solo para admin)
            const endpoint = (userRole === 'admin' && showAllProducts)
                ? `${API_URL}/products/all` // Endpoint para administradores
                : `${API_URL}/products/seller`; // Endpoint para el vendedor logueado
            
            const response = await axios.get(endpoint, config);
            setProducts(response.data);
            setError(null);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                // Si la respuesta es 401, elimina el token y redirige al login
                localStorage.removeItem("user");
                navigate("/login");
                setError("La sesión ha expirado, por favor inicia sesión de nuevo.");
            } else {
                console.error('Error fetching seller products:', err);
                setError(err.response?.data?.message || 'Error al cargar los productos.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Función para manejar la actualización de un producto desde AdminProductActions
    const handleProductUpdate = (updatedProduct) => {
        // 1. Actualiza el estado local para reflejar el cambio en la UI inmediatamente (optimista)
        setProducts(prevProducts => prevProducts.map(p => 
            p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p
        ));
        
        // 2. Notifica al componente padre para que sepa que la lista ha cambiado y si necesita recargar
        if (onProductUpdated) {
            onProductUpdated(); 
        }
    };

    // Función para eliminar un producto
    const handleDelete = async (productId) => {
        const token = userToken; // Usamos el token consistente
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            if (!token) {
                alert('No autorizado, por favor inicia sesión.');
                return;
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            await axios.delete(`${API_URL}/products/${productId}`, config);
            
            // Actualiza la lista eliminando el producto
            setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
            
        } catch (error) {
            console.error('Error deleting product:', error.response || error);
            alert('Error al eliminar el producto. Solo el vendedor o administrador puede hacerlo.');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [showAllProducts, navigate]); // Dependencia del navigate es importante para evitar warnings

    // Exponemos la función fetchProducts al componente padre
    useImperativeHandle(ref, () => ({
        fetchProducts
    }));

    if (loading) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="product-list-container">
            <h2 className="text-2xl font-bold mb-4">
                {userRole === 'admin' && showAllProducts ? 'Todos los Productos' : 'Mis Productos'}
            </h2>

            {userRole === 'admin' && (
                <button
                    onClick={() => setShowAllProducts(!showAllProducts)}
                    className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors mb-4"
                >
                    {showAllProducts ? 'Mostrar mis productos' : 'Mostrar todos los productos'}
                </button>
            )}

            {products.length === 0 ? (
                <p>Aún no hay productos disponibles para mostrar.</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product._id} className="product-card">
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="product-image" 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=Imagen+No+Disp." }}
                            />
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-description">{product.description}</p>
                                <p className="product-creator">Creado por: {product.seller.name}</p>
                                <div className="product-details">
                                    <span className="product-price">${product.price.toFixed(2)}</span>
                                    <span className="product-stock">Stock: {product.stock}</span>
                                    {/* Muestra estado y ofertas aquí, usando clases Tailwind para colores */}
                                    <span className={`status-badge ${product.status}`}>
                                        {product.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            {/* INTEGRACIÓN DE ACCIONES DE ADMINISTRACIÓN */}
                            {isAdmin && (
                                <AdminProductActions product={product} onUpdate={handleProductUpdate} />
                            )}
                            
                            {/* El vendedor (o admin) puede eliminar su producto */}
                            {product.seller._id === userData?._id || isAdmin ? (
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="delete-button mt-4"
                                >
                                    Eliminar
                                </button>
                            ) : null}
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default ProductList;