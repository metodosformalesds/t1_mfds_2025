import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#E5E7EB"} className="h-4 w-4">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, 
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, allProducts = [] } = useOutletContext();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("descripcion");
  const [selectedImage, setSelectedImage] = useState(0); 
  
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
  }, [id]);

  const product = allProducts.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <motion.div
        className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-2xl font-bold mb-2">Producto no encontrado</p>
        <Link to="/Productos" className="text-[#334173] underline">Volver a la tienda</Link>
      </motion.div>
    );
  }

  const sameCategory = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  const otherProducts = allProducts.filter(p => p.category !== product.category && p.id !== product.id);
  const recommendedProducts = [...sameCategory, ...otherProducts].slice(0, 4);

  const handleQuantity = (type) => {
    if (type === "inc") setQuantity(quantity + 1);
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#FFFDF5] py-12 font-sans text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-4 xl:px-32 max-w-screen-2xl">

        <motion.div
          className="bg-white rounded-[20px] shadow-lg p-8 md:p-12 flex flex-col lg:flex-row gap-12 mb-16 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >

          {/* Galeria - CONTENEDOR NUEVO PARA EL HOVER */}
          <motion.div
            className="w-full lg:w-1/2 flex gap-4 h-[450px]"
            onHoverEnd={() => setSelectedImage(0)}
          >
            <div className="flex flex-col gap-3 w-20 flex-shrink-0 overflow-y-auto no-scrollbar">
              {[...Array(4)].map((_, idx) => (
                <motion.button
                  key={idx}
                  onHoverStart={() => setSelectedImage(idx)}
                  className={`w-full aspect-square rounded-lg border overflow-hidden transition-all ${
                    selectedImage === idx ? "border-[#334173] border-2" : "border-gray-100 hover:border-gray-300"
                  }`}
                  whileHover={{ scale: 1.00 }}
                >
                  <img
                    src={`https://placehold.co/100x100?text=${product.title.split(' ')[0]} ${idx + 1}`}
                    alt={`Miniatura ${idx + 1} de ${product.title}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl p-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={`https://placehold.co/500x500?text=${product.title.split(' ')[0]} ${selectedImage + 1}`} // URL dinámica para la imagen principal
                  alt={product.title}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
          {/* FIN Galeria - CONTENEDOR NUEVO */}

          {/* Info */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-4xl font-bold text-[#111] mb-2 font-oswald uppercase tracking-tight">
              {product.title}
            </h1>
            <p className="text-3xl text-gray-600 font-light mb-4">${product.price}</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < product.rating} />
                ))}
              </div>
              <span className="text-xs text-gray-400 border-l border-gray-300 pl-2 ml-1">{product.reviewCount} Customer Reviews</span>
            </div>

            <p className="text-gray-500 text-xs leading-relaxed mb-8 text-justify">
              {product.description}. Diseñado específicamente para maximizar tu rendimiento en {product.activity} y ayudarte a alcanzar tu objetivo de {product.goal}.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center border border-gray-200 rounded-md h-12 w-32 justify-between px-3 bg-white">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantity("dec")} className="text-gray-400 hover:text-black text-lg font-medium">-</motion.button>
                <span className="font-semibold text-gray-800 text-sm">{quantity}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuantity("inc")} className="text-gray-400 hover:text-black text-lg font-medium">+</motion.button>
              </div>

              <motion.button
                onClick={handleAddToCart}
                className="bg-[#334173] hover:bg-[#253055] text-white font-bold py-3 px-10 rounded-lg shadow-lg transition-all active:scale-95 h-12 flex-1 md:flex-none text-sm uppercase tracking-wide"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
              >
                Add To Cart
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* --- TABS --- */}
        <motion.div
          className="flex flex-col items-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex gap-16 mb-8 w-full justify-center border-b border-gray-100">
            {['Descripcion', 'Reviews'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-4 text-lg font-bold transition-all relative ${
                  activeTab === tab.toLowerCase()
                    ? "text-black"
                    : "text-gray-300 hover:text-gray-500"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <motion.span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full"
                    layoutId="active-tab-underline"
                  />
                )}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="max-w-4xl text-center text-gray-400 text-xs leading-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "descripcion" ? (
                <p>
                  {product.description}. Este producto de la categoría <strong>{product.category}</strong> cumple con los más altos estándares de calidad.
                  <br/>
                  Perfecto para complementar tu rutina diaria. Recuerda mantener una dieta balanceada.
                </p>
              ) : (
                <p>No hay reseñas todavía. ¡Sé el primero en opinar sobre este producto!</p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* --- SECCION DE RECOMENDADOS --- */}
        {recommendedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-center font-bold text-gray-800 text-lg mb-10">Productos Recomendados</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {recommendedProducts.map((prod) => {
                const productSlug = prod.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return (
                  <motion.Link
                    key={prod.id}
                    to={`/${productSlug}/${prod.id}`}
                    className="block group"
                    variants={cardItemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="bg-[#F8F8F8] p-4 rounded-xl hover:shadow-md transition-all cursor-pointer h-full">
                      <div className="h-56 bg-white rounded-lg mb-4 flex items-center justify-center p-4 relative overflow-hidden">
                          <img
                            src={prod.imageSrc || `https://placehold.co/300x350?text=${prod.title.split(' ')[0]}`}
                            alt={prod.title}
                            className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                          />
                      </div>
                      <div className="px-1">
                        <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">{prod.title}</h4>
                        <p className="text-[10px] text-gray-400 mb-2 capitalize">{prod.category}</p>
                        <p className="font-bold text-gray-900 text-sm">${prod.price}</p>
                      </div>
                    </div>
                  </motion.Link>
                );
              })}
            </motion.div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default ProductDetail;