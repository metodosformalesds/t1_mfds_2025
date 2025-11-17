import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

// --- Iconos SVG ---
const StethoscopeIcon = () => (
    <svg className="size-10" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1063_2732)">
        <g filter="url(#filter0_d_1063_2732)">
        <path d="M4.5319 20.8333C4.39301 20.3125 4.29787 19.7917 4.24648 19.2708C4.1951 18.75 4.16871 18.2118 4.16732 17.6562C4.16732 14.3924 5.26107 11.6757 7.44857 9.50625C9.63607 7.33681 12.3618 6.25139 15.6257 6.25C17.3965 6.25 19.1069 6.63194 20.7569 7.39583C22.4069 8.15972 23.8215 9.23611 25.0007 10.625C26.1812 9.23611 27.5875 8.15972 29.2194 7.39583C30.8513 6.63194 32.5701 6.25 34.3756 6.25C37.6395 6.25 40.3652 7.33542 42.5527 9.50625C44.7402 11.6771 45.834 14.3931 45.834 17.6542V17.7583C45.1743 17.1681 44.4625 16.6562 43.6986 16.2229C42.9347 15.7896 42.1187 15.434 41.2506 15.1562C40.7645 13.7326 39.8965 12.5868 38.6465 11.7188C37.3965 10.8507 35.9729 10.4167 34.3756 10.4167C32.8826 10.4167 31.4416 10.8597 30.0527 11.7458C28.6638 12.6319 27.3791 13.925 26.1986 15.625H23.8027C22.6569 13.9583 21.3722 12.6736 19.9486 11.7708C18.525 10.8681 17.084 10.4167 15.6257 10.4167C13.577 10.4167 11.85 11.1201 10.4444 12.5271C9.03885 13.934 8.33537 15.6438 8.33398 17.6562C8.33398 18.2118 8.38607 18.7417 8.49023 19.2458C8.5944 19.75 8.75065 20.2792 8.95898 20.8333H4.5319ZM25.0007 43.75L18.3861 37.8125C17.4486 36.9444 16.5805 36.1458 15.7819 35.4167C14.9833 34.6875 14.2368 33.9931 13.5423 33.3333H19.6361C20.4347 34.0278 21.277 34.7743 22.1631 35.5729C23.0493 36.3715 23.9951 37.2222 25.0007 38.125C25.5909 37.6389 26.1382 37.1701 26.6423 36.7187C27.1465 36.2674 27.6409 35.816 28.1257 35.3646C28.6118 35.8854 29.1243 36.3632 29.6631 36.7979C30.202 37.2326 30.7833 37.6229 31.4069 37.9688L25.0007 43.75ZM37.5006 35.4167C36.9104 35.4167 36.4159 35.2167 36.0173 34.8167C35.6187 34.4167 35.4187 33.9222 35.4173 33.3333C35.4173 32.7431 35.6173 32.2486 36.0173 31.85C36.4173 31.4514 36.9118 31.2514 37.5006 31.25C38.0909 31.25 38.5861 31.45 38.9861 31.85C39.3861 32.25 39.5854 32.7444 39.584 33.3333C39.584 33.9236 39.384 34.4187 38.984 34.8187C38.584 35.2187 38.0895 35.4181 37.5006 35.4167ZM35.4173 29.1667V18.75H39.584V29.1667H35.4173ZM2.08398 29.1667V25H11.3548L15.0007 19.6354C15.209 19.3229 15.4611 19.0972 15.7569 18.9583C16.0527 18.8194 16.3736 18.75 16.7194 18.75C17.0666 18.75 17.3882 18.8285 17.684 18.9854C17.9798 19.1424 18.2312 19.3764 18.4382 19.6875L21.9798 25H25.209C25.1395 25.3472 25.0875 25.6861 25.0527 26.0167C25.018 26.3472 25.0007 26.7028 25.0007 27.0833C25.0007 27.4653 25.018 27.8215 25.0527 28.1521C25.0875 28.4826 25.1395 28.8208 25.209 29.1667H20.834C20.4868 29.1667 20.1569 29.0799 19.8444 28.9062C19.5319 28.7326 19.2888 28.5069 19.1152 28.2292L16.6673 24.5833L14.2194 28.2292C14.0458 28.5069 13.8027 28.7326 13.4902 28.9062C13.1777 29.0799 12.8479 29.1667 12.5007 29.1667H2.08398Z" fill="#459385"/>
        </g>
    </g>
    <defs>
        <filter id="filter0_d_1063_2732" x="-1.91602" y="6.25" width="51.75" height="45.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1063_2732"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1063_2732" result="shape"/>
        </filter>
        <clipPath id="clip0_1063_2732">
        <rect width="50" height="50" fill="white"/>
        </clipPath>
    </defs>
    </svg>
);

const CheckIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-4 text-white"
    >
        <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.492-6.738a.75.75 0 0 1 1.04-.208Z"
            clipRule="evenodd"
        />
    </svg>
);

// --- Componente Principal ---
const TestIntro = () => {
    const navigate = useNavigate();
    const [hasAgreed, setHasAgreed] = useState(false);
    const containerRef = useRef(null);
    const cardRef = useRef(null);

    const handleStartTest = () => {
        if (hasAgreed && containerRef.current && cardRef.current) {
            // Crear timeline de GSAP para la transición
            const tl = gsap.timeline({
                onComplete: () => {
                    navigate("/placement-test/questions");
                }
            });

            // Animación de salida con efecto de distorsión
            tl.to(cardRef.current, {
                scale: 0.95,
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: "power2.in"
            })
            .to(containerRef.current, {
                scale: 1.1,
                opacity: 0,
                filter: "blur(20px)",
                duration: 0.5,
                ease: "power2.inOut"
            }, "-=0.2");
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-amber-50 p-4 md:p-8 flex items-center justify-center">
            <div ref={cardRef} className="max-w-5xl w-full bg-white rounded-xl shadow-md border border-gray-200 p-8 md:p-12">
                <main className="text-center max-w-4xl mx-auto">
                    {/* Encabezado */}
                    <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-6">
                        ¿Listo para TÚ MEJOR VERSION?
                    </h1>

                    {/* Texto de Introducción */}
                    <p className="text-lg text-gray-800 mb-4">
                        En los <strong className="font-bold">Próximos minutos</strong> te
                        haremos algunas{" "}
                        <strong className="font-bold">preguntas sobre tus hábitos</strong>,
                        objetivos y estilo de vida.
                    </p>
                    <p className="text-lg text-gray-800 mb-8">
                        Con tus respuestas podremos recomendarte los productos y planes que
                        mejor se adapten a ti.
                    </p>

                    {/* Cuadro de Advertencia */}
                    <div className="bg-[#E0EADE] rounded-lg p-4 flex items-center gap-4 text-left mb-6">
                        <div className="flex-shrink-0">
                            <StethoscopeIcon />
                        </div>
                        <p className="text-sm text-green-900 opacity-90">
                            Este Test <strong className="font-bold">NO SUSTITUYE</strong> una
                            evaluación <strong className="font-bold">médica real</strong> o
                            nutricional profesional. Las recomendaciones que obtendrás son
                            orientativas y están basadas en tus respuestas personales.
                        </p>
                    </div>

                    {/* Checkbox de Consentimiento */}
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <input
                            type="checkbox"
                            id="agree"
                            className="sr-only" // Ocultamos el checkbox nativo
                            checked={hasAgreed}
                            onChange={() => setHasAgreed(!hasAgreed)}
                        />
                        <label htmlFor="agree" className="flex items-center cursor-pointer">
                            <div
                                className={`flex-shrink-0 size-5 rounded border-2 ${hasAgreed
                                        ? "bg-[#70AA77] border-[#70AA77]"
                                        : "bg-white border-gray-400"
                                    } flex items-center justify-center transition-colors`}
                            >
                                {hasAgreed && <CheckIcon />}
                            </div>
                            <span className="ml-2 text-sm text-gray-700">
                                He leído y entiendo que este test tiene fines informativos y no
                                médicos
                            </span>
                        </label>
                    </div>

                    {/* Botón de Comenzar */}
                    <button
                        onClick={handleStartTest}
                        className="bg-[#70AA77] text-white text-lg font-semibold py-3 px-10 rounded-lg transition-opacity shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:enabled:bg-opacity-90"
                        disabled={!hasAgreed}
                    >
                        ¡Comenzar Test!
                    </button>
                </main>
            </div>
        </div>
    );
};

export default TestIntro;
