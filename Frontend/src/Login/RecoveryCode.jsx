import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from '../assets/Befitwhite.png';

const MotionLink = motion(Link);

const VerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
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

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#fcfbf2]">

      {/* Fondo verde superior */}
      <motion.div 
        className="bg-[#70AA77] pb-48 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="w-full px-6 py-4 flex items-center border-b border-[#A5C8A1]">
          <motion.img 
            src={logo} 
            alt="Logo Befit" 
            className="h-10 md:h-12 object-contain" 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
        </header>
      </motion.div>

      {/* Contenido */}
      <main className="flex-grow flex items-start justify-center px-4 -mt-40 pb-10">
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-10 text-center"
          variants={mainCardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-black mb-4 uppercase tracking-wide"
              style={{ fontFamily: "Oswald, sans-serif" }}
              variants={itemVariant}
            >
              Ingresa el código de verificación
            </motion.h2>

            <motion.p 
              className="text-gray-600 mb-8 font-roboto text-sm md:text-base"
              variants={itemVariant}
            >
              Es el número de 6 dígitos que recibiste por correo.
            </motion.p>

            {/* Inputs del codigo */}
            <motion.div className="flex justify-center gap-2 md:gap-3 mb-8" variants={itemVariant}>
              {code.map((digit, index) => (
                <React.Fragment key={index}>
                  <motion.input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-12 text-xl md:w-14 md:h-16 md:text-2xl border-2 border-gray-400 rounded-xl text-center font-bold text-gray-700 
                      focus:outline-none focus:border-[#354a7d] focus:ring-2 focus:ring-[#354a7d]/20 transition-all"
                    whileFocus={{ 
                      scale: 1.1,
                      borderColor: "#354a7d",
                      boxShadow: "0 0 0 3px rgba(53, 74, 125, 0.3)"
                    }}
                  />
                  {index === 2 && <div className="w-1 md:w-2"></div>}
                </React.Fragment>
              ))}
            </motion.div>

            {/* Boton continuar */}
            <motion.div variants={itemVariant}>
              <MotionLink
                to="/RecoveryPassword"
                className="block w-full bg-[#354a7d] hover:bg-[#2c3e69] text-white font-bold py-3 rounded-xl text-base md:text-lg uppercase tracking-wider mb-4 transition-colors shadow-md"
                style={{ fontFamily: "Oswald, sans-serif" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Continuar
              </MotionLink>
            </motion.div>

            {/* Boton reenviar */}
            <motion.div variants={itemVariant}>
              <motion.button
                className="w-full bg-[#a8c49a] hover:bg-[#95b386] text-white font-bold py-3 rounded-xl text-base md:text-lg uppercase tracking-wider mb-6 transition-colors shadow-md"
                style={{ fontFamily: "Oswald, sans-serif" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Reenviar Código
              </motion.button>
            </motion.div>

            {/* Volver */}
            <motion.div variants={itemVariant}>
              <MotionLink
                to="/RecoverySelect"
                className="text-black font-bold uppercase tracking-wide hover:underline text-sm md:text-base"
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
    </div>
  );
};

export default VerificationPage;