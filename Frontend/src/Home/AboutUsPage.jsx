import React from 'react';
import { motion } from 'framer-motion';
import UsLogo from '../assets/AboutUs.png';

// Variantes de animacion para la pagina
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

// Variantes para animar los elementos uno por uno
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const AboutUs = () => {
  return (
    <motion.div 
      className="bg-[#FDFBF7] min-h-screen relative overflow-hidden" // Añadimos 'relative' y 'overflow-hidden'
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* --- Encabezado Verde --- */}
      <div className="bg-[#70AA77] py-24 shadow-md relative z-10"> {/* Añadimos 'relative z-10' */}
        <motion.h1 
          className="text-5xl font-extrabold text-white text-center tracking-wide"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          SOBRE NOSOTROS
        </motion.h1>
      </div>

      {/* --- Contenedor de la Imagen --- */}
      <motion.div 

        className="absolute w-full left-0 right-0 z-20 px-6" 
        style={{ top: '13%' }}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <img 
          src={UsLogo} // Reemplaza con tu URL
          alt="Equipo Befit en el gimnasio" 
          className="w-full max-w-4xl h-[352px] mx-auto object-cover shadow-xl" 
        />
      </motion.div>
      <div className="max-w-4xl mx-auto px-6 pt-80 pb-36 relative z-0"> 
        <motion.div 
          className="text-center"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          {/* --- Parrafos de Introducción --- */}
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p>
              En Befit, creemos que la nutrición no debe ser genérica,
              sino tan única como tú. Por eso creamos una experiencia
              personalizada que combina ciencia, datos y pasión por el
              bienestar.
            </p>
            <p>
              A través de nuestras encuestas inteligentes, analizamos
              tus objetivos, estilo de vida y necesidades nutricionales
              para diseñar el plan de suplementación perfecto para ti.
              Luego, con nuestro modelo de suscripción mensual,
              recibes en casa los productos exactos que necesitas para
              seguir avanzando —sin complicaciones, sin desperdicios,
              y siempre con la mejor calidad.
            </p>
            <p>
              Nuestro compromiso es ayudarte a alcanzar tu mejor
              versión, brindándote suplementos de confianza y un
              acompañamiento continuo que evoluciona contigo.
            </p>
          </div>
        </motion.div>

        {/* --- Seccion de Mision --- */}
        <motion.div 
          className="text-center mt-24"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-4xl font-extrabold text-gray-800 mb-8">
            Nuestra misión
          </h2>
          <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
            <p className="font-semibold text-xl text-gray-800">
              Nuestra misión es ayudarte a alcanzar tu máximo
              potencial.
            </p>
            <p>
              Creemos que cada cuerpo es distinto, por eso diseñamos
              una experiencia personalizada que evoluciona contigo:
              desde nuestras encuestas hasta tu kit mensual de
              suplementos, todo está hecho para impulsar tus metas, tu
              energía y tu bienestar diario.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutUs;