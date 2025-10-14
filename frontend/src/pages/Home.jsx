import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import axios from 'axios'; 
import MegaOfferModal from '../components/MegaOfferModal'; 

// Mapeo de subcategorías (Asumiendo esta estructura para el ejemplo)
const SUBCATEGORIES_MAP = {
    'Electrónica': ['Mouse', 'RAM', 'Disco Duro', 'Teclado', 'Smartphones', 'Televisores', 'Audio'],
    'Hogar': ['Muebles', 'Decoración', 'Cocina', 'Limpieza'],
    'Streaming': ['Suscripciones', 'Dispositivos de Transmisión', 'Accesorios'],
    'Alimentos': ['Perecederos', 'Snacks', 'Bebidas'],
    'Herramientas': ['Manuales', 'Eléctricas', 'Jardinería'],
};

// Datos estáticos para el menú de categorías
const mainCategories = [
    'Electrónica', 
    'Hogar', 
    'Streaming', 
    'Alimentos',
    'Herramientas'
];

// URL de la API (ajusta si es necesario)
const API_URL = '/api/products/all'; 

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para la categoría principal y subcategoría
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // Estados para la búsqueda y filtro de precios
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [maxPrice, setMaxPrice] = useState(0); 

    // Estados para ofertas y modal
    const [featuredOffers, setFeaturedOffers] = useState([]);
    const [megaOffers, setMegaOffers] = useState([]);
    const [showMegaOfferModal, setShowMegaOfferModal] = useState(false);

    // Estado para la BARRA IZQUIERDA (Filtros/Categorías)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

    // Función para alternar la visibilidad de la barra IZQUIERDA
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // SIMULACIÓN: Esto debería ser reemplazado por tu llamada real a la API
            const response = await axios.get(API_URL);
            const data = response.data; 
            setProducts(data);
            
            const prices = data.map(p => p.price);
            const currentMaxPrice = prices.length > 0 ? Math.max(...prices) : 1000;
            setMaxPrice(currentMaxPrice);
            setPriceRange({ min: 0, max: currentMaxPrice });

            setFeaturedOffers(data.filter(p => p.isOffer && !p.isMegaOffer).slice(0, 6)); 
            setMegaOffers(data.filter(p => p.isMegaOffer));

        } catch (err) {
            console.error("Error fetching products:", err);
            setError("No se pudieron cargar los productos. Inténtalo de nuevo más tarde.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Funciones de manejo
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory(null); 
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleSubcategoryClick = (category, subcategory) => {
        setSelectedCategory(category); 
        setSelectedSubcategory(subcategory);
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePriceChange = (e) => {
        setPriceRange({ min: 0, max: parseFloat(e.target.value) });
    };

    // Lógica de filtrado
    const filteredProducts = products.filter(product => {
        let categoryMatch = true;
        
        // Lógica de filtrado por categorías especiales
        if (selectedCategory === 'Mega Ofertas') {
            categoryMatch = product.isMegaOffer;
        } else if (selectedCategory === 'Ofertas') {
            categoryMatch = product.isOffer;
        } 
        // Lógica de filtrado por categorías regulares
        else if (selectedCategory !== 'Todos') {
            // Un producto pasa el filtro si su categoría coincide, independientemente de si es oferta.
            categoryMatch = product.category === selectedCategory;
            if (categoryMatch && selectedSubcategory) {
                categoryMatch = product.subcategory === selectedSubcategory;
            }
        }

        const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());

        const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;

        return categoryMatch && searchMatch && priceMatch;
    });

    // 🎯 CAMBIO CLAVE: Eliminamos el filtro que excluía los featured offers
    // Esto asegura que todos los productos que pasan el filtro de categoría (filteredProducts)
    // se muestren en el centro, incluso si son ofertas destacadas.
    // Consecuencia: los productos featured aparecerán en el centro Y en el sidebar derecho.
    const productsToDisplay = filteredProducts; 
    
    if (loading) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className={`home-page-layout ${isSidebarOpen ? 'sidebar-left-open' : 'sidebar-left-closed'}`}>
            
            {/* 🟢 BARRA LATERAL IZQUIERDA: FILTROS Y CATEGORÍAS (Ocultable) */}
            <aside className={`fixed-sidebar fixed-sidebar-left`}>
                
                {/* 1. SECCIÓN DE BÚSQUEDA Y RANGO DE PRECIOS (Arriba) */}
                <section className="filter-bar-container">
                    <div className="search-filter-wrapper">
                        <input
                            type="text"
                            placeholder="Buscar productos por nombre o descripción..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    {maxPrice > 0 && (
                        <div className="price-range-filter">
                            <label className="price-label">
                                Filtrar por Precio: 
                                <span className="current-price-display">${priceRange.max.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max={maxPrice}
                                value={priceRange.max}
                                onChange={handlePriceChange}
                                className="range-slider"
                            />
                            <div className="price-labels">
                                <span>$0</span>
                                <span>${maxPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </section>
                
                {/* 2. SECCIÓN DE CATEGORÍAS (Abajo) */}
                <section className="categories-menu-container">
                    <h2 className="section-title">Explorar Categorías</h2>
                    <div className="category-buttons-list">
                        {/* Botones de categorías especiales */}
                        <div className="category-dropdown-wrapper">
                            <button
                                onClick={() => handleCategoryClick('Todos')}
                                className={`category-button ${selectedCategory === 'Todos' && !selectedSubcategory ? 'active' : ''}`}
                            >
                                Todos
                            </button>
                        </div>
                        <div className="category-dropdown-wrapper">
                            <button
                                className={`category-button ${selectedCategory === 'Mega Ofertas' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('Mega Ofertas')}
                            >
                                💥 MEGA OFERTAS
                            </button>
                        </div>
                        <div className="category-dropdown-wrapper">
                            <button
                                className={`category-button ${selectedCategory === 'Ofertas' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('Ofertas')}
                            >
                                🔥 Ofertas
                            </button>
                        </div>
                        
                        {/* Mapeo de categorías principales con dropdowns */}
                        {mainCategories.map((cat) => (
                            <div 
                                key={cat} 
                                className={`category-dropdown-wrapper`}
                            >
                                <button
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`category-button ${selectedCategory === cat && !selectedSubcategory ? 'active' : ''} ${selectedCategory === cat && selectedSubcategory ? 'active-parent' : ''}`}
                                >
                                    {cat}
                                </button>
                                
                                {SUBCATEGORIES_MAP[cat]?.length > 0 && (
                                    <div className="subcategory-dropdown">
                                        {SUBCATEGORIES_MAP[cat].map((subcat) => (
                                            <button
                                                key={subcat}
                                                onClick={() => handleSubcategoryClick(cat, subcat)}
                                                className={`subcategory-button ${selectedSubcategory === subcat ? 'active' : ''}`}
                                            >
                                                {subcat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </aside>
            
            {/* 🟢 CONTENIDO PRINCIPAL SCROLLABLE (Centrado por CSS) */}
            <div className="main-content-scrollable">
                <h1 className="main-title">Streaming y gadgets electrónicos.</h1>
                
                <section className="general-products-section">
                    <h2 className="section-title">
                        {selectedCategory === 'Todos' 
                            ? 'Todos los Productos' 
                            : selectedSubcategory
                                ? `Productos en ${selectedSubcategory} (${selectedCategory})`
                                : `Productos en ${selectedCategory}`
                        }
                        {searchTerm && ` (Busqueda: "${searchTerm}")`}
                    </h2>
                    {productsToDisplay.length === 0 ? (
                        <p className="no-products-message">No se encontraron productos que coincidan con los filtros y criterios de búsqueda actuales.</p>
                    ) : (
                        <div className="product-grid">
                            {productsToDisplay.map(product => (
                                <div key={product._id} className="product-card">
                                    <Link to={`/product/${product._id}`}>
                                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                                    </Link>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <span className="product-category-tag">{product.category} {product.subcategory ? ` / ${product.subcategory}` : ''}</span>
                                        <p className="product-description">{product.description}</p>
                                        <div className="product-details">
                                            <span className="product-price">${product.price.toFixed(2)}</span>
                                            <span className="product-stock">Stock: {product.stock}</span>
                                            {product.isMegaOffer && <span className="text-red-600 font-bold ml-2">💥 Mega Oferta</span>}
                                            {!product.isMegaOffer && product.isOffer && <span className="text-orange-500 font-bold ml-2">🔥 Oferta</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            
            {/* 🟢 BARRA LATERAL DERECHA: OFERTAS DESTACADAS (Fija y Visible) */}
            <aside className="fixed-sidebar fixed-sidebar-right fixed-offers-sidebar">
                {featuredOffers.length > 0 && (
                    <section className="featured-offers-section">
                        <h2 className="section-title-offer">🔥 ¡OFERTAS IMPERDIBLES! 🔥</h2>
                        <div className="product-grid offer-grid">
                            {featuredOffers.map(product => (
                                <div key={product._id} className="product-card offer-card">
                                    <span className="offer-badge">¡OFERTA!</span>
                                    <Link to={`/product/${product._id}`}>
                                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                                    </Link>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p className="product-description">{product.description}</p>
                                        <div className="product-details">
                                            <span className="original-price">${(product.price * 1.3).toFixed(2)}</span>
                                            <span className="product-price offer-price">${product.price.toFixed(2)}</span>
                                            <Link to={`/product/${product._id}`} className="view-details-button">Ver Detalle</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </aside>
            
            {/* 🟢 BOTÓN DE TOGGLE para la BARRA IZQUIERDA */}
            <button 
                className="sidebar-toggle-button sidebar-toggle-left"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
            >
                {isSidebarOpen ? '✕ Ocultar Filtros' : '☰ Filtros y Categorías'}
            </button>
            
            {/* MODAL DE MEGA OFERTA */}
            <MegaOfferModal 
                show={showMegaOfferModal} 
                onClose={() => setShowMegaOfferModal(false)} 
                offers={megaOffers} 
            />
        </div>
    );
}

export default Home;