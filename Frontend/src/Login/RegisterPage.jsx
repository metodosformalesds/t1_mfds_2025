import React, { useState } from 'react';
import manIMG from '../assets/FitnessMen.png';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SocialMediaButtons from '../Componentes/SocialMediaButtons';
import { signUp } from '../utils/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            // Crear FormData básico con email y password
            const formDataToSend = new FormData();
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            // Los demás campos se completarán en SetupProfile
            formDataToSend.append('first_name', 'Temp');
            formDataToSend.append('last_name', 'User');

            await signUp(formDataToSend);

            // Guardar email para la confirmación
            sessionStorage.setItem('pendingConfirmEmail', formData.email);

            // Navegar a SetupProfile para completar registro
            navigate('/SetupProfile');
        } catch (err) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: {
            opacity: 0,
            x: 50
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: {
                duration: 0.3,
                ease: "easeIn"
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const imageVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            rotate: 5
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0 10px 25px rgba(59, 77, 130, 0.3)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.95
        }
    };

    return (
        <motion.div
            className="flex min-h-screen w-full font-sans"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* --- SECCION IZQUIERDA (Formulario) --- */}
            <div className="relative flex w-full flex-col justify-center bg-[#FFFCF2] p-8 md:w-1/2 lg:px-20">

                {/* Texto de fondo animado */}
                <motion.div
                    className="hidden md:block w-[669px] h-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.8, duration: 1 }}
                >
                    <span className="fixed top-[560px] -left-px text-[150px] font-bold text-gray-200 opacity-60 md:text-[180px] font-bebas tracking-[40.00px] leading-[normal]">
                        B E F I T
                    </span>
                </motion.div>

                {/* Contenedor del Formulario */}
                <motion.div
                    className="z-10 mx-auto w-full max-w-md"
                    variants={containerVariants}
                >

                    {/* Encabezado */}
                    <motion.div
                        className="mb-12 flex w-full justify-center"
                        variants={itemVariants}
                    >
                        <div className="relative mb-0 inline-block text-center">

                            {/* Título responsivo */}
                            <motion.h1
                                className="font-bebas text-7xl tracking-wider text-black md:text-8xl md:tracking-[0.3em]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                REGISTER
                            </motion.h1>

                            {/* Estrella responsiva animada */}
                            <motion.div
                                className="absolute -right-6 -top-10 md:-right-8 md:-top-14"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 2, repeat: Infinity }
                                }}
                            >
                                <svg width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth=".5" className="text-gray-800">
                                    <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.form
                        onSubmit={handleRegister}
                        className="flex flex-col space-y-2"
                        variants={containerVariants}
                    >
                        {error && (
                            <motion.div
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Input Email */}
                        <motion.div
                            className="flex flex-col"
                            variants={itemVariants}
                        >
                            <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Correo</label>
                            <motion.input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
                                whileFocus={{
                                    scale: 1.02,
                                    borderBottomColor: "#000000"
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                        </motion.div>

                        {/* Input Password */}
                        <motion.div
                            className="flex flex-col"
                            variants={itemVariants}
                        >
                            <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Contraseña</label>
                            <motion.input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
                                whileFocus={{
                                    scale: 1.02,
                                    borderBottomColor: "#000000"
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                        </motion.div>

                        {/* Input Confirmar Password */}
                        <motion.div
                            className="flex flex-col"
                            variants={itemVariants}
                        >
                            <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Confirma tu Contraseña</label>
                            <motion.input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
                                whileFocus={{
                                    scale: 1.02,
                                    borderBottomColor: "#000000"
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                        </motion.div>            {/* Boton Register */}
                        <motion.div
                            variants={buttonVariants}
                            whileHover={!loading ? "hover" : {}}
                            whileTap={!loading ? "tap" : {}}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="font-bebas tracking-[3px] w-full rounded-md bg-[#3b4d82] py-3 font-medium text-white shadow-md transition-all duration-150 hover:bg-transparent hover:border-2 hover:text-black hover:border-[#3b4d82] block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </motion.div>
                        {/* Login */}
                        <motion.div
                            className="text-center text-xs text-gray-600"
                            variants={itemVariants}
                        >
                            ¿Ya tienes cuenta?
                            <motion.span className="ml-1">
                                <Link
                                    to="/"
                                    className="font-bold text-[#5DA586] hover:underline"
                                >
                                    Inicia Sesión
                                </Link>
                            </motion.span>
                        </motion.div>

                        {/* Divisor "o" */}
                        <motion.div
                            className="relative flex items-center justify-center py-2"
                            variants={itemVariants}
                        >
                            <motion.span
                                className="text-xs text-gray-400"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                o
                            </motion.span>
                        </motion.div>

                        {/* Botones Sociales */}
                        <motion.div
                            className="space-y-3"
                            variants={itemVariants}
                        >
                            <SocialMediaButtons />
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>

            {/* --- SECCION DERECHA (Imagen) --- */}
            <div className="hidden h-screen w-1/2 items-center justify-center bg-[#70AA77] md:flex">
                <motion.div
                    className="relative flex items-center justify-center"
                    variants={imageVariants}
                >

                    <motion.img
                        src={manIMG}
                        alt="Fitness Man"
                        className="-bottom-0 -left-20 z-20 w-300 max-w-lg drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                        animate={{
                            y: [0, 0, 0],
                            rotate: [0, 0, 0, 0, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.3 }
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default RegisterPage;