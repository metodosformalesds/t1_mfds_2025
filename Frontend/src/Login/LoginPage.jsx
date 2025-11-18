{
/*
 * Autor: Ricardo Rodriguez
 * Componente: LoginPage
 * Descripción: Maneja el inicio de sesión de usuarios, incluyendo validación de credenciales y animaciones con Framer Motion.
 */
}
import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import CreatinaIMG from '../assets/Creatina.png';
import ScoopIMG from '../assets/Scoop.png';
import SocialMediaButtons from '../Componentes/SocialMediaButtons';
import { login } from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login(formData.email, formData.password);
      
      // Guardar tokens en localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('id_token', response.id_token);
      
      navigate('/Home');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      x: -50
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
      x: 50,
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
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -5 
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

  return (
    <motion.form 
      onSubmit={handleLogin} 
      className="flex flex-col space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex min-h-screen w-full font-sans">
        
        <div className="relative flex w-full flex-col justify-center bg-[#FFFCF2] p-8 md:w-1/2 lg:px-20">
          
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

          <motion.div 
            className="z-10 mx-auto w-full max-w-md"
            variants={containerVariants}
          >
            
            <motion.div 
              className="mb-12 flex w-full justify-center"
              variants={itemVariants}
            >
              <div className="relative mb-0 text-center inline-block">
                <motion.h1 
                  className="font-bebas text-8xl font-Regular tracking-[0.3em] text-black"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  LOGIN
                </motion.h1>

                <motion.div 
                  className="absolute -right-8 -top-14"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <svg width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth=".5">
                    <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

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
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

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
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            <motion.div 
              className="text-right"
              variants={itemVariants}
            >
              <Link to="/RecoverySelect" className="text-xs font-medium text-gray-600 hover:text-black hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>

            <motion.button 
              type="submit"
              disabled={loading}
              className="font-bebas tracking-[3px] w-full rounded-md bg-[#3b4d82] py-3 font-medium text-white text-center shadow-md transition-all duration-150 border border-transparent hover:bg-transparent hover:border-[#3b4d82] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              variants={itemVariants}
              whileHover={!loading ? { 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(59, 77, 130, 0.3)"
              } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </motion.button>

            <motion.div 
              className="text-center text-xs text-gray-600"
              variants={itemVariants}
            >
              ¿Aún no tienes una cuenta?
              <motion.div className="inline-block">
                <Link 
                  to="/RegisterPage"
                  className="font-bold text-[#5DA586] hover:underline"
                >
                  Regístrate
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative flex items-center justify-center py-2"
              variants={itemVariants}
            >
              <span className="text-xs text-gray-400">o</span>
            </motion.div>

            <motion.div 
              className="space-y-3"
              variants={itemVariants}
            >
              <SocialMediaButtons />
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden h-screen w-1/2 items-center justify-center bg-[#70AA77] md:flex">
          <motion.div 
            className="relative flex items-center justify-center"
            variants={imageVariants}
          >
            <motion.img 
              src={CreatinaIMG} 
              alt="Creatina Product" 
              className="max-w-[80%] drop-shadow-2xl"
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            />

            <motion.img 
              src={ScoopIMG}
              alt="Scoop IMG" 
              className="absolute -bottom-28 -left-20 z-50 w-600 max-w-[100%] drop-shadow-2xl"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 1, 0, -1, 0]
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
      </div>
    </motion.form>
  );
};

export default LoginPage;
