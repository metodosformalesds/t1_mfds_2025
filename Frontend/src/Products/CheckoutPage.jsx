import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemFadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 }
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0.8 },
};


export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, allProducts, clearCart } = useOutletContext();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !showSuccessModal) {
      navigate('/Home');
    }
  }, [cartItems, navigate, showSuccessModal]);


  const defaultAddress = {
    name: "Nombre Apellido",
    street: "Calle Ejemplo 1234, Fraccionamiento tal",
    city: "Ciudad tal, Estado tal, País",
    zip: "CP 12345",
    phone: "Tel. 000 123 4567"
  };

  const defaultCard = {
    type: "VISA",
    lastFour: "4532",
    expiry: "10/2029"
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 150; 
  const discount = 0; 
  const total = subtotal + shipping - discount;


  const handleCompleteOrder = () => {
    setShowSuccessModal(true);
    
    clearCart(); 
    
  };

  const closeAndNavigate = () => {
    navigate('/Home'); 
    setShowSuccessModal(false);
  };

  if (cartItems.length === 0 && !showSuccessModal) {
    return (
      <div className="bg-[#FDFBF7] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Tu carrito está vacío. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 font-sans text-[#1e1e1e] overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: DETALLES DEL CHECKOUT */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemFadeInUp} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <motion.button 
                  onClick={() => navigate(-1)} 
                  aria-label="Volver atrás" 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <BackArrowIcon />
                </motion.button>
                <h1 className="text-2xl font-extrabold">Checkout</h1>
              </div>
              <hr className="border-gray-100 mb-6" />

              {/* Seccion: Direccion de envio */}
              <motion.div variants={itemFadeInUp}>
                <h2 className="text-xl font-bold mb-4">Dirección de envío</h2>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                  <p className="font-bold text-lg mb-2">Casa</p>
                  <p className="text-gray-700 text-sm">{defaultAddress.street}</p>
                  <p className="text-gray-700 text-sm">{defaultAddress.city}</p>
                  <p className="text-gray-700 text-sm">{defaultAddress.zip}</p>
                  <div className="flex justify-between items-center mt-3 text-sm">
                    <p className="text-gray-700">{defaultAddress.name}</p>
                    <p className="text-gray-700">{defaultAddress.phone}</p>
                  </div>
                </div>
                <motion.div whileHover={{ x: 2 }} className="inline-block">
                  <Link to="/addresses" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 mb-10">
                    Seleccionar otra dirección 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Seccion: Metodo de pago */}
              <motion.div variants={itemFadeInUp}>
                <h2 className="text-xl font-bold mb-4">Método de pago</h2>
                
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-4">
                  <p className="font-bold text-lg mb-3">Tarjeta principal</p>
                  <div className="flex items-center gap-4">
                    <svg width="40" height="25" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="60" rx="8" fill="#1A1F71"/>
                      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">VISA</text>
                    </svg>
                    <div>
                      <p className="font-semibold text-lg">**** **** **** {defaultCard.lastFour}</p>
                      <p className="text-gray-500 text-sm">Vence {defaultCard.expiry}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                  <p className="font-bold text-lg mb-3">PayPal</p>
                  <div className="flex items-center gap-4">
                    <svg width="40" height="25" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="60" rx="8" fill="#003087"/>
                      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#009CDE" fontSize="20" fontWeight="bold" fontFamily="Arial">PayPal</text>
                    </svg>
                    <p className="font-semibold text-lg text-gray-700">Pagar con PayPal</p>
                  </div>
                </div>

                <motion.div whileHover={{ x: 2 }} className="inline-block">
                  <Link to="/payment-methods" className="text-blue-600 font-semibold hover:underline flex items-center gap-1 mb-10">
                    Seleccionar otro método de pago
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Boton Completar Orden */}
              <motion.button
                variants={itemFadeInUp}
                onClick={handleCompleteOrder}
                className="w-full bg-[#2D3A96] text-white py-3 rounded-full font-bold hover:bg-[#1e2a7a] transition shadow-lg shadow-blue-900/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Completar orden
              </motion.button>
            </motion.div>
          </motion.div>

          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
          <motion.div 
            className="lg:col-span-1 lg:self-start"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Resumen del Pedido</h2>
                <motion.div whileHover={{ x: 2 }}>
                  <Link to="/CartPage" className="text-blue-600 text-sm hover:underline">Editar</Link>
                </motion.div>
              </div>
              
              <motion.div 
                className="space-y-4 mb-6 border-b border-gray-100 pb-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {cartItems.map((item) => (
                  <motion.div key={item.id} className="flex items-center gap-3" variants={itemFadeInUp}>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">
                      IMG
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.quantity} x ${item.price}</p>
                    </div>
                    <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-extrabold text-xl border-t border-gray-100 pt-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Modal de exito --- */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeAndNavigate}></div>
            
            {/* Contenido del Modal */}
            <motion.div 
              className="relative z-10 bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full"
              variants={modalContentVariants}
            >
              {/* Icono de éxito (SVG) */}
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 className="text-2xl font-bold mb-2">¡Orden Completada!</h2>
              <p className="text-gray-600 mb-6">Tu pedido ha sido procesado exitosamente.</p>
              <motion.button
                onClick={closeAndNavigate}
                className="w-full bg-[#5CA982] text-white py-2 px-4 rounded-full font-bold hover:bg-[#4a8c6b] transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Genial, volver al inicio
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}