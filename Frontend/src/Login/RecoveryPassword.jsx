import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from '../assets/Befitwhite.png';

const MotionLink = motion(Link);

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
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

  return (
    <motion.div 
      className="min-h-screen flex flex-col font-sans relative bg-[#fcfbf2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* Fondo Superior Verde */}
      <div className="bg-[#70AA77] pb-48 shadow-sm">
        <header className="w-full px-6 py-4 flex items-center border-b border-[#A5C8A1]">
          <motion.img 
            src={logo} 
            alt="Logo Befit" 
            className="h-12 object-contain"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
        </header>
      </div>

      {/* Contenido Principal */}
      <main className="flex-grow flex items-start justify-center px-4 -mt-40 pb-10">
        <motion.div 
          className="bg-white rounded-[30px] shadow-2xl w-full max-w-[500px] p-12 text-center relative"
          variants={mainCardVariants}
          initial="hidden"
          animate="visible"
        >

          <motion.div
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            {/* Título */}
            <motion.h2
              className="text-3xl font-bold text-black mb-10 uppercase tracking-wide"
              style={{ fontFamily: "Oswald, sans-serif" }}
              variants={itemVariant}
            >
              Cambiar Contraseña
            </motion.h2>

            {/* Inputs */}
            <motion.div className="space-y-8 mb-10 text-left" variants={itemVariant}>
              
              {/* Nueva contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-800 mb-1 uppercase"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  Nueva contraseña
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-b border-gray-400 text-gray-800 py-2 bg-transparent focus:outline-none focus:border-[#354a7d] transition-colors"
                />
              </div>

              {/* Repetir contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-gray-800 mb-1 uppercase"
                  style={{ fontFamily: "Oswald, sans-serif" }}
                >
                  Repetir contraseña
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-b border-gray-400 text-gray-800 py-2 bg-transparent focus:outline-none focus:border-[#354a7d] transition-colors"
                />
              </div>
            </motion.div>

            {/* Boton Continuar */}
            <motion.div variants={itemVariant}>
              <MotionLink
                to="/"
                className="block w-full bg-[#354a7d] hover:bg-[#2c3e69] text-white font-bold py-4 rounded-2xl text-xl uppercase tracking-wider mb-8 transition-colors shadow-md"
                style={{ fontFamily: "Oswald, sans-serif" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuar
              </MotionLink>
            </motion.div>

            {/* Volver */}
            <motion.div variants={itemVariant}>
              <MotionLink
                to="/RecoverySelect"
                className="text-black font-bold uppercase tracking-wide hover:underline text-lg"
                style={{ fontFamily: "Oswald, sans-serif" }}
                whileHover={{ color: "#70AA77" }}
                whileTap={{ scale: 0.95 }}
              >
                Volver
              </MotionLink>
            </motion.div>
          
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default ChangePasswordPage;