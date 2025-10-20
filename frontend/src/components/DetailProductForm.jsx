// ELMAY-APP/frontend/src/components/DetailProductForm.jsx (VERSION FINAL COMPLETA)

import React, { useState, useEffect, useMemo } from 'react'; 
import axios from 'axios';
import ReactDOM from 'react-dom'; 
import ReactQuill from 'react-quill'; // 🚨 Editor WYSIWYG
import 'react-quill/dist/quill.snow.css'; // 🚨 Estilos del editor
import './DetailProductForm.css';

const API_URL = '/api';

// ===============================================================
// 💡 FUNCIÓN DE UTILIDAD: Convierte el formato de lista (clave:valor) a objeto JSON
// ===============================================================
const listToJSON = (listString) => {
    const specs = {};
    // Divide por salto de línea y filtra líneas vacías
    const lines = listString.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        // Busca la primera ocurrencia de ':' para separar la clave del valor
        const separatorIndex = line.indexOf(':');
        
        if (separatorIndex !== -1) {
            const key = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();
            
            if (key) {
                // Normaliza la clave (ej: "memoria vram" -> "memoria_vram")
                const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
                specs[normalizedKey] = value;
            }
        }
    });

    return specs;
};
// ===============================================================

const DetailProductForm = ({ isOpen, onClose, productId, onDetailUpdated }) => {
    // 1. Estados del Formulario
    const [longDescription, setLongDescription] = useState('');
    const [specifications, setSpecifications] = useState(''); // Estado para la lista simple
    const [additionalImages, setAdditionalImages] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchError, setFetchError] = useState('');
    
    // Si el modal está cerrado, no renderizar nada (usando un Portal)
    if (!isOpen) {
        return null;
    }

    // 2. Función para obtener el token
    const getToken = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).token : null;
    };

    // 3. Manejar la carga de datos (Cargar detalles existentes)
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setFetchError('');
            
            try {
                const { data: productData } = await axios.get(`${API_URL}/products/${productId}`);
                const existingDetails = productData.details;
                
                if (existingDetails) {
                    setLongDescription(existingDetails.longDescription || '');
                    setAdditionalImages(existingDetails.additionalImages || []); 

                    // 🚨 Convertir el objeto JSON de especificaciones de vuelta al formato de lista
                    const specsObject = existingDetails.specifications || {};
                    const specsList = Object.entries(specsObject)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                    setSpecifications(specsList);
                    
                } else {
                    setLongDescription('');
                    setSpecifications('');
                    setAdditionalImages([{ url: '', caption: '' }]); // Inicializar con un campo vacío
                }
            } catch (err) {
                console.error('Error al cargar los detalles:', err.response || err);
                setFetchError('Error al cargar detalles existentes. Procediendo con formulario vacío.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [productId]); 

    // ===============================================================
    // 🚨 4. Manejo de Imágenes Adicionales (CORREGIDO: DENTRO DEL COMPONENTE)
    // ===============================================================
    const handleImageChange = (index, field, value) => {
        const newImages = [...additionalImages];
        newImages[index][field] = value;
        setAdditionalImages(newImages);
    };

    const handleAddImage = () => {
        setAdditionalImages([...additionalImages, { url: '', caption: '' }]);
    };

    const handleRemoveImage = (index) => {
        const newImages = additionalImages.filter((_, i) => i !== index);
        setAdditionalImages(newImages);
    };
    // ===============================================================

    // 🚨 5. Configuración de la barra de herramientas de Quill
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }], 
            ['bold', 'italic', 'underline', 'strike'], 
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], 
            [{ 'indent': '-1'}, { 'indent': '+1' }], 
            ['link'], 
            ['clean'] 
        ],
    }), []);


    // 6. Función de Manejo de Envío
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = getToken();
        if (!token) {
            setError('Usuario no autenticado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        // 🚨 Convertir el texto de especificaciones al objeto JSON
        const specsObject = listToJSON(specifications);
        
        // Filtrar imágenes vacías antes de enviar
        const validAdditionalImages = additionalImages.filter(img => img.url.trim() !== '');

        // Validación mínima para longDescription (Quill puede devolver un HTML vacío "<p><br></p>")
        const isLongDescriptionEmpty = longDescription.trim() === '' || longDescription.trim() === '<p><br></p>';

        const detailData = {
            // Si Quill devuelve código vacío, enviamos un string vacío
            longDescription: isLongDescriptionEmpty ? '' : longDescription, 
            additionalImages: validAdditionalImages, 
            specifications: specsObject, // ¡Objeto JSON listo!
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            // Llamada al endpoint POST /api/products/:id/details que hace un UPSERT
            const { data } = await axios.post(
                `${API_URL}/products/${productId}/details`,
                detailData,
                config
            );
            
            onClose(); 
            onDetailUpdated(data); 

        } catch (err) {
            console.error('Error al guardar detalles:', err.response || err);
            const errorMessage = err.response?.data?.message || 'Error al actualizar los detalles del producto.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // 7. Renderizado del Modal usando un Portal
    return ReactDOM.createPortal(
        <div className="detail-overlay" onClick={onClose}>
            <div className="detail-modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h2 className="modal-title">
                        {fetchError ? 'Agregar Detalles Nuevos' : 'Editar Detalles Avanzados'}
                    </h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="detail-form">
                    
                    {fetchError && <p className="message error-message">{fetchError}</p>}
                    {error && <p className="message error-message">{error}</p>}

                    {loading ? (
                        <div className="form-loading">Cargando detalles...</div>
                    ) : (
                        <>
                            {/* CAMPO: DESCRIPCIÓN LARGA (CON EDITOR WYSIWYG) */}
                            <div className="form-group">
                                <label htmlFor="longDescription">Descripción Larga (Editor de Texto Enriquecido):</label>
                                <ReactQuill 
                                    theme="snow" 
                                    value={longDescription} 
                                    onChange={setLongDescription} 
                                    modules={modules}
                                    placeholder="Escribe aquí los detalles del producto. Usa los botones para dar formato (negritas, listas, etc.)."
                                />
                            </div>

                            {/* SECCIÓN: IMÁGENES ADICIONALES */}
                            <div className="form-group image-section">
                                <label>Imágenes Adicionales ({additionalImages.length})</label>
                                {additionalImages.map((image, index) => (
                                    <div key={index} className="image-input-group">
                                        <input
                                            type="url"
                                            placeholder="URL de la imagen"
                                            value={image.url}
                                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descripción (opcional)"
                                            value={image.caption}
                                            onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                        />
                                        {/* Este es el botón que causaba el error */}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImage(index)}
                                            className="remove-image-button"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddImage} className="add-image-button">
                                    + Añadir otra imagen
                                </button>
                            </div>

                            {/* CAMPO: ESPECIFICACIONES (Lista simple) */}
                            <div className="form-group">
                                <label htmlFor="specifications">Especificaciones Técnicas (Una por línea, formato: clave:valor)</label>
                                <textarea
                                    id="specifications"
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    rows="8"
                                    placeholder='Ejemplos:\npeso: 20kg\nmemoria vram: 8gb\nmaterial: Acero Inoxidable'
                                />
                                <small className="json-hint">El formato debe ser **clave:valor**. Las claves se convertirán a minúsculas y se unirán con guión bajo (ej: 'memoria vram' &rarr; 'memoria_vram').</small>
                            </div>

                            <button 
                                type="submit" 
                                className="action-button save-button" 
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Detalles'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>,
        document.body 
    );
};

export default DetailProductForm;