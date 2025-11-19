{
/*
 * Autor: Diego Jasso
 * Componente: AdminSidebar
 * Descripción: Barra lateral de navegación flotante para el panel de administración. Se expande al pasar el mouse (hover) y dirige a las diferentes vistas de gestión (Dashboard, Productos), manteniendo el estado activo.
 */
}
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Iconos SVG ---
const StoreIcon = () => (
    <svg className='size-6' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1713_1556)">
        <path d="M3 21H21" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 7V8C3 8.79565 3.31607 9.55871 3.87868 10.1213C4.44129 10.6839 5.20435 11 6 11C6.79565 11 7.55871 10.6839 8.12132 10.1213C8.68393 9.55871 9 8.79565 9 8M3 7H21M3 7L5 3H19L21 7M9 8V7M9 8C9 8.79565 9.31607 9.55871 9.87868 10.1213C10.4413 10.6839 11.2044 11 12 11C12.7956 11 13.5587 10.6839 14.1213 10.1213C14.6839 9.55871 15 8.79565 15 8M15 8V7M15 8C15 8.79565 15.3161 9.55871 15.8787 10.1213C16.4413 10.6839 17.2044 11 18 11C18.7956 11 19.5587 10.6839 20.1213 10.1213C20.6839 9.55871 21 8.79565 21 8V7" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 21V10.85" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 21V10.85" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V17C9 16.4696 9.21071 15.9609 9.58579 15.5858C9.96086 15.2107 10.4696 15 11 15H13C13.5304 15 14.0391 15.2107 14.4142 15.5858C14.7893 15.9609 15 16.4696 15 17V21" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
        <clipPath id="clip0_1713_1556">
        <rect className='size-7' fill="white"/>
        </clipPath>
    </defs>
    </svg>
);

const ChartBarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
    </svg>
);

const HomeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
    </svg>
);

// --- Componente Reutilizable para cada Item ---
const SidebarItem = ({ icon, text, active, isExpanded, onClick }) => {
    const activeClasses = 'bg-[#69AEA2] text-gray-800';
    const inactiveClasses = 'bg-white shadow-sm text-gray-800 hover:bg-gray-100';

    return (
        <li>
            <button
                onClick={onClick}
                className={`
          w-full flex items-center p-3 rounded-xl transition-all duration-300
          font-semibold
          ${active ? activeClasses : inactiveClasses}
          ${isExpanded ? 'justify-start' : 'justify-center'}
        `}
            >
                <span className={`flex-shrink-0 size-6 ${!isExpanded ? '' : ''}`}>{icon}</span>
                <span
                    className={`
            ml-4 whitespace-nowrap overflow-hidden transition-all duration-200
            ${isExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 absolute'}
          `}
                >
                    {text}
                </span>
            </button>
        </li>
    );
};

// --- Componente Principal de la Sidebar ---
const FloatingSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { text: 'Dashboard', icon: <ChartBarIcon />, path: '/admin/dashboard' },
        { text: 'Productos', icon: <StoreIcon />, path: '/admin/products' },
    ];

    return (
        <aside
            className={`
        fixed top-0 left-0 h-screen z-50
        p-4 pt-8
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
            style={{ backgroundColor: '#B8D2B1' }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <nav className="flex flex-col h-full">
                <ul className="space-y-4">
                    {navItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            active={location.pathname === item.path}
                            isExpanded={isExpanded}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </ul>
                <div className="mt-auto pb-4">
                    <SidebarItem
                        icon={<HomeIcon />}
                        text="Volver al inicio"
                        active={false}
                        isExpanded={isExpanded}
                        onClick={() => navigate('/')}
                    />
                </div>
            </nav>
        </aside>
    );
};

export default FloatingSidebar;