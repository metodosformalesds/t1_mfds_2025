{
/*
 * Autor: Diego Jasso
 * Componente: OrderReview
 * Descripción: Permite al usuario calificar y comentar los productos de un pedido específico que ya fue entregado. Carga los detalles de la orden, gestiona el estado de las reseñas y las envía al backend a través de la API.
 */
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail, createProductReview } from '../utils/api';

// --- Icono SVG ---
const StarIcon = ({ className, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006Z"
            clipRule="evenodd"
        />
    </svg>
);

// --- Componente de Info de Pedido (Helper) ---
const OrderInfoItem = ({ label, value }) => (
    <div className="text-left">
        <span className="block text-xs text-gray-500 uppercase">{label}</span>
        <span className="block text-sm font-semibold text-gray-800">{value}</span>
    </div>
);

// --- Componente de Calificación por Estrellas (Helper) ---
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="flex gap-1">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => { }} // Podrías añadir un hover state aquí si quisieras
                        onMouseLeave={() => { }}
                    >
                        <StarIcon
                            className={`size-8 cursor-pointer ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

// --- Componente Principal ---
const OrderReview = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Estado para las reseñas de cada producto: { productId: { rating, comment } }
    const [reviews, setReviews] = useState({});

    // Cargar detalles de la orden
    useEffect(() => {
        if (orderId) {
            loadOrderDetails();
        }
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener detalles de la orden desde el backend
            const orderDetails = await getOrderDetail(orderId);

            setOrderData(orderDetails);

            // Inicializar estado de reseñas para productos no reseñados
            const initialReviews = {};
            orderDetails.items.forEach(item => {
                if (!item.has_review) {
                    initialReviews[item.product_id] = {
                        rating: 0,
                        comment: ""
                    };
                }
            });
            setReviews(initialReviews);
        } catch (err) {
            console.error("Error al cargar detalles de orden:", err);
            setError(err.message || "Error al cargar la información del pedido");
        } finally {
            setLoading(false);
        }
    };

    // Actualizar rating de un producto específico
    const updateRating = (productId, rating) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                rating
            }
        }));
    };

    // Actualizar comentario de un producto específico
    const updateComment = (productId, comment) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                comment
            }
        }));
    };

    // Enviar reseñas
    const handleSubmitReviews = async (e) => {
        e.preventDefault();

        // Validar que al menos un producto tenga rating
        const hasAnyRating = Object.values(reviews).some(review => review.rating > 0);
        if (!hasAnyRating) {
            alert("Por favor califica al menos un producto antes de enviar.");
            return;
        }

        try {
            setSubmitting(true);

            // Enviar reseñas solo para productos con rating > 0
            const reviewPromises = Object.entries(reviews)
                .filter(([, review]) => review.rating > 0)
                .map(([productId, review]) => {
                    return createProductReview(parseInt(productId), {
                        rating: review.rating,
                        text: review.comment
                    });
                });

            await Promise.all(reviewPromises);

            alert("¡Gracias por tu opinión! Tus reseñas han sido enviadas.");
            navigate("/profile/order-history");
        } catch (err) {
            console.error("Error al enviar reseñas:", err);
            alert("Error al enviar las reseñas. Por favor intenta nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    // Omitir reseñas
    const handleSkip = () => {
        navigate("/profile/order-history");
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { 
            day: '2-digit',
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase();
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31478F] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <p className="text-lg text-gray-700 mb-4">{error || "No se encontró el pedido"}</p>
                    <button
                        onClick={() => navigate("/profile/order-history")}
                        className="bg-[#31478F] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        Volver al historial
                    </button>
                </div>
            </div>
        );
    }

    // Filtrar productos que aún no han sido reseñados
    const productsToReview = orderData.items.filter(item => !item.has_review);

    // Si todos los productos ya fueron reseñados
    if (productsToReview.length === 0) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <p className="text-lg text-gray-700 mb-4">Ya has reseñado todos los productos de este pedido.</p>
                    <button
                        onClick={() => navigate("/profile/order-history")}
                        className="bg-[#31478F] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        Volver al historial
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">

                    {/* Encabezado: Resumen del Pedido */}
                    <header className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                            Resumen del Pedido
                        </h1>
                        <div className="w-full h-px bg-gray-200 mb-4"></div>
                        <div className="flex flex-wrap justify-between gap-4">
                            <OrderInfoItem label="Número de orden" value={orderData.order_code} />
                            <OrderInfoItem label="Fecha" value={formatDate(orderData.created_at)} />
                            <OrderInfoItem label="Total" value={`$${orderData.total_price.toFixed(2)} MXN`} />
                            <OrderInfoItem label="Estado" value={orderData.status === 'delivered' ? 'ENTREGADO' : 'EN PROCESO'} />
                        </div>
                    </header>

                    <main>
                        {/* Prompt de Reseña */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                ¿Qué te parecieron tus productos?
                            </h2>
                            <p className="text-sm text-gray-600">
                                Tu opinión nos ayuda a mejorar y ayuda a otros clientes a tomar
                                mejores decisiones
                            </p>
                        </div>

                        {/* Formulario de Reseñas */}
                        <form onSubmit={handleSubmitReviews}>
                            <div className="space-y-6">
                                {/* Iterar sobre productos que aún no tienen reseña */}
                                {productsToReview.map((item) => (
                                    <div key={item.product_id} className="bg-slate-50 rounded-xl p-6 md:p-8 shadow-inner">
                                        {/* Info del Producto */}
                                        <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                            <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg size-32 flex items-center justify-center">
                                                {item.image_url ? (
                                                    <img 
                                                        src={item.image_url} 
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="text-gray-300 text-xs text-center p-2">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {item.product_name}
                                                </h3>
                                                <p className="text-gray-600 mt-1 text-sm">
                                                    {item.product_description || "Producto de calidad premium"}
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Cantidad: {item.quantity} unidades
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Calificación */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                Calificación *
                                            </label>
                                            <StarRating 
                                                rating={reviews[item.product_id]?.rating || 0} 
                                                setRating={(rating) => updateRating(item.product_id, rating)}
                                            />
                                        </div>

                                        {/* Comentario */}
                                        <div>
                                            <label
                                                htmlFor={`experience-${item.product_id}`}
                                                className="block text-sm font-semibold text-gray-800 mb-2"
                                            >
                                                Cuéntanos tu experiencia (opcional)
                                            </label>
                                            <textarea
                                                id={`experience-${item.product_id}`}
                                                rows={3}
                                                value={reviews[item.product_id]?.comment || ""}
                                                onChange={(e) => updateComment(item.product_id, e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="¿Qué te gustó? ¿Cómo te ayudó? Comparte tu experiencia con otros usuarios..."
                                            ></textarea>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    disabled={submitting}
                                    className="py-2.5 px-6 border border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Omitir
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2.5 px-6 bg-[#31478F] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar Reseñas"
                                    )}
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrderReview;