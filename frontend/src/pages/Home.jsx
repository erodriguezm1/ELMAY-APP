import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import axios from 'axios';
import MegaOfferModal from '../components/MegaOfferModal';

// Mapeo de subcategorías (Se mantiene igual)
const SUBCATEGORIES_MAP = {
    'Electrónica': ['Mouse', 'RAM', 'Disco Duro', 'Teclado', 'Smartphones', 'Televisores', 'Audio'],
    'Hogar': ['Muebles', 'Decoración', 'Cocina', 'Limpieza'],
    'Streaming': ['Suscripciones', 'Dispositivos de Transmisión', 'Accesorios'],
    'Alimentos': ['Perecederos', 'Snacks', 'Bebidas'],
    'Herramientas': ['Manuales', 'Eléctricas', 'Jardinería'],
};

// Datos estáticos para el menú de categorías (Se mantiene igual)
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

    // ✅ CAMBIO 1: El valor máximo ya no es una constante, es un estado
    const [maxPriceLimit, setMaxPriceLimit] = useState(0); 
    // ✅ CAMBIO 2: Inicializamos el rango de precio a [0, 0]
    const [priceRange, setPriceRange] = useState([0, 0]); 
    
    // Estados de Mega Ofertas y Modal (Se mantienen)
    const [megaOffers, setMegaOffers] = useState([]); 
    const [showMegaOfferModal, setShowMegaOfferModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Función central para obtener los productos
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/products'); 
            const allProducts = response.data;
            
            setProducts(allProducts);

            // --- ✅ LÓGICA DE PRECIO DINÁMICO ---
            let maxPrice = 0;
            if (allProducts.length > 0) {
                // Busca el precio más alto en la lista de productos
                maxPrice = Math.max(...allProducts.map(p => p.price));
            }
            // Asegura que el límite sea al menos un valor mínimo si no hay productos, o un valor redondeado
            const dynamicMax = Math.ceil(maxPrice / 100) * 100; // Redondeamos al 100 más cercano por estética, o simplemente Math.ceil(maxPrice);
            if(dynamicMax === 0) {
                // Caso sin productos, o todos a precio 0
                setMaxPriceLimit(1000); 
                setPriceRange([0, 1000]); 
            } else {
                setMaxPriceLimit(dynamicMax);
                setPriceRange([0, dynamicMax]); // Establecemos el rango superior al máximo encontrado
            }
            // ----------------------------------------

            // Lógica de filtrado de Mega Ofertas (Se mantiene)
            const megaOffersList = allProducts.filter(product => 
                product.isMegaOffer === true
            );
            setMegaOffers(megaOffersList);

        } catch (err) {
            setError('Error al cargar los productos. Por favor, intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // useEffect para la carga inicial de productos (Se mantiene)
    useEffect(() => {
        fetchProducts();
    }, []); 
    
    // NUEVO useEffect: para manejar la aparición del Modal (Se mantiene)
    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem('megaOfferModalShown') === 'true';
        
        if (megaOffers.length > 0 && !hasBeenShown && !loading && !error) {
            setShowMegaOfferModal(true); 
            sessionStorage.setItem('megaOfferModalShown', 'true');
        }
    }, [megaOffers, loading, error]); 
    
    
    // Lógica para filtrar los productos a mostrar (Se mantiene)
    const productsToDisplay = products
        .filter(product => {
            
            // 1. FILTRO POR TIPO DE OFERTA/CATEGORÍA ESPECIAL (Se mantiene)
            if (selectedCategory === 'Mega Ofertas') {
                if (product.isMegaOffer !== true) return false;
            } else if (selectedCategory === 'Ofertas') {
                if (product.isOffer !== true) return false;
            } else if (selectedCategory !== 'Todos') {
                if (product.category !== selectedCategory) return false;
                if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false;
            }
            
            // 2. FILTRO DE BÚSQUEDA (Se mantiene)
            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                if (
                    !product.name.toLowerCase().includes(lowerCaseSearchTerm) &&
                    !product.description.toLowerCase().includes(lowerCaseSearchTerm)
                ) {
                    return false;
                }
            }

            // 3. FILTRO POR RANGO DE PRECIO (Se mantiene)
            // Se utiliza priceRange[1] para el límite superior
            if (product.price < priceRange[0] || product.price > priceRange[1]) {
                return false;
            }
            
            return true;
        });
    
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory(null);
    };

    return (
        <div className="home-container">
            <MegaOfferModal 
                show={showMegaOfferModal} 
                onClose={() => setShowMegaOfferModal(false)}
                offers={megaOffers}
            />
            
            {/* 1. SECCIÓN DE CATEGORÍAS (Se mantiene) */}
            <section className="categories-menu-container">
                <div className="category-buttons-list">
                    <button
                        className={`category-button ${selectedCategory === 'Todos' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Todos')}
                    >
                        Todos
                    </button>
                    <button
                        className={`category-button ${selectedCategory === 'Mega Ofertas' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Mega Ofertas')}
                    >
                        💥 MEGA OFERTAS
                    </button>
                    <button
                        className={`category-button ${selectedCategory === 'Ofertas' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Ofertas')}
                    >
                        🔥 Ofertas
                    </button>

                    {mainCategories.map((category) => (
                        <button
                            key={category}
                            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>
            
            {/* ✅ SECCIÓN DE FILTROS ACTUALIZADA */}
            <section className="filter-bar-container mt-8 flex flex-col md:flex-row gap-4 justify-center items-center p-4 bg-white rounded-lg shadow-md">
                {/* ✅ CORRECCIÓN: Usar 2/3 para que ocupe el doble de espacio (66.66%) */}
                <div className="search-filter w-full md:w-2/3">
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Se mantiene en 1/3 (33.33%). La suma es 2/3 + 1/3 = 100% */}
                <div className="price-range-filter w-full md:w-1/3">
                    {/* El límite superior de la etiqueta y el slider es dinámico: maxPriceLimit */}
                    <label className="block text-gray-700 font-semibold mb-1">Precio Máximo: ${priceRange[1].toFixed(2)}</label>
                    <input
                        type="range"
                        min="0"
                        max={maxPriceLimit} 
                        step="1"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, Number(e.target.value)])} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                        // Deshabilitar si todavía está cargando
                        disabled={loading || maxPriceLimit === 0}
                    />
                </div>
            </section>
            
            {/* 2. El resto de la página Home (Se mantiene) */}
            <h1 className="main-title">Explora Nuestros Productos</h1>
            
            {/* 3. Seccion del Grid de Productos (Se mantiene) */}
            <section className="product-listing-section">
                <h2 className="section-title">
                    {selectedCategory === 'Todos' ? 'Todos los Productos' : 
                     selectedCategory === 'Mega Ofertas' ? 'Mega Ofertas Exclusivas' :
                     selectedCategory === 'Ofertas' ? 'Ofertas Destacadas' :
                     selectedCategory}
                    {searchTerm && ` (Búsqueda: \"${searchTerm}\")`}
                </h2>
                {loading ? (
                    <div className='loading'>Cargando productos...</div>
                ) : error ? (
                    <p className='error'>{error}</p>
                ) : productsToDisplay.length === 0 ? (
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
                                        {/* Indicador visual para las ofertas/mega ofertas */}
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
    );
}

export default Home;