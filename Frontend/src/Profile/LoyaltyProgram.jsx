{
/*
 * Autor: Diego Jasso
 * Componente: PointsProgram
 * Descripción: Muestra la vista del programa de lealtad (puntos). Presenta el nivel actual del usuario, el progreso hacia el siguiente nivel, los beneficios activos y la gestión de cupones, cargando los datos desde la API.
 */
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoyaltyStatus, getLoyaltyTiers, generateMonthlyCoupons } from '../utils/api';

// --- Icono SVG ---
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

// --- Componente Principal ---
const PointsProgram = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [generatingCoupon, setGeneratingCoupon] = useState(false);

    // Cargar datos de lealtad al montar
    useEffect(() => {
        loadLoyaltyData();
    }, []);

    const loadLoyaltyData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getLoyaltyStatus();
            setLoyaltyData(data);
        } catch (err) {
            console.error('Error al cargar datos de lealtad:', err);
            setError(err.message || 'Error al cargar información de lealtad');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCoupon = async () => {
        try {
            setGeneratingCoupon(true);
            // Nota: este endpoint requiere user_id y es solo para admin
            // En producción, necesitarás un endpoint diferente para usuarios
            alert('Funcionalidad de generación de cupones en desarrollo');
            await loadLoyaltyData(); // Recargar datos
        } catch (err) {
            console.error('Error al generar cupón:', err);
            alert(err.message || 'Error al generar cupón');
        } finally {
            setGeneratingCoupon(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31478F] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información de lealtad...</p>
                </div>
            </div>
        );
    }

    if (error || !loyaltyData) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <p className="text-lg text-gray-700 mb-4">{error || 'No se pudo cargar la información'}</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-[#31478F] text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
                    >
                        Volver al perfil
                    </button>
                </div>
            </div>
        );
    }

    const currentPoints = loyaltyData.total_points || 0;
    const totalPoints = loyaltyData.next_tier_points || 1000;
    const progressPercentage = (currentPoints / totalPoints) * 100;

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">

                    {/* Encabezado */}
                    <header className="flex items-center pb-4 border-b border-gray-300">
                        <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-gray-900">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                            Programa de puntos
                        </h1>
                    </header>

                    <main className="mt-6">
                        <p className="text-sm text-gray-600 mb-6">
                            ¡Consigue puntos al realizar compras y consigue beneficios dentro de
                            la tienda! Tu progreso se reinicia cada 6 meses al final del mes.
                        </p>

                        {/* Sección de Nivel y Progreso */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">{loyaltyData.tier_name}</h2>
                            <div className="w-full bg-gray-200 rounded-full h-3.5">
                                <div
                                    className="bg-[#70AA77] h-3.5 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-sm text-gray-500 mt-2">
                                {currentPoints}/{totalPoints} puntos
                            </p>
                        </section>

                        {/* Sección de Beneficios Actuales */}
                        <section className="pb-6 border-b border-gray-300">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Beneficios
                            </h3>
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Lista de beneficios */}
                                <div className="flex-1">
                                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                                        <li>Consigue {loyaltyData.current_benefits.points_multiplier}x más puntos por cada compra.</li>
                                        {loyaltyData.current_benefits.discount_percentage > 0 && (
                                            <li>Recibe {loyaltyData.current_benefits.discount_percentage}% de descuento en tus compras.</li>
                                        )}
                                        <li>Recibe {loyaltyData.current_benefits.monthly_coupons} cupones al mes.</li>
                                        {loyaltyData.current_benefits.early_access && (
                                            <li>Acceso temprano a ventas de tiempo limitado.</li>
                                        )}
                                        <li>Envío gratis en compras mayores a ${loyaltyData.current_benefits.free_shipping_threshold} MXN.</li>
                                    </ul>
                                </div>
                                {/* Sección de Cupones */}
                                <div className="flex-0 flex flex-col items-start md:items-end">
                                    <p className="text-gray-700 mb-3">
                                        Tienes <span className="font-bold text-lg">{loyaltyData.current_benefits.available_coupons || 0}</span> cupones
                                        disponibles
                                    </p>
                                    <button 
                                        onClick={handleGenerateCoupon}
                                        disabled={generatingCoupon || loyaltyData.current_benefits.available_coupons === 0}
                                        className="bg-[#31478F] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {generatingCoupon ? 'Generando...' : 'Generar cupón'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tus beneficios expiran el {new Date(loyaltyData.period_end_date).toLocaleDateString('es-MX')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Sección de Siguiente Nivel */}
                        <section className="mt-6 text-center">
                            <p className="text-lg text-gray-800 mb-4">
                                ¡Te faltan <span className="font-bold">{totalPoints - currentPoints} puntos</span> para
                                alcanzar el siguiente nivel!
                            </p>
                            <div className="text-left max-w-md mx-auto">
                                <p className="text-gray-700 font-semibold mb-3">
                                    Sigue comprando para desbloquear más beneficios en el siguiente nivel.
                                </p>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PointsProgram;