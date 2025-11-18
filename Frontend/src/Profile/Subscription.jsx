{
/*
 * Autor: Diego Jasso
 * Componente: SubscriptionPage
 * Descripción: Muestra la oferta de suscripción personalizada al usuario. Carga el perfil fitness y el kit de productos recomendados, presenta un resumen del plan y permite al usuario agregar el plan de suscripción a su carrito para proceder al pago.
 */
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addItemToCart, getUserProfile, getMySubscription } from '../utils/api';

// --- Iconos SVG ---
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

const CheckCircleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-10"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
    </svg>
);

const InfoIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-4"
    >
        <path
            fillRule="evenodd"
            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 8a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V8Z"
            clipRule="evenodd"
        />
    </svg>
);

// --- Componente de Tag (Helper) ---
const Tag = ({ text, color = 'green' }) => {
    const colors = {
        green: 'bg-green-600/70 text-white',
        blue: 'bg-blue-600/70 text-white',
        teal: 'bg-teal-600/70 text-white',
    };
    return (
        <span
            className={`text-xs font-medium px-4 py-1.5 rounded-full ${colors[color]}`}
        >
            {text}
        </span>
    );
};

// --- Componente de Tarjeta de Producto (Helper) ---
const ProductCard = ({ title, tag }) => (
    <div className="border border-gray-300 rounded-2xl p-4 flex flex-col justify-between min-h-[180px]">
        <div className="flex-grow">
            {/* Espacio para la imagen del producto */}
            <div className="h-24 w-full mb-4"></div>
        </div>
        <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">{title}</h4>
            <span className="text-xs text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                {tag}
            </span>
        </div>
    </div>
);



// --- Componente Principal ---
const SubscriptionPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscribing, setSubscribing] = useState(false);
    const [fitnessProfile, setFitnessProfile] = useState(null);
    const [subscriptionProduct, setSubscriptionProduct] = useState(null);
    const [kitProducts, setKitProducts] = useState([]);

    // Cargar datos del perfil fitness y plan recomendado
    useEffect(() => {
        loadSubscriptionData();
    }, []);

    const loadSubscriptionData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar perfil del usuario (incluye fitness_profile)
            const userProfile = await getUserProfile();
            
            if (!userProfile.fitness_profile) {
                setError('No tienes un perfil fitness. Completa el test de placement primero.');
                return;
            }

            // Cargar suscripción activa si existe
            // const subscription = await getMySubscription().catch(() => null);
            
            // Configurar fitness profile
            setFitnessProfile(userProfile.fitness_profile.attributes);
            
            // Configurar producto de suscripción (simulado por ahora)
            // TODO: Crear endpoint específico para obtener producto de suscripción
            setSubscriptionProduct({
                product_id: 999,
                name: "Suscripción Mensual " + userProfile.fitness_profile.attributes.recommended_plan,
                description: "Kit mensual personalizado según tus objetivos fitness",
                price: 150.00,
                is_subscription: true
            });
            
            // Productos recomendados del fitness profile
            const recommendedProducts = userProfile.fitness_profile.attributes.recommended_products || [];
            const kitProducts = recommendedProducts.map((name, index) => ({
                product_id: 100 + index,
                name: name,
                tag: "Para tu objetivo",
                image_url: null
            }));
            
            setKitProducts(kitProducts);
        } catch (err) {
            setError(err.message || "Error al cargar la información del plan");
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!subscriptionProduct) return;

        try {
            setSubscribing(true);

            // Agregar producto de suscripción al carrito
            await addItemToCart(subscriptionProduct.product_id, 1);

            // Mostrar mensaje de éxito y redirigir al carrito
            alert("¡Plan agregado al carrito exitosamente!");
            navigate("/CartPage");
        } catch (err) {
            alert(err.message || "Error al agregar el plan al carrito. Por favor intenta nuevamente.");
        } finally {
            setSubscribing(false);
        }
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#334173] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando tu plan personalizado...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <p className="text-lg text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={loadSubscriptionData}
                        className="bg-[#334173] text-white px-6 py-2 rounded-lg hover:bg-[#253055] transition-colors"
                    >
                        Reintentar
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="ml-2 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">

                    {/* Encabezado */}
                    <header className="flex items-center pb-4 border-b border-gray-300 mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                            Subscripción
                        </h1>
                    </header>

                    <main>
                        {/* Plan Recomendado */}
                        <section className="bg-[#E0EADE] rounded-xl p-6 mb-8">
                            <div className="flex flex-col md:flex-row items-start gap-5">
                                <div className="text-gray-600 flex-shrink-0">
                                    <CheckCircleIcon />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                                        {fitnessProfile?.recommended_plan || "Plan recomendado para ti"}
                                    </h2>
                                    <p className="text-sm text-gray-700 mb-4">
                                        {fitnessProfile?.plan_description || 
                                         "Este kit de productos ha sido seleccionado específicamente según tus objetivos y actividad física."}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {fitnessProfile?.goal_declared && (
                                            <Tag text={fitnessProfile.goal_declared} color="green" />
                                        )}
                                        {fitnessProfile?.activity_type && (
                                            <Tag text={fitnessProfile.activity_type} color="blue" />
                                        )}
                                        {fitnessProfile?.activity_intensity && (
                                            <Tag text={fitnessProfile.activity_intensity} color="teal" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Productos Incluidos */}
                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Productos Incluidos En Tu Kit Mensual
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Estos productos han sido cuidadosamente seleccionados para
                                ayudarte a alcanzar tus metas de {fitnessProfile?.goal_declared?.toLowerCase() || "fitness"} con
                                {fitnessProfile?.activity_type ? ` ${fitnessProfile.activity_type.toLowerCase()}` : " entrenamiento"}.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {kitProducts.length > 0 ? (
                                    kitProducts.map((product) => (
                                        <ProductCard
                                            key={product.product_id}
                                            title={product.name}
                                            tag={product.tag}
                                        />
                                    ))
                                ) : (
                                    <>
                                        <ProductCard title="Proteína Gold Standard Whey" tag="Para tu objetivo" />
                                        <ProductCard title="Pre-Entreno C4 Original" tag="Para tu objetivo" />
                                        <ProductCard title="Creatina Monohidratada" tag="Para tu objetivo" />
                                        <ProductCard title="BCAA 5000 Powder" tag="Para tu objetivo" />
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Banner CTA */}
                        <section className="bg-[#69AEA2] text-white rounded-xl p-8 text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                ¿Listo para empezar tu transformación?
                            </h2>
                            <p className="text-sm opacity-90 mb-6 max-w-lg mx-auto">
                                Suscríbete ahora por {subscriptionProduct ? `${subscriptionProduct.price.toLocaleString()} MXN` : "150 MXN"} y recibe tu primer kit
                                personalizado. Puedes cancelar cuando quieras.
                            </p>
                            <button 
                                onClick={handleSubscribe}
                                disabled={subscribing || !subscriptionProduct}
                                className="bg-[#31478F] text-white font-semibold py-2.5 px-8 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto min-w-[220px]"
                            >
                                {subscribing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    "Subscribirme a este plan"
                                )}
                            </button>
                        </section>

                        {/* Disclaimer */}
                        <section className="flex items-start gap-2 text-xs text-gray-500">
                            <InfoIcon className="flex-shrink-0 mt-0.5" />
                            <p>
                                Al suscribirte, autorizarás un cargo mensual automático en el
                                método de pago que elijas. Tu primer cargo se procesará
                                inmediatamente y los siguientes se realizarán cada 30 días.
                                Puedes cancelar en cualquier momento antes de tu próximo ciclo
                                de facturación.
                            </p>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;