import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';

// --- 1. ICONOS SVG ---
const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "#E5E7EB"} className="h-4 w-4">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

// --- 2. SIDEBAR DE FILTROS (VERSIÓN RESPONSIVA MEJORADA) ---
const Sidebar = ({ currentFilters, onFilterChange, isMobileOpen, onMobileClose }) => {
  const categoryItems = [
    { label: "Proteínas", value: "proteinas" },
    { label: "Pre-Entreno", value: "pre-entreno" },
    { label: "Post-Entreno", value: "post-entreno" },
    { label: "Vitaminas", value: "vitaminas" },
    { label: "Aminoácidos", value: "aminoacidos" },
    { label: "Quemadores", value: "quemadores" },
    { label: "Creatinas", value: "creatinas" }
  ];

  const otherSections = [
    {
      id: 'goal',
      title: "Objetivos",
      items: [
        { label: "Ganas músculo", value: "muscle" },
        { label: "Perder peso", value: "weight_loss" },
        { label: "Aumentar energía", value: "energy" },
        { label: "Mejorar rendimiento", value: "performance" },
        { label: "Recuperación", value: "recovery" },
        { label: "Salud general", value: "health" }
      ]
    },
    {
      id: 'activity',
      title: "Actividad física",
      items: [
        { label: "Gimnasio", value: "gym" },
        { label: "CrossFit", value: "crossfit" },
        { label: "Running", value: "running" },
        { label: "Ciclismo", value: "cycling" },
        { label: "Natación", value: "swimming" },
        { label: "Deportes de equipo", value: "team_sports" }
      ]
    }
  ];

  /**
   * Función centralizada para manejar clics en filtros.
   * Llama a `onFilterChange` y luego cierra el menú si está en móvil.
   */
  const handleItemClick = (type, value) => {
    onFilterChange(type, value);
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      
      {/* Contenedor del Sidebar */}
      <aside className={`
        w-full max-w-xs sm:max-w-sm lg:w-64 flex-shrink-0
        fixed lg:sticky top-0 left-0 h-screen lg:h-auto
        transform transition-transform duration-300 ease-in-out z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white
      `}>
        <div className="rounded-none lg:rounded-2xl shadow-xl lg:shadow-sm h-full flex flex-col">
          
          {/* Header Fijo (con botón de cerrar en móvil) */}
          <div className="flex-shrink-0 p-4 lg:p-6 pb-2 lg:pb-4">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button 
                onClick={onMobileClose}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
            </div>

            <button 
              onClick={() => handleItemClick('reset', null)}
              className="text-xs text-red-500 hover:underline w-full text-left font-medium"
            >
              Limpiar filtros
            </button>
          </div>

          {/* Contenido Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-2 lg:pt-0">
            <div className="mt-0">
              <h3 className="font-bold text-gray-900 text-lg mb-3 pb-1 border-b border-gray-200">Categorías</h3>
              <ul className="space-y-1">
                {categoryItems.map((item) => {
                  const isActive = currentFilters.category === item.value;
                  return (
                    <li key={item.value}>
                      <button
                        type="button"
                        onClick={() => handleItemClick('category', item.value)}
                        className={`w-full text-left text-sm transition-colors flex justify-between items-center py-1 px-2 rounded
                          ${isActive ? "text-blue-800 font-bold bg-blue-50" : "text-gray-600 hover:text-blue-800 hover:bg-blue-50/50"}
                        `}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="text-blue-600 text-xs">✕</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {otherSections.map((section) => (
              <div key={section.id} className="mt-6">
                <h3 className="font-bold text-gray-900 text-lg mb-3 pb-1 border-b border-gray-200">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = currentFilters[section.id] === item.value;
                    return (
                      <li key={item.value}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(section.id, item.value)}
                          className={`w-full text-left text-sm transition-colors flex justify-between items-center py-1 px-2 rounded
                            ${isActive ? "text-blue-800 font-bold bg-blue-50" : "text-gray-600 hover:text-blue-800 hover:bg-blue-50/50"}
                          `}
                        >
                          <span>{item.label}</span>
                          {isActive && <span className="text-blue-600 text-xs">✕</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};


// --- 3. PRODUCT CARD ---
const ProductCard = ({ product, onAddToCart }) => {
  // Genera URL amigable
  const productSlug = product.title.replace(/\s+/g, '-');

  return (
    <div className="flex flex-col rounded-3xl bg-white p-5 shadow-sm hover:shadow-xl transition-shadow duration-300 h-[440px] w-full">
      
      {/* Envolvemos con el LINK usando el nombre y el ID */}
      <Link to={`/${productSlug}/${product.id}`} className="contents">
          
          <div className={`relative flex justify-center items-center h-72 rounded-2xl mb-4 ${product.hasBg ? 'bg-[#EADBC8]' : 'bg-gray-50'}`}>
            {product.tag && (
              <div className="absolute top-0 left-0 bg-[#D99030] text-white text-[10px] font-bold px-2 py-3 rounded-tl-2xl rounded-br-lg leading-tight z-10">
                  {product.tag}<br/>INFO
              </div>
            )}
            <img className="h-52 w-full object-contain mix-blend-multiply" src={product.imageSrc || `https://placehold.co/300x400/png?text=${product.title.split(' ')[0]}`} alt={product.title} />
          </div>
          
          <div className="flex flex-col flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1 truncate hover:text-[#334173] transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] text-gray-400 mb-2 truncate">{product.description}</p>
            <div className="flex items-center mb-4">
              <div className="flex space-x-0.5">
                {[...Array(5)].map((_, i) => (<StarIcon key={i} filled={i < product.rating} />))}
              </div>
              <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
            </div>
          </div>

      </Link>

      {/* Botón fuera del link */}
      <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 leading-none">${product.price}</p>
            <p className="text-[10px] text-gray-400 uppercase mt-1">MXN</p>
          </div>
          <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
              }} 
              className="bg-[#334173] hover:bg-[#253055] text-white text-xs font-semibold py-2 px-6 rounded-full shadow-md transition-colors active:scale-95"
          >
            Agregar
          </button>
        </div>

    </div>
  );
};

// --- 4. PAGINACIÓN ---
const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-12 flex justify-center items-center space-x-2">
      <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} className="px-4 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled={currentPage === 1}>&lt; Anterior</button>
      {pages.map((num) => (
        <button key={num} onClick={() => setCurrentPage(num)} className={`h-8 w-8 flex items-center justify-center rounded text-xs font-bold transition ${currentPage === num ? "bg-[#469C7A] text-white shadow-sm" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
          {num}
        </button>
      ))}
      <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} className="px-4 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled={currentPage === totalPages}>Siguiente &gt;</button>
    </div>
  );
};

// --- 5. COMPONENTE PRINCIPAL ---
const MarketplaceView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  
  // --- MODIFICACIÓN: Estado para sidebar móvil ---
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { addToCart, allProducts } = useOutletContext();

  // --- FILTROS ---
  const currentFilters = useMemo(() => ({
    category: searchParams.get('category'),
    goal: searchParams.get('goal'),
    activity: searchParams.get('activity')
  }), [searchParams]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (currentFilters.category && product.category !== currentFilters.category) return false;
      if (currentFilters.goal && product.goal !== currentFilters.goal) return false;
      if (currentFilters.activity && product.activity !== currentFilters.activity) return false;
      return true;
    });
  }, [currentFilters, allProducts]);

  useEffect(() => { setCurrentPage(1); }, [currentFilters]);

  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === 'reset') {
        setSearchParams({});
        return;
    }
    if (newParams.get(key) === value) {
        newParams.delete(key);
    } else {
        newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const pageTitle = currentFilters.category 
    ? currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1).replace('-', ' ')
    : "Todos los Productos";

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-10 font-sans text-gray-800">
      <div className="container mx-auto px-4 xl:px-20 max-w-screen-2xl">
        
        {/* --- MODIFICACIÓN: Header de página responsivo --- */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 pb-4 border-b border-gray-200">
            <div className="w-full md:w-auto">
              <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">Tienda</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#334173]">{pageTitle}</h1>
            </div>
            <div className="text-sm text-gray-500 mt-2 md:mt-0 w-full md:w-auto text-left md:text-right">
              Mostrando <strong>{filteredProducts.length}</strong> resultados
            </div>
        </div>

        {/* --- MODIFICACIÓN: Botón de filtros móvil --- */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden mb-6 w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm text-lg font-bold text-[#334173]"
          aria-label="Mostrar filtros"
        >
          <span>Filtros</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>


        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- MODIFICACIÓN: Props pasadas al Sidebar --- */}
          <Sidebar 
            currentFilters={currentFilters} 
            onFilterChange={handleFilterChange}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />

          <main className="flex-1">
            {filteredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                    </div>
                    <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm">
                    <p className="text-xl font-bold mb-2">No encontramos coincidencias</p>
                    <button onClick={() => setSearchParams({})} className="mt-6 px-6 py-2 bg-[#469C7A] text-white rounded-full text-sm font-bold hover:bg-[#3a8566] transition">
                        Ver todo
                    </button>
                </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default MarketplaceView;