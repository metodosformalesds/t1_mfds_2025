import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/Befitwhite.png';
import { forgotPassword } from '../utils/api';

const MotionLink = motion(Link);

export default function VerifyAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (method) => {
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await forgotPassword(email);
      // Guardar email para siguiente paso
      sessionStorage.setItem('recoveryEmail', email);
      sessionStorage.setItem('recoveryMethod', method);
      navigate('/RecoveryCode');
    } catch (err) {
      setError(err.message || 'Error al enviar código de verificación');
    } finally {
      setLoading(false);
    }
  };
  const mainCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: 0.2, type: 'spring', stiffness: 100, damping: 15 } 
    }
  };
  
  const contentStagger = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.3
      } 
    }
  };
  
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { ease: 'easeOut' } }
  };


  // Datos simulados
  const options = [
    {
      id: 'email',
      title: 'Correo',
      detail: 'Enviaremos un código a tu correo electrónico',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf5]">
      
      <div className="bg-[#70AA77] pb-48 shadow-sm">
        <header className="w-full px-6 py-4 flex items-center border-b border-[#A5C8A1]">
          <motion.img 
            src={logo} 
            alt="Logo Befit" 
            className="h-12 object-contain"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: 'easeOut', duration: 0.5 }}
          />
        </header>
      </div>

      <main className="flex-grow flex items-start justify-center px-4 -mt-40 pb-10">
        {/* --- Tarjeta principal con animacion --- */}
        <motion.div 
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 md:p-10 relative z-10"
          variants={mainCardVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* --- Contenedor Stagger para el contenido --- */}
          <motion.div
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            {/* Titulos */}
            <motion.div className="text-center mb-8" variants={itemVariant}>
              <h1 className="font-bebas text-xl md:text-4xl font-regular text-gray-900 uppercase tracking-tight mb-3">
                Verifica que esta cuenta te pertenece
              </h1>
              <p className="font-poppins text-gray-600 text-sm md:text-base font-light">
                Ingresa tu email y elige cómo recibir el código
              </p>
            </motion.div>

            {/* Input Email */}
            <motion.div className="mb-6" variants={itemVariant}>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#70AA77] transition-colors"
              />
            </motion.div>

            {error && (
              <motion.div 
                className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Lista de Opciones */}
            <div className="space-y-0">
              {options.map((option, index) => (
                <motion.div key={option.id} variants={itemVariant}>
                  {index > 0 && <div className="h-px bg-gray-100"></div>}
                  
                  <motion.button 
                    onClick={() => handleSendCode(option.id)}
                    disabled={loading}
                    className="group w-full flex items-center justify-between py-5 transition-colors rounded-lg px-2 -mx-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!loading ? { backgroundColor: "rgb(249 250 251)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#B8D2B1] group-hover:bg-[#A5C8A1] transition-colors flex items-center justify-center flex-shrink-0 text-[#fcfbf5]">
                        {option.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm md:text-base">{option.title}</p>
                        <p className="text-gray-500 text-xs md:text-sm">{option.detail}</p>
                      </div>
                    </div>
                    
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-hover:text-[#70AA77] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
              <div className="h-px bg-gray-100"></div>
            </div>

            {/* Boton Volver */}
            <motion.div className="mt-10 text-center" variants={itemVariant}>
              <MotionLink 
                to='/' 
                className="font-montserrat text-gray-500 font-medium text-sm transition-colors"
                whileHover={{ color: "#70AA77" }}
                whileTap={{ scale: 0.95 }}
              >
                Volver
              </MotionLink>
            </motion.div>
          </motion.div>
        
        </motion.div>
      </main>
    </div>
  );
}