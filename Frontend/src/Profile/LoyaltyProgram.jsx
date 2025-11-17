import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { getLoyaltyStatus, getLoyaltyTiers } from '../utils/api';

// --- Datos Mock para Desarrollo ---
const MOCK_LOYALTY_DATA = {
    user_loyalty_id: 1,
    user_id: 1,
    tier_id: 1,
    tier_name: "Nivel 1",
    total_points: 450,
    points_earned_this_period: 450,
    period_start_date: "2025-05-16T00:00:00",
    period_end_date: "2025-11-16T23:59:59",
    next_tier_points: 1000,
    current_benefits: {
        points_multiplier: 1.0,
        discount_percentage: 0,
        free_shipping_threshold: 1500,
        monthly_coupons: 1,
        available_coupons: 1,
        early_access: true
    }
};

const MOCK_NEXT_TIER_DATA = {
    tier_id: 2,
    tier_name: "Nivel 2",
    required_points: 1000,
    benefits: {
        points_multiplier: 1.5,
        discount_percentage: 5,
        free_shipping_threshold: 1000,
        monthly_coupons: 3,
        early_access: true
    }
};

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
    const currentPoints = 450
    const totalPoints = 1000;
    const progressPercentage = (currentPoints / totalPoints) * 100;

    return (
        <div className="min-h-screen bg-amber-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">

                    {/* Encabezado */}
                    <header className="flex items-center pb-4 border-b border-gray-300">
                        <button className="text-gray-600 hover:text-gray-900">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                            Programa de puntos
                        </h1>
                    </header>

                    <main className="mt-6">
                        <p className="text-sm text-gray-600 mb-6">
                            ¡Consigue puntos al realizar compras y consigue beneficios dentro de
                            la tienda! Tus progreso se reinicia cada 6 meses al final del mes.
                        </p>

                        {/* Sección de Nivel y Progreso */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Nivel 2</h2>
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
                                        <li>Consigue 1.5x más puntos por cada compra.</li>
                                        <li>Recibe 3 cupones de 5% de descuento.</li>
                                        <li>Acceso temprano a ventas de tiempo limitado.</li>
                                        <li>Envío gratis en compras mayores a $1000 MXN.</li>
                                    </ul>
                                </div>
                                {/* Sección de Cupones */}
                                <div className="flex-0 flex flex-col items-start md:items-end">
                                    <p className="text-gray-700 mb-3">
                                        Tienes <span className="font-bold text-lg">3</span> cupones
                                        disponibles
                                    </p>
                                    <button className="bg-[#31478F] text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm">
                                        Generar cupón
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tus beneficios expiran el 00-00-0000
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Sección de Siguiente Nivel */}
                        <section className="mt-6 text-center">
                            <p className="text-lg text-gray-800 mb-4">
                                ¡Te faltan <span className="font-bold">800 puntos</span> para
                                alcanzar el siguiente nivel!
                            </p>
                            <div className="text-left max-w-md mx-auto">
                                <p className="text-gray-700 font-semibold mb-3">
                                    En el siguiente nivel podrás:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2">
                                    <li>Conseguir 2x más puntos</li>
                                    <li>Recibir 10% de descuento en tus compras.</li>
                                    <li>Acceso temprano a ventas de tiempo limitado.</li>
                                    <li>Envío gratis en todas tus compras.</li>
                                </ul>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PointsProgram;