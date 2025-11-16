import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { submitPlacementTest } from "../utils/api";

const PlacementTestQuestions = () => {
    const navigate = useNavigate();
    const [currentPhase, setCurrentPhase] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const progressBarRef = useRef(null);
    const progressTextRef = useRef(null);
    const containerRef = useRef(null);
    const cardRef = useRef(null);

    const totalPhases = 5;

    // Estructura de preguntas del test
    const phases = [
        {
            phase: 1,
            title: "Información Básica",
            questions: [
                {
                    id: "age",
                    question: "¿Cuál es tu edad?",
                    type: "number",
                    unit: "años",
                    min: 15,
                    max: 100,
                    placeholder: "Ej: 25"
                },
                {
                    id: "gender",
                    question: "¿Cuál es tu género?",
                    type: "radio",
                    options: ["Masculino", "Femenino", "Prefiero no decirlo"]
                },
                {
                    id: "height",
                    question: "¿Cuál es tu estatura?",
                    type: "number",
                    unit: "cm",
                    min: 120,
                    max: 250,
                    placeholder: "Ej: 170"
                },
                {
                    id: "weight",
                    question: "¿Cuál es tu peso actual?",
                    type: "number",
                    unit: "kg",
                    min: 30,
                    max: 300,
                    placeholder: "Ej: 70"
                },
                {
                    id: "medical_condition",
                    question: "¿Tienes alguna condición médica relevante?",
                    type: "checkbox",
                    options: ["Ninguna", "Hipertensión", "Diabetes", "Lesiones", "Otra"]
                }
            ]
        },
        {
            phase: 2,
            title: "Nivel de Actividad Física",
            questions: [
                {
                    id: "exercise_frequency",
                    question: "¿Con qué frecuencia realizas ejercicio a la semana?",
                    type: "radio",
                    options: ["Nunca", "1-2 veces", "3-4 veces", "5 o más"]
                },
                {
                    id: "activity_type",
                    question: "¿Qué tipo de actividad realizas principalmente?",
                    type: "radio",
                    options: ["Cardio", "Fuerza", "Mixto", "Ninguna"]
                },
                {
                    id: "intensity_level",
                    question: "¿Cuál consideras tu nivel de intensidad promedio?",
                    type: "radio",
                    options: ["Bajo", "Moderado", "Alto"]
                }
            ]
        },
        {
            phase: 3,
            title: "Metas y Objetivos",
            questions: [
                {
                    id: "main_goal",
                    question: "¿Cuál es tu meta principal?",
                    type: "radio",
                    options: [
                        "Perder grasa",
                        "Ganar masa muscular",
                        "Mantenerme",
                        "Mejorar rendimiento",
                        "Rehabilitación"
                    ]
                },
                {
                    id: "goal_timeframe",
                    question: "¿En cuánto tiempo deseas alcanzar tu meta?",
                    type: "radio",
                    options: ["1 mes", "3 meses", "6 meses", "1 año o más"]
                },
                {
                    id: "focus_area",
                    question: "¿Qué área del cuerpo te gustaría enfocar?",
                    type: "radio",
                    options: ["General", "Abdomen", "Brazos", "Piernas", "Glúteos"]
                }
            ]
        },
        {
            phase: 4,
            title: "Hábitos Alimenticios",
            questions: [
                {
                    id: "diet_description",
                    question: "¿Cómo describirías tu alimentación actual?",
                    type: "radio",
                    options: [
                        "Balanceada",
                        "Alta en carbohidratos",
                        "Alta en grasas",
                        "Rica en proteínas"
                    ]
                },
                {
                    id: "diet_type",
                    question: "¿Eres vegetariano, vegano o sigues una dieta especial?",
                    type: "radio",
                    options: ["Ninguna", "Vegetariano", "Vegano", "Keto", "Otra"]
                },
                {
                    id: "supplement_usage",
                    question: "¿Consumes suplementos actualmente?",
                    type: "radio",
                    options: ["Sí", "No", "Ocasionalmente"]
                },
                {
                    id: "current_supplements",
                    question: "Si respondiste 'sí', ¿cuáles?",
                    type: "checkbox",
                    options: ["Proteína", "Creatina", "Multivitamínico", "Omega 3", "Otro"],
                    conditional: (answers) => answers.supplement_usage === "Sí" || answers.supplement_usage === "Ocasionalmente"
                }
            ]
        },
        {
            phase: 5,
            title: "Preferencias y Recomendaciones",
            questions: [
                {
                    id: "supplement_format",
                    question: "¿Qué formato prefieres para tus suplementos?",
                    type: "radio",
                    options: ["Polvo", "Cápsulas", "Barras", "Bebidas preparadas"]
                },
                {
                    id: "product_priority",
                    question: "¿Qué valoras más al elegir un producto?",
                    type: "radio",
                    options: ["Precio", "Calidad", "Marca", "Naturalidad", "Sabor"]
                },
                {
                    id: "notifications",
                    question: "¿Deseas recibir recordatorios o planes personalizados por correo o app?",
                    type: "radio",
                    options: ["Sí", "No"]
                }
            ]
        }
    ];

    // Calcular progreso basado en la fase actual
    const progress = (currentPhase / totalPhases) * 100;

    // Animación de entrada al cargar la página
    useEffect(() => {
        if (containerRef.current && cardRef.current) {
            // Estado inicial
            gsap.set(containerRef.current, {
                scale: 1.1,
                opacity: 0,
                filter: "blur(20px)"
            });
            gsap.set(cardRef.current, {
                scale: 0.95,
                opacity: 0,
                y: 30
            });

            // Timeline de entrada
            const tl = gsap.timeline();
            tl.to(containerRef.current, {
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.6,
                ease: "power2.out"
            })
            .to(cardRef.current, {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power1.out"
            }, "-=0.4");
        }
    }, []);

    // Animar barra de progreso con GSAP cuando cambia la fase
    useEffect(() => {
        if (progressBarRef.current && progressTextRef.current) {
            // Animar el ancho de la barra
            gsap.to(progressBarRef.current, {
                width: `${progress}%`,
                duration: 0.8,
                ease: "power2.out"
            });

            // Animar el texto del porcentaje con contador
            gsap.to(progressTextRef.current, {
                textContent: Math.round(progress),
                duration: 0.8,
                ease: "power2.out",
                snap: { textContent: 1 }, // Redondear a números enteros
                onUpdate: function() {
                    progressTextRef.current.textContent = Math.round(progressTextRef.current.textContent) + "% Completado";
                }
            });
        }
    }, [progress, currentPhase]);

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        const currentPhaseData = phases[currentPhase - 1];
        const totalQuestionsInPhase = currentPhaseData.questions.length;

        if (currentQuestion < totalQuestionsInPhase - 1) {
            // Siguiente pregunta en la misma fase
            setCurrentQuestion(prev => prev + 1);
        } else if (currentPhase < totalPhases) {
            // Siguiente fase
            setCurrentPhase(prev => prev + 1);
            setCurrentQuestion(0);
        } else {
            // Finalizar test
            handleSubmitTest();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            // Pregunta anterior en la misma fase
            setCurrentQuestion(prev => prev - 1);
        } else if (currentPhase > 1) {
            // Fase anterior
            const prevPhase = currentPhase - 1;
            const prevPhaseData = phases[prevPhase - 1];
            setCurrentPhase(prevPhase);
            setCurrentQuestion(prevPhaseData.questions.length - 1);
        }
    };

    const handleSubmitTest = async () => {
        setIsSubmitting(true);

        try {
            // Transformar respuestas al formato esperado por el backend
            const testData = {
                // Fase 1: Información Básica
                age: parseInt(answers.age) || 0,
                gender: answers.gender || "Prefiero no decirlo",
                height: parseFloat(answers.height) || 0,
                weight: parseFloat(answers.weight) || 0,
                medical_conditions: Array.isArray(answers.medical_condition) 
                    ? answers.medical_condition.join(", ") 
                    : "",
                
                // Fase 2: Nivel de Actividad Física
                exercise_freq: answers.exercise_frequency || "Nunca",
                activity_type: answers.activity_type || "Any", // Si no me equivoco eston estaba asi por el entrenamiento del modelo que fallaba con Nulos
                activity_intensity: answers.intensity_level || "Bajo",
                
                // Fase 3: Metas y Objetivos
                goal_declared: answers.main_goal || "Mantenerme",
                goal_timeframe: answers.goal_timeframe || "3 meses",
                focus_area: answers.focus_area || "General",
                
                // Fase 4: Hábitos Alimenticios
                diet_type: answers.diet_description || "Balanceada",
                diet_special: answers.diet_type || "Any", // Si no me equivoco eston estaba asi por el entrenamiento del modelo que fallaba con Nulos
                supplements: answers.supplement_usage || "No",
                current_supplements: Array.isArray(answers.current_supplements)
                    ? answers.current_supplements.join(", ")
                    : "",
                
                // Fase 5: Preferencias y Recomendaciones
                supplement_format: answers.supplement_format || "Polvo",
                product_priority: answers.product_priority || "Calidad",
                notifications_enabled: answers.notifications === "Sí"
            };

            console.log("Enviando respuestas del test al backend:", testData);

            // Llamada al backend (comentada para desarrollo)
            // const response = await submitPlacementTest(testData);
            // console.log("Respuesta del backend:", response);

            // Simular delay de envío para desarrollo
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirigir a la página de resultados del test
            // En producción, pasar los resultados del backend via state:
            // navigate("/placement-test/results", { state: { results: response } });
            navigate("/placement-test/results");
        } catch (error) {
            console.error("Error al enviar el test:", error);
            alert("Hubo un error al enviar el test. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canGoNext = () => {
        // Validar que la pregunta actual tenga respuesta
        const currentPhaseData = phases[currentPhase - 1];
        if (currentPhaseData.questions.length === 0) return true;
        
        const currentQuestionData = currentPhaseData.questions[currentQuestion];
        
        // Si la pregunta es condicional y no aplica, permitir continuar
        if (currentQuestionData.conditional && !currentQuestionData.conditional(answers)) {
            return true;
        }
        
        const currentQuestionId = currentQuestionData?.id;
        const answer = answers[currentQuestionId];
        
        // Para checkbox, verificar que al menos una opción esté seleccionada
        if (currentQuestionData.type === "checkbox") {
            return Array.isArray(answer) && answer.length > 0;
        }
        
        // Para otros tipos, verificar que exista una respuesta
        return answer !== undefined && answer !== "";
    };

    const canGoPrevious = () => {
        return currentPhase > 1 || currentQuestion > 0;
    };

    // Renderizar pregunta según su tipo
    const renderQuestion = () => {
        const currentPhaseData = phases[currentPhase - 1];
        const questionData = currentPhaseData.questions[currentQuestion];

        if (!questionData) return null;

        // Si la pregunta es condicional y no aplica, saltar automáticamente
        if (questionData.conditional && !questionData.conditional(answers)) {
            // Auto-avanzar a la siguiente pregunta
            setTimeout(() => handleNext(), 0);
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500">Saltando pregunta...</p>
                </div>
            );
        }

        const currentAnswer = answers[questionData.id];

        return (
            <div className="min-h-[400px] flex flex-col">
                {/* Número de pregunta */}
                <div className="mb-2">
                    <span className="text-sm font-medium text-[#70AA77]">
                        Pregunta {currentQuestion + 1} de {currentPhaseData.questions.length}
                    </span>
                </div>

                {/* Pregunta */}
                <h3 className="text-2xl font-bold text-gray-800 mb-8">
                    {questionData.question}
                </h3>

                {/* Opciones según tipo de pregunta */}
                <div className="flex-1">
                    {questionData.type === "number" && (
                        <div className="max-w-md mx-auto">
                            <div className="relative">
                                <input
                                    type="number"
                                    min={questionData.min}
                                    max={questionData.max}
                                    value={currentAnswer || ""}
                                    onChange={(e) => handleAnswer(questionData.id, e.target.value)}
                                    placeholder={questionData.placeholder}
                                    className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#70AA77] focus:outline-none transition-colors"
                                />
                                {questionData.unit && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                        {questionData.unit}
                                    </span>
                                )}
                            </div>
                            {questionData.min && questionData.max && (
                                <p className="mt-2 text-sm text-gray-500 text-center">
                                    Rango válido: {questionData.min} - {questionData.max} {questionData.unit}
                                </p>
                            )}
                        </div>
                    )}

                    {questionData.type === "radio" && (
                        <div className="space-y-3 max-w-2xl mx-auto">
                            {questionData.options.map((option, idx) => (
                                <label
                                    key={idx}
                                    className={`
                                        flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                        ${currentAnswer === option
                                            ? 'border-[#70AA77] bg-green-50 shadow-md'
                                            : 'border-gray-300 hover:border-[#70AA77] hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={questionData.id}
                                        value={option}
                                        checked={currentAnswer === option}
                                        onChange={(e) => handleAnswer(questionData.id, e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`
                                        flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                                        ${currentAnswer === option
                                            ? 'border-[#70AA77] bg-[#70AA77]'
                                            : 'border-gray-400'
                                        }
                                    `}>
                                        {currentAnswer === option && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                    <span className={`text-lg ${currentAnswer === option ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}

                    {questionData.type === "select" && (
                        <div className="max-w-md mx-auto">
                            <select
                                value={currentAnswer || ""}
                                onChange={(e) => handleAnswer(questionData.id, e.target.value)}
                                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-[#70AA77] focus:outline-none transition-colors bg-white"
                            >
                                <option value="">Selecciona una opción...</option>
                                {questionData.options.map((option, idx) => (
                                    <option key={idx} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {questionData.type === "checkbox" && (
                        <div className="space-y-3 max-w-2xl mx-auto">
                            {questionData.options.map((option, idx) => {
                                const currentValues = Array.isArray(currentAnswer) ? currentAnswer : [];
                                const isChecked = currentValues.includes(option);
                                
                                // Lógica de deshabilitación para condiciones médicas
                                const isNoneOption = option === "Ninguna";
                                const hasNoneSelected = currentValues.includes("Ninguna");
                                const hasOtherSelected = currentValues.some(v => v !== "Ninguna");
                                
                                // Deshabilitar "Ninguna" si hay otras seleccionadas
                                // Deshabilitar otras opciones si "Ninguna" está seleccionada
                                const isDisabled = questionData.id === "medical_condition" && 
                                    ((isNoneOption && hasOtherSelected) || (!isNoneOption && hasNoneSelected));
                                
                                return (
                                    <label
                                        key={idx}
                                        className={`
                                            flex items-center p-4 rounded-xl border-2 transition-all duration-200
                                            ${isDisabled
                                                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                                                : isChecked
                                                    ? 'border-[#70AA77] bg-green-50 shadow-md cursor-pointer'
                                                    : 'border-gray-300 hover:border-[#70AA77] hover:bg-gray-50 cursor-pointer'
                                            }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={(e) => {
                                                let newValues;
                                                
                                                if (questionData.id === "medical_condition") {
                                                    // Si selecciona "Ninguna", limpiar todo y solo poner "Ninguna"
                                                    if (option === "Ninguna" && e.target.checked) {
                                                        newValues = ["Ninguna"];
                                                    }
                                                    // Si deselecciona "Ninguna"
                                                    else if (option === "Ninguna" && !e.target.checked) {
                                                        newValues = [];
                                                    }
                                                    // Si selecciona otra opción, remover "Ninguna" si existe
                                                    else if (e.target.checked) {
                                                        newValues = [...currentValues.filter(v => v !== "Ninguna"), option];
                                                    }
                                                    // Si deselecciona otra opción
                                                    else {
                                                        newValues = currentValues.filter(v => v !== option);
                                                    }
                                                } else {
                                                    // Comportamiento normal para otros checkboxes
                                                    newValues = e.target.checked
                                                        ? [...currentValues, option]
                                                        : currentValues.filter(v => v !== option);
                                                }
                                                
                                                handleAnswer(questionData.id, newValues);
                                            }}
                                            className="sr-only"
                                        />
                                        <div className={`
                                            flex-shrink-0 w-5 h-5 rounded border-2 mr-3 flex items-center justify-center
                                            ${isChecked
                                                ? 'border-[#70AA77] bg-[#70AA77]'
                                                : 'border-gray-400'
                                            }
                                        `}>
                                            {isChecked && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-lg ${isChecked ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {option}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#70AA77] via-[#69AEA2] to-blue-400 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Barra de Progreso */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-sm">
                            Fase {currentPhase} de {totalPhases}
                        </span>
                        <span ref={progressTextRef} className="text-white font-semibold text-sm">
                            {Math.round(progress)}% Completado
                        </span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                        <div
                            ref={progressBarRef}
                            className="bg-white h-full rounded-full shadow-lg"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-white font-semibold text-3xl">
                            {phases[currentPhase - 1]?.title}
                        </span>
                    </div>
                </div>

                {/* Card Principal de Preguntas */}
                <div ref={cardRef} className="bg-white rounded-3xl shadow-2xl p-8">
                    {renderQuestion()}

                    {/* Botones de Navegación */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handlePrevious}
                            disabled={!canGoPrevious()}
                            className={`
                                px-6 py-3 rounded-xl font-semibold transition-all duration-200
                                ${canGoPrevious()
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            ← Anterior
                        </button>

                        <div className="text-sm text-gray-500">
                            Fase {currentPhase}/{totalPhases}
                        </div>

                        {currentPhase === totalPhases && 
                         currentQuestion === phases[currentPhase - 1].questions.length - 1 ? (
                            // Botón de finalizar en la última pregunta
                            <button
                                onClick={handleSubmitTest}
                                disabled={isSubmitting || !canGoNext()}
                                className={`
                                    px-8 py-3 rounded-xl font-semibold transition-all duration-200
                                    ${canGoNext() && !isSubmitting
                                        ? 'bg-gradient-to-r from-[#70AA77] to-[#69AEA2] text-white hover:shadow-xl hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    '✓ Finalizar Test'
                                )}
                            </button>
                        ) : (
                            // Botón de siguiente para otras preguntas
                            <button
                                onClick={handleNext}
                                disabled={!canGoNext()}
                                className={`
                                    px-6 py-3 rounded-xl font-semibold transition-all duration-200
                                    ${canGoNext()
                                        ? 'bg-gradient-to-r from-[#70AA77] to-[#69AEA2] text-white hover:shadow-xl hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                Siguiente →
                            </button>
                        )}
                    </div>

                    {/* Indicador de pregunta actual (opcional) */}
                    {phases[currentPhase - 1]?.questions.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            {phases[currentPhase - 1].questions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        w-2 h-2 rounded-full transition-all duration-200
                                        ${idx === currentQuestion 
                                            ? 'bg-[#70AA77] w-8' 
                                            : 'bg-gray-300'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón de salir (opcional) */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres salir? Perderás tu progreso.')) {
                                navigate('/profile/fitness');
                            }
                        }}
                        className="text-white text-md hover:underline"
                    >
                        Salir del test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlacementTestQuestions;
