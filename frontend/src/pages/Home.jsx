import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import axios from 'axios'; // ⬅️ IMPORTAR AXIOS
import MegaOfferModal from '../components/MegaOfferModal'; // ⬅️ ¡IMPORTAR EL MODAL!

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
    const [priceRange, setPriceRange] = useState([0, 5000]); // Ejemplo de rango de precio
    
    // 💥 AÑADIDO: ESTADOS PARA MEGA OFERTAS Y MODAL
    const [megaOffers, setMegaOffers] = useState([]); 
    const [showMegaOfferModal, setShowMegaOfferModal] = useState(false);
    // ----------------------------------------
    
    // Función central para obtener los productos
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            // ASUMIMOS: Esta llamada devuelve TODOS los productos activos
            const response = await axios.get('/api/products'); 
            const allProducts = response.data;
            
            setProducts(allProducts);

            // --- 💥 AÑADIDO: LÓGICA DE FILTRADO DE MEGA OFERTAS (Client-Side) ---
            const megaOffersList = allProducts.filter(product => 
                // Filtramos por la propiedad booleana 'isMegaOffer'
                product.isMegaOffer === true
            );
            setMegaOffers(megaOffersList);
            // --------------------------------------------------------

        } catch (err) {
            setError('Error al cargar los productos. Por favor, intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // useEffect para la carga inicial de productos
    useEffect(() => {
        fetchProducts();
    }, []); 
    
    // 💥 NUEVO useEffect: para manejar la aparición del Modal (después de cargar la data)
    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem('megaOfferModalShown') === 'true';
        
        // Si hay ofertas, no se ha mostrado antes, y ya no estamos cargando
        if (megaOffers.length > 0 && !hasBeenShown && !loading && !error) {
            setShowMegaOfferModal(true); 
            sessionStorage.setItem('megaOfferModalShown', 'true');
        }
    }, [megaOffers, loading, error]); // Se dispara cuando las ofertas se cargan

    
    // Lógica para filtrar los productos a mostrar
    const productsToDisplay = products
        .filter(product => {
            // 💥 AÑADIDO: Filtro por Mega Oferta
            if (selectedCategory === 'Mega Ofertas') {
                return product.isMegaOffer === true;
            }
            // 💥 AÑADIDO: Filtro por Oferta
            if (selectedCategory === 'Ofertas') {
                // Asumimos que también tienes la propiedad isOffer
                return product.isOffer === true;
            }
            
            // Lógica existente para filtrar por categoría y subcategoría
            if (selectedCategory !== 'Todos' && selectedCategory !== 'Ofertas' && selectedCategory !== 'Mega Ofertas') {
                if (product.category !== selectedCategory) return false;
                if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false;
            }
            
            // Filtro por término de búsqueda (ejemplo)
            if (searchTerm) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                if (
                    !product.name.toLowerCase().includes(lowerCaseSearchTerm) &&
                    !product.description.toLowerCase().includes(lowerCaseSearchTerm)
                ) {
                    return false;
                }
            }

            // Filtro por rango de precio (ejemplo)
            if (product.price < priceRange[0] || product.price > priceRange[1]) {
                return false;
            }
            
            // Por defecto, muestra todos los que pasen los filtros
            return true;
        });
    
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory(null);
    };

    return (
        <div className="home-container">
            {/* 💥 AÑADIDO: INTEGRACIÓN DEL MODAL AQUÍ */}
            <MegaOfferModal 
                show={showMegaOfferModal} 
                onClose={() => setShowMegaOfferModal(false)}
                offers={megaOffers} // Le pasamos la lista de mega ofertas
            />
            
            {/* 1. SECCIÓN DE CATEGORÍAS */}
            <section className="categories-menu-container">
                <div className="category-buttons-list">
                    {/* Botón para 'Todos' */}
                    <button
                        className={`category-button ${selectedCategory === 'Todos' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Todos')}
                    >
                        Todos
                    </button>
                    {/* 💥 AÑADIDO: Botón para 'Mega Ofertas' */}
                    <button
                        className={`category-button ${selectedCategory === 'Mega Ofertas' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Mega Ofertas')}
                    >
                        💥 MEGA OFERTAS
                    </button>
                    {/* 💥 AÑADIDO: Botón para 'Ofertas' */}
                    <button
                        className={`category-button ${selectedCategory === 'Ofertas' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('Ofertas')}
                    >
                        🔥 Ofertas
                    </button>

                    {/* El resto de tus botones de categorías principales */}
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
            
            {/* 2. El resto de la página Home */}
            <h1 className="main-title">Explora Nuestros Productos</h1>
            
            {/* 3. Seccion del Grid de Productos (Asegúrate que tu JSX para mostrar productos es similar a esto) */}
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