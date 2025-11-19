import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { confirmSignUp, resendConfirmationCode } from '../utils/api';

export default function ConfirmAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener email de la navegación o del sessionStorage
  const [email, setEmail] = useState(
    location.state?.email || 
    sessionStorage.getItem('pendingConfirmEmail') || 
    ''
  );
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const handleConfirmCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }
    
    if (!confirmationCode || confirmationCode.length !== 6) {
      setError('Por favor ingresa un código válido de 6 dígitos');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await confirmSignUp(email, confirmationCode);
      
      setSuccess('¡Cuenta confirmada exitosamente!');
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('pendingConfirmEmail');
      sessionStorage.removeItem('tempUserEmail');
      sessionStorage.removeItem('tempUserPassword');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Código de verificación inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Por favor ingresa tu email primero');
      return;
    }
    
    setError('');
    setSuccess('');
    setResendLoading(true);
    
    try {
      await resendConfirmationCode(email);
      setSuccess('Código reenviado exitosamente. Revisa tu correo.');
    } catch (err) {
      setError(err.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen w-full font-sans bg-[#FFFCF2]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex w-full flex-col justify-center items-center p-8">
        <motion.div 
          className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Título */}
          <div className="mb-8 text-center">
            <motion.h1 
              className="font-bebas text-6xl font-bold tracking-[0.1em] text-black mb-4"
              whileHover={{ scale: 1.05 }}
            >
              CONFIRMA TU CUENTA
            </motion.h1>
            <p className="text-gray-600 text-sm">
              Ingresa el código de 6 dígitos enviado a tu correo
            </p>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <motion.div 
              className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleConfirmCode} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col">
              <label className="font-oswald mb-2 text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="border-2 border-gray-300 rounded-lg py-3 px-4 focus:border-[#3b4d82] focus:outline-none"
              />
            </div>

            {/* Código de Confirmación */}
            <div className="flex flex-col">
              <label className="font-oswald mb-2 text-sm font-semibold text-gray-600">
                Código de Confirmación
              </label>
              <input 
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg py-3 focus:border-[#3b4d82] focus:outline-none"
              />
            </div>

            {/* Botón Confirmar */}
            <motion.button
              type="submit"
              disabled={loading || confirmationCode.length !== 6}
              className="w-full bg-[#3b4d82] text-white py-3 rounded-lg font-semibold font-bebas tracking-[3px] text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#2d3a63]"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Confirmando...' : 'Confirmar Cuenta'}
            </motion.button>

            {/* Reenviar Código */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-[#3b4d82] hover:underline text-sm font-semibold disabled:opacity-50"
              >
                {resendLoading ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
              </button>
            </div>

            {/* Volver al Login */}
            <div className="text-center text-sm text-gray-600">
              ¿Ya confirmaste tu cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold text-[#5DA586] hover:underline"
              >
                Inicia Sesión
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
