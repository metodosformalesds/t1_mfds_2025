import React from 'react';
import CreatinaIMG from '../assets/Creatina.png';
import ScoopIMG from '../assets/Scoop.png';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const containerVariants = {
    hidden: { 
      opacity: 0,
      x: 50
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.5,
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
        duration: 0.5,
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
        duration: 0.8,
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
            className="flex flex-col space-y-2"
            variants={containerVariants}
          >
            {/* Input Email */}
            <motion.div 
              className="flex flex-col"
              variants={itemVariants}
            >
              <label className="font-oswald mb-1 text-s font-semibold text-gray-600">Correo</label>
              <motion.input 
                type="email" 
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
                className="border-b border-gray-300 bg-transparent py-1 text-gray-900 outline-none transition-colors focus:border-black"
                whileFocus={{ 
                  scale: 1.02,
                  borderBottomColor: "#000000"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            {/* Olvidaste contraseña */}
            <motion.div 
              className="text-right"
              variants={itemVariants}
            >
              <a href="#" className="text-xs font-medium text-gray-600 hover:text-black hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </motion.div>

            {/* Boton Register */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/SetupProfile"
                className="font-bebas tracking-[3px] w-full rounded-md bg-[#3b4d82] py-3 font-medium text-white shadow-md transition-all duration-150 hover:bg-transparent hover:border-2 hover:text-black hover:border-[#3b4d82] block text-center"
              >
                Registrarse
              </Link>
            </motion.div>

            {/* Login */}
            <motion.div 
              className="text-center text-xs text-gray-600"
              variants={itemVariants}
            >
              ¿Ya tienes cuenta? 
              <motion.span className="ml-1">
                <Link 
                  to="/login" 
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
              <motion.button 
                className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                whileHover={{ 
                  y: -2, 
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)" 
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continua con Google
              </motion.button>

              <motion.button 
                className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                whileHover={{ 
                  y: -2, 
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)" 
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.924 1.611-2.924 4.055v2.056h3.984l-.599 3.667h-3.385L15.425 24C12.8 24 9.101 24 9.101 23.691Z"/>
                </svg>
                Continua con Facebook
              </motion.button>
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
            src={CreatinaIMG} 
            alt="Creatina Product" 
            className="max-w-[80%] drop-shadow-2xl transition-transform hover:scale-105 duration-500"
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          />

          <motion.img 
            src={ScoopIMG}
            alt="Scoop IMG" 
            className="absolute -bottom-28 -left-20 z-50 w-600 max-w-[100%] drop-shadow-2xl transition-transform hover:scale-105 duration-500"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, 0, -2, 0]
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