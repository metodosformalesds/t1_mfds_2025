/**
 * Autor: Diego Jasso
 * Descripción: Componente que muestra el perfil fitness del usuario con resultados del test,
 *              recomendaciones de productos personalizadas según objetivos fitness,
 *              y opciones para retomar el test.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBasicUserProfile, getFitnessProfile, getRelatedProducts } from "../utils/api";

// ============================================================================
// COMPONENTES DE ICONOS
// ============================================================================

/**
 * Icono SVG para el botón de navegación "volver"
 */
const ArrowLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
    </svg>
);

// Icono de músculo proporcionado
const MuscleIcon = () => (
    <svg
        className="size-12 sm:size-16 lg:size-20"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M16.1249 55C14.452 55.0336 12.7903 54.7213 11.2438 54.0828C9.69732 53.4442 8.29937 52.4931 7.13759 51.2891C5.9758 50.085 5.07522 48.654 4.49227 47.0857C3.90932 45.5174 3.65657 43.8456 3.74986 42.175C3.84006 39.4721 4.80443 36.8714 6.49822 34.7631C8.19202 32.6548 10.5239 31.1527 13.1439 30.4822C15.7638 29.8117 18.5306 30.009 21.0289 31.0445C23.5272 32.08 25.6224 33.8977 26.9999 36.225C28.7131 35.3949 30.5962 34.9754 32.4999 35C33.9409 35.0046 35.3703 35.2584 36.7249 35.75C35.9791 33.3205 35.6082 30.7914 35.6249 28.25C35.6147 25.7665 35.9856 23.2961 36.7249 20.925V17.95C35.3649 18.5613 33.8909 18.8773 32.3999 18.8773C30.9089 18.8773 29.4348 18.5613 28.0749 17.95C26.6032 16.9349 25.5425 15.4274 25.0842 13.6993C24.6258 11.9712 24.7998 10.1362 25.5749 8.52504C26.6999 6.17504 30.0499 3.97504 36.8499 4.72504C40.0249 5.05004 46.2249 11.15 46.8499 11.8C50.7128 15.588 53.5616 20.2862 55.1342 25.4629C56.7069 30.6395 56.9529 36.1284 55.8499 41.425C55.4331 43.8484 54.8398 46.2381 54.0749 48.575C52.7499 52.625 47.8999 55.425 41.9999 55.425C35.5499 55.425 16.1249 55 16.1249 55Z"
            stroke="#297769"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M26.9999 36.225C25.5612 37.0298 24.4278 38.2863 23.7749 39.8"
            stroke="#297769"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M36.6499 35.725C36.6499 35.725 38.8999 36.225 40.8249 39.8"
            stroke="#297769"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M25 13.65C25 15.3 36.1 15.6 35 10.35"
            stroke="#297769"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/**
 * Componente helper para mostrar filas de información en el desglose de resultados
 * Parámetros:
 *   @param {string} label - Etiqueta del campo (ej: "Altura", "Peso")
 *   @param {string} value - Valor principal a mostrar
 *   @param {string} detail - Detalle adicional opcional (subtexto)
 *   @param {boolean} noBorder - Si es true, no muestra borde inferior
 */
const InfoRow = ({ label, value, detail, noBorder }) => (
    <div
        className={`flex justify-between items-center py-3 ${noBorder ? "" : "border-b border-white/30"
            }`}
    >
        <span className="text-sm font-medium">{label}</span>
        <div className="text-right">
            <span className="text-sm font-bold block">{value}</span>
            {detail && <span className="text-xs font-light block">{detail}</span>}
        </div>
    </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente FitnessProfile
 * Descripción: Página principal del perfil fitness que muestra:
 *              1. Desglose de resultados del test (altura, peso, BMI, hábitos)
 *              2. Perfil y objetivo fitness del usuario
 *              3. Productos recomendados basados en objetivos
 */
const FitnessProfile = () => {
    const navigate = useNavigate();

    // ============ ESTADOS DEL COMPONENTE ============
    
    // Estado de carga y errores
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Datos del usuario y perfil fitness
    const [userData, setUserData] = useState(null);
    const [fitnessData, setFitnessData] = useState(null);
    
    // Productos recomendados según perfil fitness
    const [recommendations, setRecommendations] = useState(null);

    // ============ DATOS MOCK ============
    // Datos de prueba mientras se integra la API real del backend
    // TODO: Eliminar cuando los endpoints estén listos en producción
    
    const mockUser = {
        gender: "M", // M, F, prefer_not_say
        date_of_birth: "1998-05-15",
        profile_picture: null,
        account_status: true
    };

    const mockFitnessProfile = {
        test_date: "2025-01-10",
        attributes: {
            height_cm: 168,
            weight_kg: 65,
            bmi: 23.0,
            sleep_hours: "6-8 hrs diarias",
            activity_level: "Moderado",
            activity_details: "1 hr diaria - 3 días a la semana",
            hydration: "1.5 lts al dia",
            diet_restrictions: "N/A",
            fitness_goal: "BeStrong",
            goal_description: "Plan enfocado en el aumento de masa muscular y fuerza. Este perfil está diseñado para maximizar tu desarrollo muscular mediante una combinación de entrenamiento de fuerza progresivo y nutrición adecuada. Productos recomendados: Proteína aislada, Creatina, Pre-entreno."
        }
    };

    // ==============================
    // EFECTO: CARGA INICIAL DE DATOS
    /**
     * Descripción: Hook que se ejecuta al montar el componente para cargar:
     *              1. Información básica del usuario (nombre, email, etc.)
     *              2. Perfil fitness completo (resultados del test)
     *              3. Productos recomendados según objetivo fitness
     * 
     * Endpoints utilizados:
     *   - GET /api/v1/user-profile/me/basic
     *   - GET /api/v1/placement-test/fitness-profile
     *   - GET /api/v1/products/{id}/related?limit=3
     */
    useEffect(() => {
        async function fetchFitnessData() {
            setLoading(true);
            setError(null);

            
            // TODO: CÓDIGO PARA PRODUCCIÓN (descomentar cuando backend esté listo) ============
            /*
            try {
                // 1. Obtener información básica del usuario autenticado
                const userResponse = await getBasicUserProfile();
                setUserData(userResponse);

                // 2. Obtener perfil fitness del usuario
                const fitnessResponse = await getFitnessProfile();
                setFitnessData(fitnessResponse);

                // 3. Obtener productos recomendados usando endpoint de productos relacionados
                // NOTA: Se usa un producto base como referencia para obtener productos similares.
                //       En producción, este ID debería determinarse dinámicamente según:
                //       - El objetivo fitness del usuario (BeStrong, BeHealthy, etc.)
                //       - La categoría de productos preferida
                //       - Un producto semilla configurado en el sistema
                const baseProductId = 1; // TODO: Hacer dinámico según fitness_goal
                const relatedProducts = await getRelatedProducts(baseProductId, 3);
                
                // Mapear objetivos fitness a categorías y descripciones de productos
                // Esto personaliza las recomendaciones según el perfil del usuario
                const goalMapping = {
                    'BeStrong': {
                        category: 'Ganancia Muscular',
                        description: 'Productos para aumento de masa muscular y fuerza'
                    },
                    'BeLean': {
                        category: 'Pérdida de Grasa',
                        description: 'Productos para pérdida de grasa y tonificación'
                    },
                    'BeBalance': {
                        category: 'Estado Físico Estable',
                        description: 'Productos para mantener balance y equilibrio'
                    },
                    'BeDefine': {
                        category: 'Definición Muscular',
                        description: 'Productos para definición y tono muscular'
                    },
                    'BeNutri': {
                        category: 'Nutrición Integral',
                        description: 'Productos para balance alimenticio y nutrición'
                    }
                };
                
                const fitnessGoal = fitnessResponse?.attributes?.fitness_goal || 'BeStrong';
                const categoryInfo = goalMapping[fitnessGoal] || goalMapping['BeStrong'];
                
                setRecommendations({
                    category: categoryInfo.category,
                    description: categoryInfo.description,
                    products: relatedProducts
                });
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
            */

            // ============ DATOS MOCK PARA DESARROLLO ============
            // Simula llamadas al backend con datos estáticos
            // TODO: Eliminar este setTimeout y descomentar el código anterior cuando backend esté listo
            setTimeout(async () => {
                setUserData(mockUser);
                setFitnessData(mockFitnessProfile);
                
                // Mock de productos recomendados siguiendo estructura ProductListResponse
                const mockRecommendations = {
                    category: "Proteínas y Suplementos",
                    description: "Productos para ganancia muscular y fuerza",
                    products: [
                        {
                            product_id: 1,
                            name: "Proteína Whey Premium",
                            price: 29.99,
                            stock: 50,
                            average_rating: 4.5,
                            brand: "FitNutrition",
                            category: "Proteínas",
                            primary_image: "https://via.placeholder.com/150"
                        },
                        {
                            product_id: 2,
                            name: "Creatina Monohidrato",
                            price: 19.99,
                            stock: 35,
                            average_rating: 4.8,
                            brand: "MuscleTech",
                            category: "Suplementos",
                            primary_image: "https://via.placeholder.com/150"
                        },
                        {
                            product_id: 3,
                            name: "BCAA Recovery",
                            price: 24.99,
                            stock: 40,
                            average_rating: 4.3,
                            brand: "Optimum Nutrition",
                            category: "Aminoácidos",
                            primary_image: "https://via.placeholder.com/150"
                        }
                    ]
                };
                setRecommendations(mockRecommendations);
                
                setLoading(false);
            }, 500);
        }

        fetchFitnessData();
    }, []);

    // ============================================================================
    // FUNCIÓN: ACTUALIZAR PERFIL FITNESS
    // ============================================================================
    /**
     * Descripción: Actualiza información específica del perfil fitness del usuario.
     *              Actualmente no implementada en UI, pero lista para integración futura.
     * Parámetros:
     *   @param {object} updatedData - Objeto con campos a actualizar del perfil
     * Endpoint: PUT /api/v1/fitness-profile/me (pendiente de implementación)
     * Uso futuro: Permitir edición manual de datos sin retomar test completo
     */
    async function handleUpdateFitnessProfile(updatedData) {
        setLoading(true);
        setError(null);

        /*
        try {
            await apiFetch("/api/v1/fitness-profile/me", {
                method: "PUT",
                body: JSON.stringify(updatedData)
            });

            // Recargar datos
            const fitnessResponse = await apiFetch("/api/v1/fitness-profile/me", { 
                method: "GET" 
            });
            setFitnessData(fitnessResponse);

            alert("Información actualizada correctamente");
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
        */

        // MOCK
        setFitnessData({ ...fitnessData, ...updatedData });
        alert("Información actualizada correctamente (simulación)");
        setLoading(false);
    }

    // ============================================================================
    // FUNCIÓN: RETOMAR TEST FITNESS
    // ============================================================================
    /**
     * Descripción: Redirige al usuario al test de placement para actualizar su perfil fitness.
     *              Útil cuando el usuario cambia sus hábitos, objetivos o condición física.
     * Navegación: /placement-test (pendiente de implementación de ruta)
     */
    async function handleRetakeTest() {
        /*
        // CÓDIGO PARA PRODUCCIÓN:
        try {
            // Redirigir a la página del test fitness
            navigate("/placement-test");
        } catch (err) {
            console.error(err);
        }
        */

        // Redirigir al test fitness
        navigate("/placement-test");
    }

    // ============================================================================
    // RENDERIZADO CONDICIONAL: ESTADOS DE CARGA Y ERROR
    // ============================================================================
    
    /**
     * Estado 1: CARGANDO
     * Muestra spinner mientras se obtienen datos del backend
     */
    if (loading && !userData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#70AA77] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    /**
     * Estado 2: ERROR
     * Muestra mensaje de error si la petición al backend falla
     * Incluye botón para volver a la página anterior
     */
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[#31478F] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDERIZADO PRINCIPAL: UI DEL PERFIL FITNESS
    // ============================================================================
    /**
     * Estructura principal del componente con dos tarjetas:
     * 1. Tarjeta Izquierda: Desglose de resultados del test fitness
     * 2. Tarjeta Derecha: Perfil del usuario y productos recomendados
     */
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="w-[98%] mx-auto">
                {/* ============ HEADER CON BOTÓN DE NAVEGACIÓN ============ */}
                <header className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-2xl font-bold ml-4 text-gray-800">
                        Perfil Fitness
                    </h1>
                </header>

                {/* ============ CONTENEDOR PRINCIPAL - LAYOUT DE DOS COLUMNAS ============ */}
                {/* Diseño responsive: vertical en móvil, horizontal en desktop */}
                <main className="flex flex-col lg:flex-row gap-6">
                    
                    {/* ============================================================ */}
                    {/* TARJETA IZQUIERDA: DESGLOSE DE RESULTADOS                   */}
                    {/* ============================================================ */}
                    {/* Muestra métricas físicas y hábitos del usuario del test     */}
                    <section className="flex-1 bg-[#70AA77] text-white p-6 rounded-2xl shadow-lg flex flex-col">
                        <h2 className="text-xl font-semibold mb-6">
                            Desglose de resultados
                        </h2>

                        <InfoRow 
                            label="Altura" 
                            value={`${fitnessData?.attributes?.height_cm || 0} cm`} 
                        />
                        <InfoRow 
                            label="Peso" 
                            value={`${fitnessData?.attributes?.weight_kg || 0} kg`} 
                        />

                        {/* ========== VISUALIZACIÓN DE BMI ========== */}
                        {/* Barra de progreso segmentada con indicador dinámico */}
                        <div className="my-4 pt-3 pb-6">
                            <span className="text-sm font-medium">BMI</span>
                            {/* Barra segmentada */}
                            <div className="w-full flex rounded-full h-6 my-2 overflow-hidden border border-black/40">
                                <div className="w-1/4 h-full bg-[#71D77C]"></div>
                                <div className="w-1/4 h-full bg-[#8CDE94]"></div>
                                <div className="w-1/4 h-full bg-[#ACE4B2]"></div>
                                <div className="w-1/4 h-full bg-[#C2E9C6]"></div>
                            </div>
                            {/* Marcador */}
                            <div className="relative w-full h-6">
                                <div className="absolute" style={{ left: `${Math.min(Math.max((fitnessData?.attributes?.bmi || 23) * 3.5, 5), 95)}%` }}>
                                    <div
                                        className="relative w-0 h-0
                    border-l-[6px] border-l-transparent
                    border-r-[6px] border-r-transparent
                    border-t-[8px] border-t-white opacity-80 top-1 left-1/2 -translate-x-1/2"
                                    ></div>
                                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold">
                                        {fitnessData?.attributes?.bmi || 23.0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <InfoRow 
                            label="Horas de sueño" 
                            value={fitnessData?.attributes?.sleep_hours || "N/A"} 
                        />
                        <InfoRow
                            label="Nivel de actividad"
                            value={fitnessData?.attributes?.activity_level || "N/A"}
                            detail={fitnessData?.attributes?.activity_details || ""}
                        />
                        <InfoRow 
                            label="Hidratación" 
                            value={fitnessData?.attributes?.hydration || "N/A"} 
                        />
                        <InfoRow 
                            label="Restricciones de dieta" 
                            value={fitnessData?.attributes?.diet_restrictions || "N/A"} 
                            noBorder 
                        />

                        {/* ========== FOOTER: ACCIÓN RETOMAR TEST ========== */}
                        {/* Permite actualizar perfil si cambiaron hábitos del usuario */}
                        <div className="mt-auto pt-6 text-center">
                            <p
                                className="text-sm text-white/90 hover:text-white mb-4 block"
                            >
                                ¿Algo ha cambiado?
                            </p>
                            <button 
                                onClick={handleRetakeTest}
                                disabled={loading}
                                className="bg-[#31478F] w-full py-3 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Procesando..." : "Vuelve a tomar test"}
                            </button>
                        </div>
                    </section>

                    {/* ============================================================ */}
                    {/* TARJETA DERECHA: PERFIL Y RECOMENDACIONES                   */}
                    {/* ============================================================ */}
                    {/* Muestra objetivo fitness y productos personalizados         */}
                    <section className="flex-1 bg-[#69AEA2] text-white p-6 rounded-2xl shadow-lg flex flex-col">
                        
                        {/* ========== ENCABEZADO: OBJETIVO FITNESS ========== */}
                        {/* Muestra el perfil activo del usuario (BeStrong, BeHealthy, etc.) */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-sm md:text-xl font-semibold opacity-90">Perfil</h2>
                                <h3 className="text-xl md:text-4xl font-bold underline">
                                    {fitnessData?.attributes?.fitness_goal || "Objetivo fitness"}
                                </h3>
                            </div>
                            <div className="bg-white rounded-full p-3">
                                <MuscleIcon />
                            </div>
                        </div>

                        {/* ========== DESCRIPCIÓN DEL OBJETIVO ========== */}
                        {/* Información sobre el perfil fitness y consejos */}
                        <div className="mb-6">
                            <h4 className="text-2xl font-bold mb-2">Descripción</h4>
                            <p className="text-xs font-light leading-relaxed opacity-90">
                                {fitnessData?.attributes?.goal_description || 
                                "Descripción del objetivo fitness y recomendaciones personalizadas."}
                            </p>
                        </div>

                        {/* ========== RECOMENDACIONES DE PRODUCTOS ========== */}
                        {/* Grid de 3 productos filtrados según objetivo fitness */}
                        {/* Usa endpoint: GET /api/v1/products/{id}/related */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Recomendaciones</h4>
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold">
                                    {recommendations?.category || "Categoría de producto"}
                                </h5>
                                <p className="text-xs font-light opacity-90">
                                    {recommendations?.description || "Descripción"}
                                </p>
                            </div>

                            {/* ========== GRID DE PRODUCTOS (3 COLUMNAS) ========== */}
                            {/* Estados: loading, con productos, vacío */}
                            <div className="grid grid-cols-3 gap-4">
                                {loading ? (
                                    // Estado 1: SKELETON LOADING
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="text-center animate-pulse">
                                                <div className="bg-white/50 aspect-square rounded-lg mb-2"></div>
                                                <span className="text-xs font-medium">Cargando...</span>
                                            </div>
                                        ))}
                                    </>
                                ) : recommendations && recommendations.products?.length > 0 ? (
                                    // Estado 2: MOSTRAR PRODUCTOS
                                    // Usa estructura ProductListResponse del backend
                                    // Muestra máximo 3 productos con imagen, nombre, precio y rating
                                    recommendations.products.slice(0, 3).map((product) => (
                                        <div 
                                            key={product.product_id} 
                                            className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => navigate(`/products/${product.product_id}`)}
                                        >
                                            <div 
                                                className="bg-white aspect-square rounded-lg mb-2 overflow-hidden flex items-center justify-center"
                                                style={{
                                                    backgroundImage: product.primary_image 
                                                        ? `url(${product.primary_image})` 
                                                        : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                {!product.primary_image && (
                                                    <span className="text-gray-400 text-xs">Sin imagen</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium block truncate" title={product.name}>
                                                {product.name}
                                            </span>
                                            <span className="text-xs font-bold block">${product.price}</span>
                                            {product.average_rating && (
                                                <div className="flex items-center justify-center gap-1 mt-1">
                                                    <span className="text-yellow-500 text-xs">★</span>
                                                    <span className="text-xs">{product.average_rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    // Estado vacío
                                    <div className="col-span-3 text-center py-4">
                                        <p className="text-xs font-light opacity-90">
                                            No hay productos recomendados disponibles
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ========== FOOTER: ENLACE A CATÁLOGO ========== */}
                        {/* Link para ver más productos de la categoría recomendada */}
                        <div className="mt-auto pt-6 text-right">
                            <a href="#" className="text-sm font-semibold hover:underline">
                                Ver más productos &gt;
                            </a>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default FitnessProfile;
