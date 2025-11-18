import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateUserProfile, updateProfileImage, confirmSignUp } from '../utils/api';

// Icono de Lapiz para editar
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

// --- Componente Principal ---
export default function App() {
  const navigate = useNavigate();
  
  // Estado de inputs
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [año, setAño] = useState('');

  // Foto de perfil
  const [foto, setFoto] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  
  // Control de flujo
  const [email, setEmail] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si viene de registro
    const pendingEmail = sessionStorage.getItem('pendingConfirmEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
      setNeedsConfirmation(true);
    }
  }, []);

  // ⭐ NUEVA LÓGICA: Ajustar día seleccionado cuando cambia mes o año
  useEffect(() => {
    if (dia && mes && año) {
      const maxDays = getDaysInMonth(parseInt(mes), parseInt(año));
      if (parseInt(dia) > maxDays) {
        setDia(maxDays.toString()); // Ajustar al último día válido del mes
      }
    }
  }, [mes, año, dia]);

  // Variantes de animación
  const containerVariants = {
    hidden: { 
      opacity: 0,
      y: 50
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 25,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const photoVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -10 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400
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
        damping: 10,
        delay: 0.3
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(59, 77, 130, 0.4)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const starVariants = {
    hidden: { opacity: 0, rotate: -180 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Cargar foto y mostrar preview
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(URL.createObjectURL(file));
      setFotoFile(file);
    }
  };

  // --- Helpers Fecha ---
  // ⭐ NUEVA LÓGICA: Obtener días correctos
  const getDaysInMonth = (month, year) => {
    if (!month) return 31; // Si no hay mes seleccionado, mostrar 31 días
    if (!year) year = new Date().getFullYear(); // Usar año actual si no está seleccionado
    // month está en base 1 (1-12), convertir a base 0 para Date
    return new Date(year, month, 0).getDate(); // Día 0 del mes siguiente = último día del mes actual
  };

  const getDays = () => {
    // ⭐ NUEVA LÓGICA: Calcula días basado en mes/año
    const maxDays = getDaysInMonth(parseInt(mes) || 0, parseInt(año) || 0);
    const days = [];
    for (let i = 1; i <= maxDays; i++) {
      // Usando key con prefijo para asegurar unicidad absoluta
      days.push(
        <option key={`day-${i}`} value={i}>
          {i}
        </option>
      );
    }
    return days;
  };

  const getMonths = () => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return monthNames.map((month, index) => (
      // Usando key con prefijo para asegurar unicidad absoluta
      <option key={`month-${index + 1}`} value={index + 1}>
        {month}
      </option>
    ));
  };

  const getYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= currentYear - 100; i--) {
      // Usando key con prefijo para asegurar unicidad absoluta
      years.push(
        <option key={`year-${i}`} value={i}>
          {i}
        </option>
      );
    }
    return years;
  };

  // --- Confirmar Código ---
  const handleConfirmCode = async () => {
    if (!confirmationCode || confirmationCode.length !== 6) {
      setError('Por favor ingresa un código válido de 6 dígitos');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await confirmSignUp(email, confirmationCode);
      setNeedsConfirmation(false);
      sessionStorage.removeItem('pendingConfirmEmail');
    } catch (err) {
      setError(err.message || 'Código de verificación inválido');
    } finally {
      setLoading(false);
    }
  };

  // --- Enviar Formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!nombre || !apellido || !genero || !dia || !mes || !año) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    // ⭐ NUEVA LÓGICA: Validación de fecha de nacimiento
    const date = new Date(año, mes - 1, dia);
    const today = new Date();
    
    // Verificar que la fecha sea válida (mes y día existen)
    if (date.getMonth() !== mes - 1 || date.getDate() !== parseInt(dia)) {
      setError('La fecha de nacimiento no es válida');
      return;
    }
    
    // Verificar que no sea fecha futura
    if (date > today) {
      setError('La fecha de nacimiento no puede ser en el futuro');
      return;
    }
    
    // Verificar edad mínima (13 años)
    const age = Math.floor((today - date) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      setError('Debes tener al menos 13 años para registrarte');
      return;
    }
    
    setLoading(true);
    
    try {
      // Construir fecha de nacimiento en formato ISO
      const birthDate = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      
      // ⭐ NUEVA LÓGICA: Mapear género al formato del backend (si aplica)
      const genderMap = {
        'masculino': 'male',
        'femenino': 'female',
        'no-decir': 'other'
      };
      
      // Actualizar perfil básico
      await updateUserProfile({
        first_name: nombre,
        last_name: apellido,
        // Usar el mapeo de género para enviarlo al API
        gender: genderMap[genero] || genero, 
        date_of_birth: birthDate
      });
      
      // Si hay foto, subirla
      if (fotoFile) {
        await updateProfileImage(fotoFile);
      }
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('pendingConfirmEmail');
      
      // Navegar a login
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al completar el perfil');
    } finally {
      setLoading(false);
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
      
      {/* IZQUIERDA (Formulario) */}
      <div className="relative flex w-full flex-col justify-center bg-[#FFFCF2] p-8 md:w-1/2 lg:px-20">
        
        <motion.div 
          className="z-10 mx-auto w-full max-w-md"
          variants={containerVariants}
        >
          
          {/* Titulo */}
          <motion.div 
            className="mb-10 flex w-full justify-center"
            variants={itemVariants}
          >
            <div className="relative mb-0 inline-block text-center">
              <motion.h1 
                className="font-bebas text-6xl font-bold tracking-[0.1em] text-black md:text-7xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {needsConfirmation ? 'CONFIRMA TU CUENTA' : 'CREA TU PERFIL'}
              </motion.h1>
              
              <motion.div 
                className="absolute -right-12 -top-14"
                variants={starVariants}
                initial="hidden"
                animate={["visible", "animate"]}
              >
                <svg width="80" height="100" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth=".5" className="text-gray-800">
                  <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z" />
                </svg>
              </motion.div>
            </div>
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

          {needsConfirmation ? (
            /* UI para confirmar código */
            <motion.div variants={itemVariants}>
              <p className="text-gray-600 mb-4 text-center">
                Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
              </p>
              <input 
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg py-3 mb-4 focus:border-[#3b4d82] focus:outline-none"
              />
              <motion.button
                onClick={handleConfirmCode}
                disabled={loading || confirmationCode.length !== 6}
                className="w-full bg-[#3b4d82] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? 'Confirmando...' : 'Confirmar Código'}
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* ------------------ FOTO DE PERFIL ------------------ */}
          <motion.div 
            className="mb-10 flex justify-center"
            variants={photoVariants}
            whileHover="hover"
          >
            <div className="relative">
              
              {/* Circulo */}
              <motion.div 
                className="h-32 w-32 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center"
                whileHover={{ 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  transition: { duration: 0.3 }
                }}
              >
                {foto ? (
                  <motion.img
                    src={foto}
                    alt="Foto"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <motion.span 
                    className="text-gray-600 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Sin foto
                  </motion.span>
                )}
              </motion.div>

              {/* Boton Agregar */}
              <motion.button
                type="button"
                onClick={() => document.getElementById('foto-input').click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#3b4d82] shadow-md"
                whileHover={{ 
                  scale: 1.2,
                  rotate: 15,
                  backgroundColor: "#5DA586"
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <EditIcon />
              </motion.button>

              {/* Input oculto */}
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
          </motion.div>

          {/* ------------------ FORMULARIO ------------------ */}
          <motion.form 
            className="flex flex-col space-y-5" 
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            
            {/* Nombre */}
            <motion.div 
              className="flex flex-col"
              variants={itemVariants}
            >
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Nombre</label>
              <motion.input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border-b border-gray-400 bg-transparent py-2 text-gray-900 outline-none focus:border-black"
                whileFocus={{ 
                  scale: 1.02,
                  borderBottomColor: "#3b4d82",
                  backgroundColor: "rgba(59, 77, 130, 0.05)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            {/* Apellido */}
            <motion.div 
              className="flex flex-col"
              variants={itemVariants}
            >
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Apellido</label>
              <motion.input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="border-b border-gray-400 bg-transparent py-2 text-gray-900 outline-none focus:border-black"
                whileFocus={{ 
                  scale: 1.02,
                  borderBottomColor: "#3b4d82",
                  backgroundColor: "rgba(59, 77, 130, 0.05)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>

            {/* Género */}
            <motion.div 
              className="flex flex-col"
              variants={itemVariants}
            >
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Género</label>
              <motion.select
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2 text-gray-900 shadow-sm outline-none focus:border-[#737373] focus:ring-1 focus:ring-[#737373]"
                whileFocus={{ 
                  scale: 1.02,
                  borderColor: "#3b4d82",
                  boxShadow: "0 0 0 2px rgba(59, 77, 130, 0.2)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <option value="" disabled>Selecciona una opción</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no-decir">Prefiero no decirlo</option>
              </motion.select>
            </motion.div>

            {/* Fecha de Nacimiento */}
            <motion.div 
              className="flex flex-col"
              variants={itemVariants}
            >
              <label className="font-oswald mb-1 text-sm font-semibold text-gray-600">Fecha de nacimiento</label>
              <div className="flex space-x-3">
                
                <motion.select
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                  whileFocus={{ 
                    scale: 1.02,
                    borderColor: "#3b4d82",
                    boxShadow: "0 0 0 2px rgba(59, 77, 130, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="" disabled>Día</option>
                  {getDays()}
                </motion.select>

                <motion.select
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                  whileFocus={{ 
                    scale: 1.02,
                    borderColor: "#3b4d82",
                    boxShadow: "0 0 0 2px rgba(59, 77, 130, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="" disabled>Mes</option>
                  {getMonths()}
                </motion.select>

                <motion.select
                  value={año}
                  onChange={(e) => setAño(e.target.value)}
                  className="flex-1 rounded-3xl border border-[#737373] bg-[#F0F0F0] py-2 px-2"
                  whileFocus={{ 
                    scale: 1.02,
                    borderColor: "#3b4d82",
                    boxShadow: "0 0 0 2px rgba(59, 77, 130, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <option value="" disabled>Año</option>
                  {getYears()}
                </motion.select>
              </div>
            </motion.div>

            {/* Boton Continuar */}
            <motion.div
              variants={buttonVariants}
              whileHover={!loading ? "hover" : {}}
              whileTap={!loading ? "tap" : {}}
            >
              <button
                type="submit"
                disabled={loading}
                className="font-bebas tracking-[3px] w-full rounded-md bg-[#3b4d82] py-3 font-medium text-white text-center shadow-md transition-all duration-150 border border-transparent hover:bg-transparent hover:border-[#3b4d82] hover:text-black block disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Crear Cuenta'}
              </button>
            </motion.div>

          </motion.form>
          </>
          )}
        </motion.div>
      </div>

      {/* ------------------ DERECHA ------------------ */}
      <div className="hidden h-screen w-1/2 bg-[#70AA77] md:flex relative">
        <motion.div 
          className="hidden md:block pointer-events-none absolute bottom-0 right-0 w-full overflow-hidden"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="fixed top-[560px] -right-px text-[150px] font-bold text-gray-200 opacity-60 md:text-[145px] font-bebas tracking-[40px] leading-normal">
            B E F I T
          </span>
        </motion.div>

        {/* Elementos decorativos animados */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-20 h-20 bg-white opacity-10 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-white opacity-15 rounded-full"
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </motion.div>
  );
}