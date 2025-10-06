import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

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

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para la categoría principal y subcategoría
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // NUEVOS ESTADOS PARA FILTROS
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(0); // Precio máximo global para el slider
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 }); // Rango de precio seleccionado

    useEffect(() => {
        // Función asíncrona para obtener los productos del backend
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/products');

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                setProducts(data); 
                setError(null);
                
                // Calcular el precio máximo de los productos para el slider
                const maxPriceValue = data.reduce((max, product) => Math.max(max, product.price), 0);
                // Establecer el precio máximo y el rango inicial al máximo
                setMaxPrice(Math.ceil(maxPriceValue));
                setPriceRange({ min: 0, max: Math.ceil(maxPriceValue) });

            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // 1. Filtrar las ofertas destacadas (fijadas)
    const featuredOffers = products.filter(product => product.isOffer);

    // Lógica de Filtrado Combinado (Categoría + Subcategoría + Precio + Búsqueda)
    const productsToDisplay = products.filter(product => {
        // 1. Filtrado por Categoría/Subcategoría
        if (selectedCategory !== 'Todos') {
            const matchesCategory = product.category === selectedCategory;
            if (!matchesCategory) return false;
            
            // Si se ha seleccionado una Subcategoría
            if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
                return false;
            }
        }

        // 2. Filtrado por Rango de Precios
        if (priceRange.max > 0 && (product.price < priceRange.min || product.price > priceRange.max)) {
            return false;
        }

        // 3. Filtrado por Término de Búsqueda
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                                  product.description.toLowerCase().includes(lowerCaseSearchTerm);
            if (!matchesSearch) return false;
        }
        
        // Si pasa todos los filtros
        return true;
    });
    
    // Funciones de Manejo de Filtros
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setSelectedSubcategory(null); 
    };

    const handleSubcategoryClick = (cat, subcat) => {
        setSelectedCategory(cat); 
        setSelectedSubcategory(subcat); 
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePriceChange = (e) => {
        // Solo actualizamos el valor máximo, asumiendo que el mínimo es siempre 0
        setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }));
    };

    
    if (loading) {
        return <div className="loading">Cargando productos...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="home-container">
            <h1 className="main-title">Bienvenido a la tienda ElMay</h1>
            
            {/* SECCIÓN 1: MENÚ DE CATEGORÍAS */}
            <section className="categories-menu-container">
                <h2 className="section-title">Explorar Categorías</h2>
                <div className="category-buttons-list">
                    {/* Botón 'Todos' - Simple */}
                    <button
                        onClick={() => handleCategoryClick('Todos')}
                        className={`category-button ${selectedCategory === 'Todos' && !selectedSubcategory ? 'active' : ''}`}
                    >
                        Todos
                    </button>

                    {/* Botones de Categorías Principales con Dropdown de Subcategorías */}
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
                            
                            {/* Subcategory Dropdown (visible por CSS en hover) */}
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

            {/* NUEVA SECCIÓN: BARRA DE BÚSQUEDA Y FILTRO DE PRECIOS */}
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

            {/* SECCIÓN 2: OFERTAS DESTACADAS (Mantenemos el filtro solo por si el usuario lo necesita, aunque lo normal sería que estas no se filtren por búsqueda/precio) */}
            {featuredOffers.length > 0 && (
                <section className="featured-offers-section">
                    <h2 className="section-title-offer">🔥 ¡OFERTAS IMPERDIBLES! 🔥</h2>
                    <div className="product-grid offer-grid">
                        {featuredOffers.map(product => (
                            <div key={product._id} className="product-card offer-card">
                                <span className="offer-badge">¡OFERTA!</span>
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-details">
                                        {/* Simular precio anterior (ej: 30% más caro) */}
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

            {/* SECCIÓN 3: LISTADO DE PRODUCTOS (Filtrado Combinado) */}
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
                                <img src={product.imageUrl} alt={product.name} className="product-image" />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <span className="product-category-tag">{product.category} {product.subcategory ? ` / ${product.subcategory}` : ''}</span>
                                    <p className="product-description">{product.description}</p>
                                    <div className="product-details">
                                        <span className="product-price">${product.price.toFixed(2)}</span>
                                        <span className="product-stock">Stock: {product.stock}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
