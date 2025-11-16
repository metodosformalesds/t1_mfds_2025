import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";

const TestResults = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCalculating, setIsCalculating] = useState(true);
    const [results, setResults] = useState(null);
    const containerRef = useRef(null);
    const resultsRef = useRef(null);

    useEffect(() => {
        // Simular proceso de cálculo del plan
        const calculatePlan = async () => {
            // En producción, aquí se recibirían los resultados del backend
            // const testResults = location.state?.results;
            
            // Simular delay de procesamiento (2-3 segundos)
            // TEMPORAL: Cambia a 0 para ver resultados inmediatamente, o mantén 2500 para ver animación de carga
            await new Promise(resolve => setTimeout(resolve, 0));

            // Mock de resultados del backend
            // Posibles planes según fitness_goal: BeStrong, BeLean, BeBalance, BeDefine, BeNutri
            const mockPlans = {
                'BeStrong': {
                    plan_name: "BeStrong",
                    description: "Plan enfocado en el aumento de masa muscular y fuerza.",
                    recommendation_summary: "Productos recomendados: Proteína aislada, Creatina, Pre-entreno. Complementa con una rutina de fuerza de 4-5 días por semana enfocada en ejercicios compuestos."
                },
                'BeLean': {
                    plan_name: "BeLean",
                    description: "Plan centrado en la pérdida de grasa y tonificación.",
                    recommendation_summary: "Productos recomendados: Proteína ligera, Termogénicos, Omega 3. Combina con ejercicio cardiovascular y entrenamiento de resistencia 4-5 días por semana."
                },
                'BeBalance': {
                    plan_name: "BeBalance",
                    description: "Plan equilibrado para mantener un estado físico estable.",
                    recommendation_summary: "Productos recomendados: Multivitamínico, Colágeno, Proteína media. Mantén una rutina balanceada de 3-4 días con ejercicio variado."
                },
                'BeDefine': {
                    plan_name: "BeDefine",
                    description: "Plan de definición muscular con enfoque en detalle y tono.",
                    recommendation_summary: "Productos recomendados: L-Carnitina, BCAA, Proteína ligera. Enfoca tu entrenamiento en circuitos de alta repetición y ejercicio funcional 4-5 días por semana."
                },
                'BeNutri': {
                    plan_name: "BeNutri",
                    description: "Plan basado en nutrición integral y balance alimenticio.",
                    recommendation_summary: "Productos recomendados: Batidos meal replacement, Fibra, Omega 3. Complementa con ejercicio moderado 3 días por semana y alimentación consciente."
                }
            };
            
            // Simular selección aleatoria de plan (en producción vendría del backend)
            const plans = ['BeStrong', 'BeLean', 'BeBalance', 'BeDefine', 'BeNutri'];
            const randomPlan = plans[Math.floor(Math.random() * plans.length)];
            const mockResults = mockPlans[randomPlan];

            setResults(mockResults);
            setIsCalculating(false);
        };

        calculatePlan();
    }, [location]);

    // Animación de entrada de resultados
    useEffect(() => {
        if (!isCalculating && results && resultsRef.current) {
            gsap.fromTo(resultsRef.current, 
                {
                    opacity: 0,
                    y: 30,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.2)"
                }
            );
        }
    }, [isCalculating, results]);

    const handleGoToProfile = () => {
        navigate("/fitness-profile");
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-amber-50 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl">
                {isCalculating ? (
                    /* Estado de Carga */
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 md:p-12 text-center">
                        {/* Spinner Animado */}
                        <div className="flex justify-center mb-8">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-transparent border-t-[#70AA77] rounded-full animate-spin"></div>
                            </div>
                        </div>

                        {/* Texto de Carga */}
                        <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-3">
                            Analizando tus respuestas...
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Estamos calculando el plan perfecto para ti
                        </p>

                        {/* Lista de pasos del análisis */}
                        <div className="mt-8 text-left max-w-md mx-auto space-y-3 text-sm">
                            <div className="flex items-center text-gray-800">
                                <div className="w-5 h-5 rounded-full bg-[#70AA77] flex items-center justify-center mr-3 flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span>Evaluando tu perfil físico</span>
                            </div>
                            <div className="flex items-center text-gray-800">
                                <div className="w-5 h-5 rounded-full bg-[#70AA77] flex items-center justify-center mr-3 flex-shrink-0">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span>Analizando tus objetivos</span>
                            </div>
                            <div className="flex items-center text-gray-800">
                                <div className="w-5 h-5 rounded-full bg-[#70AA77] flex items-center justify-center mr-3 flex-shrink-0 animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                <span>Seleccionando productos ideales</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 flex-shrink-0">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                                <span>Generando plan personalizado</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Resultados del Test */
                    <div ref={resultsRef} className="bg-white rounded-xl shadow-md border border-gray-200 p-8 md:p-12">
                        {/* Icono de Éxito */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-[#70AA77] rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Título de Felicitaciones */}
                        <h1 className="text-3xl md:text-4xl font-bold text-center text-green-900 mb-3 flex items-center justify-center gap-3">
                            ¡Felicidades!
                            <svg className="w-8 h-8 text-[#70AA77]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                        </h1>
                        <p className="text-center text-gray-700 mb-8">
                            Hemos creado tu plan personalizado
                        </p>

                        {/* Card del Plan */}
                        <div className="bg-[#E0EADE] rounded-lg p-6 mb-6 border border-gray-200">
                            <div className="flex items-center mb-3">
                                <div className="w-2 h-2 bg-[#70AA77] rounded-full mr-2"></div>
                                <span className="text-green-900 text-xs font-bold uppercase tracking-wide">
                                    Tu Plan Recomendado
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-3">
                                {results?.plan_name}
                            </h2>
                            <p className="text-gray-800 leading-relaxed">
                                {results?.description}
                            </p>
                        </div>

                        {/* Resumen de Recomendaciones */}
                        {results?.recommendation_summary && (
                            <div className="bg-amber-50 border border-[#70AA77] rounded p-4 mb-6">
                                <h3 className="font-bold text-green-900 mb-2 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#70AA77]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Recomendación Personalizada
                                </h3>
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    {results.recommendation_summary}
                                </p>
                            </div>
                        )}

                        {/* Beneficios Destacados */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-amber-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="flex justify-center mb-1">
                                    <svg className="w-6 h-6 text-[#70AA77]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-xs font-semibold text-gray-700">
                                    Personalizado
                                </div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="flex justify-center mb-1">
                                    <svg className="w-6 h-6 text-[#70AA77]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-xs font-semibold text-gray-700">
                                    Objetivos Claros
                                </div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 text-center border border-gray-200">
                                <div className="flex justify-center mb-1">
                                    <svg className="w-6 h-6 text-[#70AA77]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="text-xs font-semibold text-gray-700">
                                    Progreso Medible
                                </div>
                            </div>
                        </div>

                        {/* Botón para ir al Perfil */}
                        <button
                            onClick={handleGoToProfile}
                            className="w-full bg-[#70AA77] text-white text-lg font-semibold py-3 px-8 rounded-lg shadow-sm hover:bg-opacity-90 transition-opacity"
                        >
                            Ver Mi Perfil Fitness
                        </button>

                        {/* Nota adicional */}
                        <p className="text-center text-xs text-gray-500 mt-4">
                            Podrás ver tu plan completo y productos recomendados en tu perfil
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestResults;
