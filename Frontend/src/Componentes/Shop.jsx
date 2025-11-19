/*
 * Autor: Ricardo Rodriguez
 * Componente: MarketplaceView
 * Descripción: Componente principal de la tienda con Adaptador para Backend SQLAlchemy
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { searchProducts, getAvailableFilters } from '../utils/api';

// ==========================================
// 1. FUNCIÓN ADAPTADORA (Backend -> Frontend)
// ==========================================
const normalizeProduct = (backendProduct) => {
  // Intentamos sacar la URL de la primera imagen, si existe
  const mainImage = backendProduct.product_images && backendProduct.product_images.length > 0
    ? backendProduct.product_images[0].url // Asegúrate de que tu modelo ProductImage tenga campo 'url'
    : null;

  return {
    // Mapeo de identidad
    id: backendProduct.product_id,
    title: backendProduct.name,
    description: backendProduct.description,
    
    // Mapeo de valores numéricos
    price: Number(backendProduct.price),
    rating: backendProduct.average_rating ? Number(backendProduct.average_rating) : 0,
    reviewCount: backendProduct.reviews ? backendProduct.reviews.length : 0,
    
    // Mapeo de multimedia
    imageSrc: mainImage,
    
    // Lógica visual derivada (Front-end logic)
    // Ejemplo: Si hay poco stock, mostrar etiqueta de aviso
    tag: (backendProduct.stock > 0 && backendProduct.stock < 10) ? "¡ÚLTIMAS UNIDADES!" : null,
    hasBg: false, 
    
    // Mantener datos originales útiles
    stock: backendProduct.stock,
    is_active: backendProduct.is_active
  };
};

// ==========================================
// 2. CONFIGURACIÓN VISUAL (Animaciones e Iconos)
// ==========================================
const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const sidebarListVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#E5E7EB"} className="h-4 w-4">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

// ==========================================
// 3. COMPONENTES INTERNOS
// ==========================================

const Sidebar = ({ 
  currentFilters, 
  onFilterChange, 
  isMobileOpen, 
  onMobileClose,
  categories = [], 
  objectives = [], 
  activities = [] 
}) => {
  
  // Fallback visual mientras carga la API
  const displayCategories = categories.length > 0 ? categories : [{ label: "Cargando...", value: "" }];

  const filterSections = [
    { id: 'goal', title: "Objetivos", items: objectives },
    { id: 'activity', title: "Actividad física", items: activities }
  ];

  const handleItemClick = (type, value) => {
    if (!value) return;
    onFilterChange(type, value);
    if (isMobileOpen) onMobileClose();
  };

  const handleReset = () => {
    onFilterChange('reset', null);
    if (isMobileOpen) onMobileClose();
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onMobileClose}
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="exit"
          />
        )}
      </AnimatePresence>
      
      <aside className={`w-full max-w-xs sm:max-w-sm lg:w-64 flex-shrink-0 fixed lg:sticky top-0 left-0 h-screen lg:h-auto bg-white z-30 lg:translate-x-0 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="rounded-none lg:rounded-2xl shadow-xl lg:shadow-sm h-full flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 lg:p-6 pb-2 lg:pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <motion.button onClick={onMobileClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">✕</motion.button>
            </div>
            <motion.button onClick={handleReset} className="text-xs text-red-500 hover:underline w-full text-left font-medium" whileTap={{ scale: 0.98 }}>
              Limpiar filtros
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-2 lg:pt-0">
            {/* Sección Categorías */}
            <motion.div className="mb-6" variants={sidebarListVariants} initial="hidden" animate="visible">
              <h3 className="font-bold text-gray-900 text-lg mb-3 pb-2 border-b border-gray-200">Categorías</h3>
              <ul className="space-y-1">
                {displayCategories.map((item) => {
                  // Maneja tanto strings simples como objetos {label, value}
                  const val = item.value || item;
                  const lbl = item.label || item;
                  const isActive = currentFilters.category === val;
                  return (
                    <motion.li key={val} variants={sidebarItemVariants}>
                      <motion.button
                        onClick={() => handleItemClick('category', val)}
                        className={`w-full text-left text-sm transition-colors flex justify-between items-center py-2 px-3 rounded-lg capitalize ${isActive ? "text-blue-800 font-semibold bg-blue-50 border border-blue-200" : "text-gray-600 hover:text-blue-800 hover:bg-blue-50/50 border border-transparent"}`}
                      >
                        <span>{lbl}</span>
                        {isActive && <span className="text-blue-600 text-xs font-bold">✕</span>}
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Secciones Dinámicas */}
            {filterSections.map((section) => (
              <motion.div key={section.id} className="mb-6" variants={sidebarListVariants} initial="hidden" animate="visible">
                <h3 className="font-bold text-gray-900 text-lg mb-3 pb-2 border-b border-gray-200">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const val = item.value || item;
                    const lbl = item.label || item;
                    const isActive = currentFilters[section.id] === val;
                    return (
                      <motion.li key={val} variants={sidebarItemVariants}>
                        <motion.button
                          onClick={() => handleItemClick(section.id, val)}
                          className={`w-full text-left text-sm transition-colors flex justify-between items-center py-2 px-3 rounded-lg capitalize ${isActive ? "text-blue-800 font-semibold bg-blue-50 border border-blue-200" : "text-gray-600 hover:text-blue-800 hover:bg-blue-50/50 border border-transparent"}`}
                        >
                          <span>{lbl}</span>
                          {isActive && <span className="text-blue-600 text-xs font-bold">✕</span>}
                        </motion.button>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  // Nota: 'product' ya llega normalizado aquí
  const productSlug = product.title 
    ? product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    : 'producto';

  return (
    <motion.div 
      className="flex flex-col rounded-3xl bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-300 h-[440px] w-full border border-gray-100"
      variants={cardItemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Link to={`/${productSlug}/${product.id}`} className="contents">
        <div className={`relative flex justify-center items-center h-72 rounded-2xl mb-4 overflow-hidden ${product.hasBg ? 'bg-[#EADBC8]' : 'bg-gray-50'}`}>
          {product.tag && (
            <div className="absolute top-0 left-0 bg-[#D99030] text-white text-[10px] font-bold px-2 py-3 rounded-tl-2xl rounded-br-lg leading-tight z-10">
              {product.tag}
            </div>
          )}
          <motion.img 
            className="h-52 w-full object-contain mix-blend-multiply" 
            // Usa imageSrc del backend, o genera un placeholder si es null
            src={product.imageSrc || `https://placehold.co/300x400/EEE/31343C?text=${encodeURIComponent((product.title || 'Producto').split(' ')[0])}`} 
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
                <StarIcon key={i} filled={i < Math.round(product.rating)} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
          </div>
        </div>
      </Link>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-400 uppercase mt-1">MXN</p>
        </div>
        <motion.button 
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          className="bg-[#334173] hover:bg-[#253055] text-white text-xs font-semibold py-3 px-6 rounded-full shadow-md transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          Agregar
        </motion.button>
      </div>
    </motion.div>
  );
};

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <motion.div 
      className="mt-12 flex justify-center items-center space-x-2"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
    >
      <motion.button 
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        &lt; Anterior
      </motion.button>
      
      {getVisiblePages().map((num) => (
        <motion.button 
          key={num} onClick={() => setCurrentPage(num)}
          className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${currentPage === num ? "bg-[#469C7A] text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          {num}
        </motion.button>
      ))}
      
      <motion.button 
        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Siguiente &gt;
      </motion.button>
    </motion.div>
  );
};

// ==========================================
// 4. COMPONENTE PRINCIPAL (MarketplaceView)
// ==========================================
const MarketplaceView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { addToCart } = useOutletContext();

  // Estados de Datos
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [], fitness_objectives: [], physical_activities: []
  });

  const productsPerPage = 6;

  const currentFilters = useMemo(() => ({
    category: searchParams.get('category'),
    fitness_objective: searchParams.get('goal'),
    physical_activity: searchParams.get('activity')
  }), [searchParams]);

  // A. Cargar Filtros disponibles al montar
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getAvailableFilters();
        setAvailableFilters(data || { categories: [], fitness_objectives: [], physical_activities: [] });
      } catch (err) {
        console.warn('Error loading filters, using defaults', err);
      }
    };
    loadFilters();
  }, []);

  // B. Cargar Productos (con Adaptador)
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Preparar parámetros para el backend
        const params = {
          page: currentPage,
          limit: productsPerPage,
          is_active: true,
        };
        if (currentFilters.category) params.category = currentFilters.category;
        if (currentFilters.fitness_objective) params.fitness_objective = currentFilters.fitness_objective;
        if (currentFilters.physical_activity) params.physical_activity = currentFilters.physical_activity;
        
        const response = await searchProducts(params);
        
        // 2. NORMALIZAR DATOS (La magia ocurre aquí)
        const rawItems = response.items || [];
        const normalizedItems = rawItems.map(normalizeProduct);
        
        setProducts(normalizedItems);
        setTotalProducts(response.total || 0);
      } catch (err) {
        console.error(err);
        setError('Error al cargar productos. Por favor intenta de nuevo.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [currentPage, currentFilters]); // Dependencia unificada

  // Resetear página al filtrar
  useEffect(() => setCurrentPage(1), [currentFilters.category, currentFilters.fitness_objective, currentFilters.physical_activity]);

  // Helpers de renderizado
  const currentProducts = products; // Sin slice, ya viene paginado
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const pageTitle = currentFilters.category 
    ? currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1).replace(/-/g, ' ')
    : "Todos los Productos";

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'reset') {
      setSearchParams({});
    } else {
      newParams.get(key) === value ? newParams.delete(key) : newParams.set(key, value);
      setSearchParams(newParams);
    }
  };

  return (
    <motion.div className="min-h-screen bg-[#FFFDF5] py-8 font-sans text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="container mx-auto px-4 xl:px-20 max-w-screen-2xl">
        {/* Header */}
        <motion.div className="flex flex-col md:flex-row justify-between md:items-end mb-8 pb-6 border-b border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-full md:w-auto">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Tienda</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#334173] mb-2 capitalize">{pageTitle}</h1>
          </div>
          <div className="text-sm text-gray-500 mt-2 md:mt-0 w-full md:w-auto text-left md:text-right">
            Mostrando <strong>{products.length}</strong> de <strong>{totalProducts}</strong> resultado{totalProducts !== 1 ? 's' : ''}
          </div>
        </motion.div>

        <motion.button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden mb-6 w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm text-lg font-bold text-[#334173] border" whileTap={{ scale: 0.98 }}>
          <span>Filtros</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </motion.button>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar 
            currentFilters={currentFilters} 
            onFilterChange={handleFilterChange}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            categories={availableFilters.categories}
            objectives={availableFilters.fitness_objectives}
            activities={availableFilters.physical_activities}
          />

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[...Array(productsPerPage)].map((_, i) => <div key={i} className="h-[440px] bg-gray-100 rounded-3xl animate-pulse border border-gray-200" />)}
                </motion.div>
              ) : currentProducts.length > 0 ? (
                <motion.div key="content" variants={gridVariants} initial="hidden" animate="visible">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                  </div>
                  <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </motion.div>
              ) : (
                <motion.div key="no-results" className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-200" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-xl font-bold mb-2 text-gray-600">No encontramos coincidencias</p>
                  <motion.button onClick={() => setSearchParams({})} className="mt-4 px-6 py-3 bg-[#469C7A] text-white rounded-full text-sm font-bold hover:bg-[#3a8566] transition-colors shadow-sm">
                    Ver todos los productos
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceView;