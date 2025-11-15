import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PerfilUsuario() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Simulación de fetch al backend 
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Reemplazar con endpoint real ->>>
                // const res = await fetch("/api/user/profile");
                // const data = await res.json();
                
                // Datos de ejemplo mientras se conecta el backend
                const mockData = {
                    success: true,
                    user: {
                        user_id: "123e4567-e89b-12d3-a456-426614174000",
                        email: "nombre.apellido@ejemplo.com",
                        first_name: "Nombre",
                        last_name: "Apellido",
                        profile_picture: null,
                    },
                    // Datos del endpoint de loyalty
                    loyalty: {
                        loyalty_id: "loyalty-123",
                        user_id: "123e4567-e89b-12d3-a456-426614174000",
                        total_points: 450,
                        tier_level: 1,
                        points_to_next_tier: 550,
                        next_tier_level: 2,
                    },
                };
                
                setTimeout(() => {
                    setUser(mockData);
                    setLoading(false);
                }, 500);
            } catch (error) {
                // TODO: Manejo de errores (Temporal para debug) 
                console.error(
                    `Error fetching user data: ${error && error.message ? error.message : error}`,
                    error && error.stack ? `\nStack trace: ${error.stack}` : ""
                );
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        // TODO: Implementar lógica de cierre de sesión
        navigate("/");
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = () => {
        // TODO: Implementar lógica de eliminación en el backend
        console.log("Eliminando cuenta...");
        setShowDeleteModal(false);
        navigate("/");
    };

    const handleNavigateToPayments = () => {
        // TODO: Navegar a la gestión de métodos de pago
        navigate("/payment-methods");
    };

    // Función para obtener el nombre del nivel según su categoría.
    const getTierName = (tierLevel) => {
        const tierMap = {
            1: "Bronce",
            2: "Plata",
            3: "Oro"
        };
        return tierMap[tierLevel] || "Desconocido";
    };

    // Función para calcular el porcentaje de progreso en lealtad
    const calculateLoyaltyProgress = (totalPoints, pointsToNextTier) => {
        if (!pointsToNextTier) return 100;
        return (totalPoints / (totalPoints + pointsToNextTier)) * 100;
    };

    // Renderizado condicional mientras se cargan los datos
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F3E7] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-800 mx-auto mb-4"></div>
                    <p className="text-lg font-oswald">Cargando...</p>
                </div>
            </div>
        );
    }

    // Renderizado condicional si no se encuentra el usuario 
    // (2da capa de seguridad, debe de haber validación en back para esto independientemente de esta validación)
    if (!user) {
        return (
            <div className="min-h-screen bg-[#F7F3E7] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-oswald text-gray-700">No se encontró información del usuario</p>
                    <button 
                        onClick={() => navigate("/")}
                        className="mt-4 bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-poppins tracking-wide"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F3E7] p-6 md:p-12 font-['Poppins',sans-serif]">
            <div className="max-w-6xl mx-auto">
                {/* Header del perfil */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-800 to-green-400 flex items-center justify-center text-white text-3xl font-popins">
                                {user.user.first_name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold font-popins tracking-wide">
                                    {user.user.first_name} {user.user.last_name}
                                </h2>
                                <p className="invisible sm:visible flex text-sm md:text-base items-center gap-2 text-gray-600 bg-gray-200 px-3 py-1 rounded-full mt-1">
                                    <span><svg className="size-3 md:size-4" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 3.28571C1 2.67951 1.24583 2.09812 1.68342 1.66947C2.121 1.24082 2.71449 1 3.33333 1H19.6667C20.2855 1 20.879 1.24082 21.3166 1.66947C21.7542 2.09812 22 2.67951 22 3.28571M1 3.28571V14.7143C1 15.3205 1.24583 15.9019 1.68342 16.3305C2.121 16.7592 2.71449 17 3.33333 17H19.6667C20.2855 17 20.879 16.7592 21.3166 16.3305C21.7542 15.9019 22 15.3205 22 14.7143V3.28571M1 3.28571L11.5 10.1429L22 3.28571" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg></span> {user.user.email}
                                </p>
                            </div>
                        </div>
                        <p className="visible sm:invisible sm:absolute flex text-sm md:text-base items-center gap-2 text-gray-600 bg-gray-200 px-3 py-1 rounded-full mt-1">
                                    <span><svg className="size-3 md:size-4" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 3.28571C1 2.67951 1.24583 2.09812 1.68342 1.66947C2.121 1.24082 2.71449 1 3.33333 1H19.6667C20.2855 1 20.879 1.24082 21.3166 1.66947C21.7542 2.09812 22 2.67951 22 3.28571M1 3.28571V14.7143C1 15.3205 1.24583 15.9019 1.68342 16.3305C2.121 16.7592 2.71449 17 3.33333 17H19.6667C20.2855 17 20.879 16.7592 21.3166 16.3305C21.7542 15.9019 22 15.3205 22 14.7143V3.28571M1 3.28571L11.5 10.1429L22 3.28571" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg></span> {user.user.email}
                                </p>
                        <button 
                            onClick={handleLogout}
                            className="bg-blue-800 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-popins tracking-wide"
                        >
                            <span>
                                <svg className="size-4 md:size-6" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 7.5V4.5C12 3.70435 12.3161 2.94129 12.8787 2.37868C13.4413 1.81607 14.2044 1.5 15 1.5H25.5C26.2956 1.5 27.0587 1.81607 27.6213 2.37868C28.1839 2.94129 28.5 3.70435 28.5 4.5V22.5C28.5 23.2956 28.1839 24.0587 27.6213 24.6213C27.0587 25.1839 26.2956 25.5 25.5 25.5H15C14.2044 25.5 13.4413 25.1839 12.8787 24.6213C12.3161 24.0587 12 23.2956 12 22.5V19.5M19.5 13.5H1.5M1.5 13.5L6 9M1.5 13.5L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* General section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-4">
                    <h3 className="text-2xl font-semibold font-popins tracking-wide mb-6">General</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <LargeCard 
                            title="Información Personal" 
                            icon={<UserIcon />} 
                            desc="Ve y edita tu información relacionada a tu cuenta"
                            className="col-span-2"
                            bgColor="bg-[#70AA77]"
                        />
                        <SmallCard 
                            title="Métodos de pago" 
                            icon={<CardIcon />} 
                            onClick={handleNavigateToPayments}
                            bgColor="bg-[#70AA77]"
                        />
                        <SmallCard 
                            title="Direcciones de entrega" 
                            icon={<TruckIcon />}
                            bgColor="bg-[#70AA77]"
                        />
                        <LargeCard 
                            title="Perfil Fitness" 
                            icon={<DumbbellIcon />} 
                            desc="Ajusta tus objetivos y vuelve a tomar el test"
                            className="col-span-2"
                            bgColor="bg-[#69AEA2]"
                        />
                        <SmallCard 
                            title="Historial" 
                            icon={<ClockIcon />}
                            bgColor="bg-[#69AEA2]"
                        />
                        <SmallCard 
                            title="Opiniones" 
                            icon={<ChatIcon />}
                            bgColor="bg-[#69AEA2]"
                        />
                    </div>
                </div>

                {/* Programa de puntos + Suscripción */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Points */}
                        <div>
                            <h3 className="text-2xl font-semibold font-popins tracking-wide mb-4">Programa de puntos</h3>
                            <p className="font-medium text-lg mb-2">
                                Nivel {getTierName(user.loyalty.tier_level)}
                            </p>
                            <div className="w-full h-6 rounded-full bg-gray-200 mt-2">
                                <div
                                    className="h-6 bg-[#70AA77] rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${calculateLoyaltyProgress(user.loyalty.total_points, user.loyalty.points_to_next_tier)}%` 
                                    }}
                                />
                            </div>
                            <p className="text-sm text-right mt-2 text-gray-600">
                                {user.loyalty.total_points}/{user.loyalty.points_to_next_tier ? 
                                    user.loyalty.total_points + user.loyalty.points_to_next_tier : user.loyalty.total_points} pts
                            </p>
                            <button className="text-sm text-blue-800 underline mt-3 hover:text-blue-700">
                                Ver beneficios
                            </button>
                        </div>

                        {/* Membership */}
                        <div>
                            <h3 className="text-2xl font-semibold font-popins tracking-wide mb-4">Suscripción</h3>
                                <div className="bg-gradient-to-r from-[#E0C77B] to-[#B99C42] p-6 rounded-xl text-white shadow-lg flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <svg className="size-10" viewBox="0 0 63 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20.7488 18.1141L2.45559 20.7577L2.13158 20.8235C1.64111 20.9532 1.19397 21.2105 0.835841 21.5688C0.47771 21.9272 0.221416 22.3739 0.0931302 22.8633C-0.0351554 23.3527 -0.030836 23.8673 0.105647 24.3545C0.24213 24.8417 0.505887 25.284 0.869983 25.6364L14.1225 38.4946L10.9972 56.6573L10.9599 56.9717C10.9299 57.4774 11.0352 57.9819 11.2651 58.4336C11.4951 58.8853 11.8413 59.268 12.2684 59.5425C12.6954 59.817 13.188 59.9735 13.6957 59.9958C14.2034 60.0181 14.7079 59.9056 15.1576 59.6697L31.5183 51.0956L47.8417 59.6697L48.1284 59.8012C48.6017 59.987 49.116 60.0439 49.6187 59.9662C50.1213 59.8885 50.5942 59.6789 50.9888 59.3589C51.3833 59.0389 51.6854 58.6201 51.864 58.1453C52.0426 57.6706 52.0912 57.157 52.005 56.6573L48.8768 38.4946L62.135 25.6335L62.3587 25.3906C62.6782 24.9984 62.8876 24.5287 62.9657 24.0296C63.0439 23.5304 62.9878 23.0195 62.8034 22.5489C62.6189 22.0784 62.3126 21.665 61.9157 21.3508C61.5187 21.0366 61.0453 20.833 60.5437 20.7606L42.2505 18.1141L34.073 1.59469C33.8364 1.11607 33.4701 0.713032 33.0155 0.431201C32.561 0.14937 32.0364 0 31.5011 0C30.9658 0 30.4412 0.14937 29.9866 0.431201C29.5321 0.713032 29.1658 1.11607 28.9291 1.59469L20.7488 18.1141Z" fill="#FFFCF2"/>
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold font-popins tracking-wide">Membresía Activa</h4>
                                        <div className="mt-3 flex flex-col text-sm gap-2">
                                            <button className="underline text-white hover:text-gray-100 text-left">
                                                Ver membresía
                                            </button>
                                            <button className="underline text-white hover:text-gray-100 text-left">
                                                Gestionar membresía
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h3 className="text-2xl font-semibold text-red-600 mb-4 font-popins tracking-wide">Zona de peligro</h3>
                    <p className="text-gray-600 mb-4">
                        Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
                    </p>
                    <button 
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 bg-[#C05F5F] hover:bg-red-500 text-white px-6 py-3 rounded-lg transition-colors font-popins tracking-wide"
                    >
                        <svg className="size-6" viewBox="0 0 35 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.5 9.5H33.5M13.5 17.5V29.5M21.5 17.5V29.5M3.5 9.5L5.5 33.5C5.5 34.5609 5.92143 35.5783 6.67157 36.3284C7.42172 37.0786 8.43913 37.5 9.5 37.5H25.5C26.5609 37.5 27.5783 37.0786 28.3284 36.3284C29.0786 35.5783 29.5 34.5609 29.5 33.5L31.5 9.5M11.5 9.5V3.5C11.5 2.96957 11.7107 2.46086 12.0858 2.08579C12.4609 1.71071 12.9696 1.5 13.5 1.5H21.5C22.0304 1.5 22.5391 1.71071 22.9142 2.08579C23.2893 2.46086 23.5 2.96957 23.5 3.5V9.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Eliminar cuenta
                    </button>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <DeleteAccountModal 
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDeleteAccount}
                />
            )}
        </div>
    );
}

// Large Card - SVG a la izquierda, texto a la derecha
function LargeCard({ title, icon, desc, onClick, className = "", bgColor = "bg-[#70AA77]" }) {
    return (
        <button 
            onClick={onClick}
            className={`p-6 rounded-xl ${bgColor} hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-4 text-left ${className}`}
        >
            <div className="text-white flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-xl mb-1 text-white">{title}</h4>
                {desc && <p className="text-sm text-white/90">{desc}</p>}
            </div>
        </button>
    );
}

// Small Card - Título arriba, SVG abajo centrado
function SmallCard({ title, icon, onClick, className = "", bgColor = "bg-[#70AA77]" }) {
    return (
        <button 
            onClick={onClick}
            className={`p-6 rounded-xl ${bgColor} hover:opacity-90 transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center text-center ${className}`}
        >
            <h4 className="font-semibold text-xl mb-4 text-white">{title}</h4>
            <div className="text-white">
                {icon}
            </div>
        </button>
    );
}

// SVG Icons
function UserIcon() {
    return (
        <svg className="size-14 md:size-16" viewBox="0 0 78 91" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 83.5263V74.5789C3 69.8329 4.89582 65.2813 8.27039 61.9254C11.645 58.5695 16.2219 56.6842 20.9943 56.6842H36.7392M11.9971 20.8947C11.9971 25.6407 13.8929 30.1923 17.2675 33.5482C20.6421 36.9041 25.219 38.7895 29.9914 38.7895C34.7638 38.7895 39.3407 36.9041 42.7152 33.5482C46.0898 30.1923 47.9856 25.6407 47.9856 20.8947C47.9856 16.1487 46.0898 11.5972 42.7152 8.24124C39.3407 4.88533 34.7638 3 29.9914 3C25.219 3 20.6421 4.88533 17.2675 8.24124C13.8929 11.5972 11.9971 16.1487 11.9971 20.8947ZM58.8722 59.4132C59.7494 58.5407 60.7909 57.8487 61.9371 57.3765C63.0834 56.9044 64.3119 56.6614 65.5525 56.6614C66.7932 56.6614 68.0217 56.9044 69.1679 57.3765C70.3141 57.8487 71.3556 58.5407 72.2329 59.4132C73.1102 60.2856 73.8061 61.3213 74.2808 62.4612C74.7556 63.6011 75 64.8228 75 66.0566C75 67.2904 74.7556 68.5121 74.2808 69.652C73.8061 70.7919 73.1102 71.8276 72.2329 72.7L56.9828 88H43.4871V74.579L58.8722 59.4132Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function CardIcon() {
    return (
        <svg className="size-12 md:size-14" viewBox="0 0 64 51" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 18.9286H61.5M15.6111 35.3571H15.6439M28.7222 35.3571H35.2778M2.5 12.3571C2.5 9.74287 3.53601 7.23566 5.38012 5.38709C7.22422 3.53852 9.72537 2.5 12.3333 2.5H51.6667C54.2746 2.5 56.7758 3.53852 58.6199 5.38709C60.464 7.23566 61.5 9.74287 61.5 12.3571V38.6429C61.5 41.2571 60.464 43.7643 58.6199 45.6129C56.7758 47.4615 54.2746 48.5 51.6667 48.5H12.3333C9.72537 48.5 7.22422 47.4615 5.38012 45.6129C3.53601 43.7643 2.5 41.2571 2.5 38.6429V12.3571Z" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function TruckIcon() {
    return (
        <svg className="size-14 md:size-16" viewBox="0 0 69 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.2632 44.8571C12.2632 46.7515 12.984 48.5684 14.2672 49.9079C15.5503 51.2474 17.2906 52 19.1053 52C20.9199 52 22.6602 51.2474 23.9434 49.9079C25.2265 48.5684 25.9474 46.7515 25.9474 44.8571M12.2632 44.8571C12.2632 42.9627 12.984 41.1459 14.2672 39.8064C15.5503 38.4668 17.2906 37.7143 19.1053 37.7143C20.9199 37.7143 22.6602 38.4668 23.9434 39.8064C25.2265 41.1459 25.9474 42.9627 25.9474 44.8571M12.2632 44.8571H5.42105V30.5714M25.9474 44.8571H46.4737M46.4737 44.8571C46.4737 46.7515 47.1945 48.5684 48.4777 49.9079C49.7608 51.2474 51.5012 52 53.3158 52C55.1304 52 56.8707 51.2474 58.1539 49.9079C59.437 48.5684 60.1579 46.7515 60.1579 44.8571M46.4737 44.8571C46.4737 42.9627 47.1945 41.1459 48.4777 39.8064C49.7608 38.4668 51.5012 37.7143 53.3158 37.7143C55.1304 37.7143 56.8707 38.4668 58.1539 39.8064C59.437 41.1459 60.1579 42.9627 60.1579 44.8571M60.1579 44.8571H67V23.4286M2 2H39.6316V44.8571M67 23.4286H39.6316M67 23.4286L56.7368 5.57143H39.6316M5.42105 16.2857H19.1053" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function DumbbellIcon() {
    return (
        <svg className="size-14 md:size-16" height="60" viewBox="0 0 97 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 30H7.1M20.9 11.6667H11.7C10.48 11.6667 9.30998 12.1496 8.44731 13.0091C7.58464 13.8686 7.1 15.0344 7.1 16.25V43.75C7.1 44.9656 7.58464 46.1314 8.44731 46.9909C9.30998 47.8504 10.48 48.3333 11.7 48.3333H20.9M34.7 30H62.3M76.1 11.6667H85.3C86.52 11.6667 87.69 12.1496 88.5527 13.0091C89.4154 13.8686 89.9 15.0344 89.9 16.25V43.75C89.9 44.9656 89.4154 46.1314 88.5527 46.9909C87.69 47.8504 86.52 48.3333 85.3 48.3333H76.1M94.5 30H89.9M20.9 7.08333V52.9167C20.9 54.1322 21.3846 55.298 22.2473 56.1576C23.11 57.0171 24.28 57.5 25.5 57.5H30.1C31.32 57.5 32.49 57.0171 33.3527 56.1576C34.2154 55.298 34.7 54.1322 34.7 52.9167V7.08333C34.7 5.86776 34.2154 4.70197 33.3527 3.84243C32.49 2.98289 31.32 2.5 30.1 2.5H25.5C24.28 2.5 23.11 2.98289 22.2473 3.84243C21.3846 4.70197 20.9 5.86776 20.9 7.08333ZM62.3 7.08333V52.9167C62.3 54.1322 62.7846 55.298 63.6473 56.1576C64.51 57.0171 65.68 57.5 66.9 57.5H71.5C72.72 57.5 73.89 57.0171 74.7527 56.1576C75.6154 55.298 76.1 54.1322 76.1 52.9167V7.08333C76.1 5.86776 75.6154 4.70197 74.7527 3.84243C73.89 2.98289 72.72 2.5 71.5 2.5H66.9C65.68 2.5 64.51 2.98289 63.6473 3.84243C62.7846 4.70197 62.3 5.86776 62.3 7.08333Z" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg className="size-10 md:size-12" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30.0964 18.1879V30.5212L36.2631 36.6879M2.5 27.4379C3.19095 20.6547 6.35498 14.3633 11.3884 9.7641C16.4219 5.16486 22.9724 2.57968 29.7902 2.50181C36.608 2.42394 43.2159 4.85882 48.3531 9.3419C53.4903 13.825 56.7972 20.0424 57.6429 26.808C58.4886 33.5736 56.8139 40.4138 52.9383 46.0235C49.0627 51.6332 43.2575 55.6197 36.6303 57.2224C30.0031 58.8252 23.0178 57.932 17.0071 54.7132C10.9964 51.4945 6.38106 46.1756 4.04167 39.7712M2.5 55.1879V39.7712H17.9167" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg className="size-10 md:size-12" viewBox="0 0 58 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 49.5L6.3248 38.0588C3.01913 33.1839 1.82328 27.4109 2.95962 21.8132C4.09595 16.2155 7.48714 11.174 12.5026 7.62609C17.5181 4.07815 23.8167 2.26523 30.2271 2.52439C36.6376 2.78356 42.7237 5.09718 47.354 9.03507C51.9842 12.973 54.8435 18.2672 55.4001 23.9333C55.9568 29.5995 54.1729 35.252 50.3803 39.8399C46.5876 44.4278 41.0442 47.6389 34.7807 48.8762C28.5173 50.1134 21.96 49.2926 16.3281 46.5664L2.5 49.5Z" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

// Modal de confirmación de eliminación de cuenta
function DeleteAccountModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#F0D3D3] border-2 border-[#C87474] rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl">
                {/* Header con icono y título */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                        <svg className="size-8" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5005 11.0012V17.003M16.5005 21.5043H16.5155M14.0447 2.88524L1.88478 23.1922C1.6341 23.6264 1.50145 24.1187 1.50001 24.6201C1.49858 25.1215 1.62841 25.6145 1.87659 26.0502C2.12478 26.4858 2.48267 26.8489 2.91467 27.1032C3.34666 27.3576 3.83771 27.4944 4.33897 27.5H28.6619C29.1629 27.4942 29.6537 27.3574 30.0855 27.1031C30.5173 26.8488 30.875 26.486 31.1232 26.0506C31.3713 25.6152 31.5012 25.1224 31.5 24.6212C31.4987 24.12 31.3664 23.6279 31.1161 23.1937L18.9561 2.88374C18.7003 2.46137 18.3399 2.11213 17.9097 1.86974C17.4796 1.62734 16.9942 1.5 16.5004 1.5C16.0067 1.5 15.5213 1.62734 15.0911 1.86974C14.661 2.11213 14.3006 2.46137 14.0447 2.88374V2.88524Z" stroke="#A34E4E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-[#B36A6A] font-popins leading-tight">
                        ¿Estás seguro de que quieres eliminar tu cuenta?
                    </h3>
                </div>

                {/* Mensaje de advertencia */}
                <p className="text-black text-sm md:text-base mb-6 ml-12 md:ml-14">
                    Esta acción es <span className="font-bold">irreversible</span> y <span className="font-bold">perderás acceso a toda tu información.</span>
                </p>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors font-popins"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        // TODO: logica de eliminación
                        className="px-6 py-3 bg-[#B36A6A] hover:bg-[#9d5656] text-white rounded-lg transition-colors font-popins flex items-center justify-center gap-2"
                    >
                        <svg className="size-4 md:size-5" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5005 11.0012V17.003M16.5005 21.5043H16.5155M14.0447 2.88524L1.88478 23.1922C1.6341 23.6264 1.50145 24.1187 1.50001 24.6201C1.49858 25.1215 1.62841 25.6145 1.87659 26.0502C2.12478 26.4858 2.48267 26.8489 2.91467 27.1032C3.34666 27.3576 3.83771 27.4944 4.33897 27.5H28.6619C29.1629 27.4942 29.6537 27.3574 30.0855 27.1031C30.5173 26.8488 30.875 26.486 31.1232 26.0506C31.3713 25.6152 31.5012 25.1224 31.5 24.6212C31.4987 24.12 31.3664 23.6279 31.1161 23.1937L18.9561 2.88374C18.7003 2.46137 18.3399 2.11213 17.9097 1.86974C17.4796 1.62734 16.9942 1.5 16.5004 1.5C16.0067 1.5 15.5213 1.62734 15.0911 1.86974C14.661 2.11213 14.3006 2.46137 14.0447 2.88374V2.88524Z" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}