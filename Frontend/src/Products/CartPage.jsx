import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-red-500 transition-colors"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#E5E7EB"} className="h-4 w-4">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const ProductCard = ({ product, onAddToCart }) => {
  const productSlug = product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <motion.div 
      className="flex flex-col rounded-3xl bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-300 h-[440px] w-full border border-gray-100"
      variants={cardItemVariants} // Usará las variantes definidas abajo
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${productSlug}/${product.id}`} className="contents">
        <div className={`relative flex justify-center items-center h-72 rounded-2xl mb-4 overflow-hidden ${product.hasBg ? 'bg-[#EADBC8]' : 'bg-gray-50'}`}>
          {product.tag && (
            <div className="absolute top-0 left-0 bg-[#D99030] text-white text-[10px] font-bold px-2 py-3 rounded-tl-2xl rounded-br-lg leading-tight z-10">
              {product.tag}<br/>INFO
            </div>
          )}
          <motion.img 
            className="h-52 w-full object-contain mix-blend-multiply" 
            src={product.imageSrc || `https://placehold.co/300x400/EEE/31343C?text=${encodeURIComponent(product.title.split(' ')[0])}`} 
            alt={product.title}
            loading="lazy"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex flex-col flex-1">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 hover:text-[#334173] transition-colors min-h-[2.5rem]">
            {product.title}
          </h3>
          <p className="text-[11px] text-gray-400 mb-2 line-clamp-2 min-h-[2rem]">
            {product.description}
          </p>
          <div className="flex items-center mb-4">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < (product.rating || 0)} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            ${product.price?.toLocaleString() || '0'}
          </p>
          <p className="text-[10px] text-gray-400 uppercase mt-1">MXN</p>
        </div>
        <motion.button 
          onClick={handleAddToCart}
          className="bg-[#334173] hover:bg-[#253055] text-white text-xs font-semibold py-3 px-6 rounded-full shadow-md transition-colors"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          Agregar
        </motion.button>
      </div>
    </motion.div>
  );
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const emptyVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const summaryVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }
};


export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, allProducts, addToCart } = useOutletContext();
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 150; 
  const discount = 0;
  const total = subtotal + shipping - discount;

  const recommendations = allProducts
    .filter(p => !cartItems.find(item => item.id === p.id))
    .slice(0, 4);

  return (
    <motion.div 
      className="bg-[#FDFBF7] min-h-screen py-10 px-4 font-sans text-[#1e1e1e]"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: LISTA DE ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-extrabold mb-1">Tu Carrito</h1>
              <p className="text-gray-500 text-sm mb-6">{cartItems.length} productos</p>

              <AnimatePresence mode="wait">
                {cartItems.length === 0 ? (
                  <motion.div 
                    key="empty"
                    className="text-center py-10"
                    variants={emptyVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
                    <Link to="/Productos" className="text-blue-600 font-semibold hover:underline">Ir a la tienda</Link>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    className="space-y-8"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div 
                          key={item.id} 
                          className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-100 last:border-0"
                          variants={itemVariants}
                          layout
                          exit="exit"
                        >
                          {/* Imagen Placeholder */}
                          <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-300">
                            <span className="text-xs">IMG</span>
                          </div>

                          {/* Detalles */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <p className="font-bold text-xl">${item.price}</p>
                              </div>
                              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                              <p className="text-green-600 text-xs mt-2 font-medium">En stock • 15 unidades disponibles</p>
                            </div>

                            {/* Controles de Cantidad */}
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex items-center gap-3">
                                <motion.button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-[#2D3A96] text-white flex items-center justify-center hover:bg-[#1e2a7a] transition"
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <PlusIcon />
                                </motion.button>
                                <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                                <motion.button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-[#2D3A96] text-white flex items-center justify-center hover:bg-[#1e2a7a] transition"
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <MinusIcon />
                                </motion.button>
                              </div>
                              
                              {/* Boton Eliminar */}
                              <motion.button 
                                onClick={() => removeFromCart(item.id)} 
                                className="mb-1"
                                whileTap={{ scale: 0.8 }}
                              >
                                <TrashIcon />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
          <motion.div 
            className="lg:col-span-1"
            variants={summaryVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center font-extrabold text-xl mb-6 border-t border-gray-100 pt-4">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Input Cupon */}
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Código de Descuento" 
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2D3A96]"
                />
                <motion.button 
                  className="bg-[#5CA982] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#4a8c6b] transition"
                  whileTap={{ scale: 0.95 }}
                >
                  Aplicar
                </motion.button>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/CheckoutPage" className="text-center block w-full bg-[#2D3A96] text-white py-3 rounded-full font-bold hover:bg-[#1e2a7a] transition shadow-lg shadow-blue-900/20">
                    Proceder al pago
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/Productos" className="block w-full border border-[#2D3A96] text-[#2D3A96] py-3 rounded-full font-bold text-center hover:bg-blue-50 transition">
                    Continuar Comprando
                  </Link>
                </motion.div>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Pago 100% seguro
              </p>
            </div>
          </motion.div>

        </div>

        {/* --- SECCIÓN INFERIOR: COMPLEMENTA TU PEDIDO --- */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold mb-6">Complementa tu pedido</h2>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* --- INICIO DE LA MODIFICACION --- */}
            {recommendations.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
            {/* --- FIN DE LA MODIFICACION --- */}

            {recommendations.length === 0 && (
              <p className="text-gray-500 col-span-4 text-center">¡Ya tienes todo lo necesario!</p>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}