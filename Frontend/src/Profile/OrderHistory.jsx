import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { getOrders } from '../utils/api';

// Icono de Lupa para la búsqueda
const SearchIcon = () => (
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
        className="text-gray-500"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Mock data detallado con toda la información necesaria
const MOCK_ORDERS = [
    {
        order_id: 1,
        order_code: "234-5F5F-OJF56F-0055-101",
        total_price: 543.0,
        created_at: "2025-10-12T10:30:00",
        status: "delivered",
        is_subscription: false,
        shipping_address: {
            address_name: "Casa",
            address_line1: "Av. Tecnológico 1400",
            address_line2: "Col. Residencial",
            city: "Monterrey",
            state: "Nuevo León",
            zip_code: "64849",
            recipient_name: "Juan Pérez",
            phone_number: "+52 81 1234 5678"
        },
        payment_method: {
            card_type: "Visa",
            last_four: "4242",
            card_holder_name: "Juan Pérez"
        },
        items: [
            {
                product_id: 1,
                product_name: "Proteína Whey Gold Standard",
                quantity: 1,
                unit_price: 450.0,
                subtotal: 450.0,
                image_url: null
            }
        ],
        subtotal: 450.0,
        shipping_cost: 93.0,
        discount: 0.0,
        coupon_code: null,
        total: 543.0
    },
    {
        order_id: 2,
        order_code: "234-5F5F-OJF96F-2039-101",
        total_price: 2577.2,
        created_at: "2025-10-12T14:20:00",
        status: "delivered",
        is_subscription: true,
        shipping_address: {
            address_name: "Oficina",
            address_line1: "Av. Constitución 2000",
            address_line2: "Piso 3, Oficina 302",
            city: "Monterrey",
            state: "Nuevo León",
            zip_code: "64000",
            recipient_name: "Juan Pérez",
            phone_number: "+52 81 1234 5678"
        },
        payment_method: {
            card_type: "MasterCard",
            last_four: "8888",
            card_holder_name: "Juan Pérez"
        },
        items: [
            {
                product_id: 1,
                product_name: "Proteína Whey Gold Standard",
                quantity: 3,
                unit_price: 450.0,
                subtotal: 1350.0,
                image_url: null
            },
            {
                product_id: 2,
                product_name: "Creatina Monohidratada",
                quantity: 2,
                unit_price: 350.0,
                subtotal: 700.0,
                image_url: null
            },
            {
                product_id: 3,
                product_name: "BCAA 5000 Powder",
                quantity: 1,
                unit_price: 380.0,
                subtotal: 380.0,
                image_url: null
            }
        ],
        subtotal: 2430.0,
        shipping_cost: 0.0,
        discount: 243.0,
        coupon_code: "FIRST10",
        total: 2187.0
    },
    {
        order_id: 3,
        order_code: "234-5F5F-OJF94F-0055-101",
        total_price: 543.0,
        created_at: "2025-09-15T09:15:00",
        status: "delivered",
        is_subscription: false,
        shipping_address: {
            address_name: "Casa",
            address_line1: "Av. Tecnológico 1400",
            address_line2: "Col. Residencial",
            city: "Monterrey",
            state: "Nuevo León",
            zip_code: "64849",
            recipient_name: "Juan Pérez",
            phone_number: "+52 81 1234 5678"
        },
        payment_method: {
            card_type: "Visa",
            last_four: "4242",
            card_holder_name: "Juan Pérez"
        },
        items: [
            {
                product_id: 1,
                product_name: "Proteína Whey Gold Standard",
                quantity: 1,
                unit_price: 450.0,
                subtotal: 450.0,
                image_url: null
            }
        ],
        subtotal: 450.0,
        shipping_cost: 93.0,
        discount: 0.0,
        coupon_code: null,
        total: 543.0
    },
    {
        order_id: 4,
        order_code: "234-5F5F-OJF94F-0055-102",
        total_price: 780.0,
        created_at: "2025-08-22T16:45:00",
        status: "delivered",
        is_subscription: false,
        shipping_address: {
            address_name: "Casa",
            address_line1: "Av. Tecnológico 1400",
            address_line2: "Col. Residencial",
            city: "Monterrey",
            state: "Nuevo León",
            zip_code: "64849",
            recipient_name: "Juan Pérez",
            phone_number: "+52 81 1234 5678"
        },
        payment_method: {
            card_type: "American Express",
            last_four: "1005",
            card_holder_name: "Juan Pérez"
        },
        items: [
            {
                product_id: 4,
                product_name: "Pre-Entreno C4 Original",
                quantity: 2,
                unit_price: 320.0,
                subtotal: 640.0,
                image_url: null
            }
        ],
        subtotal: 640.0,
        shipping_cost: 140.0,
        discount: 0.0,
        coupon_code: null,
        total: 780.0
    }
];

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [maxPrice, setMaxPrice] = useState(10000);
    const [filters, setFilters] = useState({
        period: "all",
        showCommon: true,
        showSubscription: true,
        priceRange: [0, 10000]
    });

    // Cargar órdenes al montar el componente
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Descomentar cuando el backend esté listo
            // const response = await getOrders(100, 0);
            // setOrders(response.orders || []);

            // Mock data para desarrollo
            await new Promise(resolve => setTimeout(resolve, 800));
            const loadedOrders = MOCK_ORDERS;
            setOrders(loadedOrders);

            // Calcular precio máximo del historial
            const maxOrderPrice = Math.max(...loadedOrders.map(order => order.total_price));
            const roundedMax = Math.ceil(maxOrderPrice / 100) * 100; // Redondear hacia arriba a centenas
            setMaxPrice(roundedMax);
            setFilters(prev => ({
                ...prev,
                priceRange: [0, roundedMax]
            }));
        } catch (err) {
            console.error("Error al cargar órdenes:", err);
            setError(err.message || "Error al cargar el historial de pedidos");
        } finally {
            setLoading(false);
        }
    };

    // Función para expandir/colapsar detalles de orden
    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    // Función para filtrar órdenes por búsqueda de productos
    const filteredOrders = orders.filter(order => {
        // Filtro por búsqueda de productos
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const hasMatchingProduct = order.items.some(item => 
                item.product_name.toLowerCase().includes(query)
            );
            if (!hasMatchingProduct) return false;
        }

        // Filtro por tipo de compra
        if (!filters.showCommon && !order.is_subscription) return false;
        if (!filters.showSubscription && order.is_subscription) return false;

        // Filtro por período de fecha
        if (filters.period !== "all") {
            const orderDate = new Date(order.created_at);
            const now = new Date();
            
            if (filters.period === "30days") {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(now.getDate() - 30);
                if (orderDate < thirtyDaysAgo) return false;
            } else if (filters.period === "2025") {
                if (orderDate.getFullYear() !== 2025) return false;
            } else if (filters.period === "2024") {
                if (orderDate.getFullYear() !== 2024) return false;
            }
        }

        // Filtro por rango de precio
        if (order.total_price < filters.priceRange[0] || order.total_price > filters.priceRange[1]) {
            return false;
        }

        return true;
    });

    // Función para formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    // Función para actualizar el rango de precios
    const handlePriceRangeChange = (index, value) => {
        const newRange = [...filters.priceRange];
        newRange[index] = parseInt(value);
        
        // Asegurar que min no sea mayor que max y viceversa
        if (index === 0 && newRange[0] > newRange[1]) {
            newRange[0] = newRange[1];
        }
        if (index === 1 && newRange[1] < newRange[0]) {
            newRange[1] = newRange[0];
        }
        
        setFilters({...filters, priceRange: newRange});
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3A96] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando historial de pedidos...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <p className="text-lg text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={loadOrders}
                        className="bg-[#2D3A96] text-white px-6 py-2 rounded-lg hover:bg-[#1e2a7a] transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FDFBF7] min-h-screen py-10 px-4 font-sans text-[#1e1e1e]">
            <div className="max-w-7xl mx-auto">
                {/* Layout Principal: Grid de 2 columnas (3/4 para lista, 1/4 para filtros) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* --- COLUMNA IZQUIERDA: BÚSQUEDA Y LISTA --- */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Barra de Búsqueda Superior */}
                        <div className="bg-gray-200 rounded-full px-4 py-2 flex items-center shadow-inner max-w-md mb-8 border border-gray-300">
                            <input
                                type="text"
                                placeholder="Buscar por producto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:outline-none flex-1 text-gray-700 placeholder-gray-500"
                            />
                            <button className="hover:bg-gray-300 p-1 rounded-full transition">
                                <SearchIcon />
                            </button>
                        </div>

                        {/* Lista de Tarjetas de Pedidos */}
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No se encontraron pedidos</p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-4 text-[#2D3A96] hover:underline"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredOrders.map((order) => {
                                    const isExpanded = expandedOrderId === order.order_id;
                                    return (
                                        <div
                                            key={order.order_id}
                                            className="bg-[#E5E7EB] rounded-xl overflow-hidden shadow-sm border border-gray-300"
                                        >
                                            {/* Header de la Tarjeta */}
                                            <div className="bg-[#D1D5DB] px-6 py-3 flex flex-wrap justify-between items-center gap-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-600 uppercase">
                                                        ID PEDIDO
                                                    </p>
                                                    <p className="text-xs font-mono text-gray-800">
                                                        {order.order_code}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-600 uppercase">
                                                        TOTAL
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        ${order.total_price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => toggleOrderDetails(order.order_id)}
                                                    className="bg-[#2D3A96] hover:bg-[#1e2a7a] text-white text-xs font-bold py-2 px-6 rounded-full transition shadow-md"
                                                >
                                                    {isExpanded ? "OCULTAR DETALLES" : "VER DETALLES"}
                                                </button>
                                            </div>

                                            {/* Cuerpo de la Tarjeta */}
                                            <div className="p-6 flex flex-col sm:flex-row gap-6 items-start relative">
                                                {/* Placeholder de Imagen */}
                                                <div className="w-24 h-24 bg-[#A8C69F] rounded-xl flex-shrink-0 shadow-inner"></div>

                                                {/* Detalles del Pedido */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-800">
                                                                ENTREGADO:{" "}
                                                                <span className="font-normal">{formatDate(order.created_at)}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-3">
                                                                Entregado sin complicaciones
                                                            </p>

                                                            <ul className="list-disc list-inside text-sm text-gray-800 font-medium space-y-1">
                                                                {order.items.map((item) => (
                                                                    <li key={item.product_id}>
                                                                        {item.product_name} {item.quantity > 1 && `(x${item.quantity})`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Botón Escribir Opinión */}
                                                        <button  
                                                            onClick={() => navigate(`/reviews/${order.order_id}`)}
                                                            className="bg-[#A8C69F] hover:bg-[#94b38b] text-white text-xs font-bold py-2 px-4 rounded-md transition shadow-sm mt-2 sm:mt-0"
                                                        >
                                                            ESCRIBIR OPINIÓN
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Etiqueta Tipo de Compra */}
                                                <div className="absolute bottom-4 right-6 text-xs">
                                                    <span className="text-gray-500">Compra </span>
                                                    <span className="font-bold text-[#5CA982]">
                                                        {order.is_subscription ? "Suscripción" : "Común"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Detalles Expandidos */}
                                            {isExpanded && (
                                                <div className="bg-white border-t border-gray-300 p-6 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Dirección de Envío */}
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                                                                Dirección de Envío
                                                            </h4>
                                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-1">
                                                                <p className="font-semibold">{order.shipping_address.address_name}</p>
                                                                <p>{order.shipping_address.address_line1}</p>
                                                                {order.shipping_address.address_line2 && (
                                                                    <p>{order.shipping_address.address_line2}</p>
                                                                )}
                                                                <p>
                                                                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                                                                </p>
                                                                <p className="pt-2 border-t border-gray-200 mt-2">
                                                                    <span className="font-medium">Destinatario:</span> {order.shipping_address.recipient_name}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">Teléfono:</span> {order.shipping_address.phone_number}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Método de Pago */}
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                                                                Método de Pago
                                                            </h4>
                                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                                                                <p className="font-semibold mb-2">{order.payment_method.card_type}</p>
                                                                <p>**** **** **** {order.payment_method.last_four}</p>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {order.payment_method.card_holder_name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Desglose de Productos */}
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                                                            Desglose de Productos
                                                        </h4>
                                                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-200">
                                                                    <tr>
                                                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Producto</th>
                                                                        <th className="text-center py-2 px-4 font-semibold text-gray-700">Cantidad</th>
                                                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Precio Unit.</th>
                                                                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200">
                                                                    {order.items.map((item, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-100">
                                                                            <td className="py-3 px-4 text-gray-800">{item.product_name}</td>
                                                                            <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                                                            <td className="py-3 px-4 text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                                                                            <td className="py-3 px-4 text-right font-semibold text-gray-800">${item.subtotal.toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* Resumen de Pago */}
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                                                            Resumen de Pago
                                                        </h4>
                                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Subtotal:</span>
                                                                <span className="font-medium text-gray-800">${order.subtotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Envío:</span>
                                                                <span className="font-medium text-gray-800">
                                                                    {order.shipping_cost === 0 ? "GRATIS" : `$${order.shipping_cost.toFixed(2)}`}
                                                                </span>
                                                            </div>
                                                            {order.discount > 0 && (
                                                                <div className="flex justify-between text-green-600">
                                                                    <span>Descuento {order.coupon_code && `(${order.coupon_code})`}:</span>
                                                                    <span className="font-medium">-${order.discount.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-base">
                                                                <span className="font-bold text-gray-800">TOTAL:</span>
                                                                <span className="font-bold text-[#2D3A96] text-lg">${order.total.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* --- COLUMNA DERECHA: SIDEBAR DE FILTROS --- */}
                    <div className="lg:col-span-1 lg:self-start">
                        <div className="bg-[#E5E7EB] p-6 rounded-lg border border-gray-300 sticky top-24">
                            <h3 className="font-extrabold text-gray-800 mb-4">
                                Filtros de Búsqueda
                            </h3>

                            {/* Divisor Punteado */}
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                            {/* Filtro Periodo */}
                            <div className="mb-6">
                                <label className="block font-bold text-gray-700 mb-2 text-sm">
                                    Periodo
                                </label>
                                <p className="text-xs text-gray-500 mb-2">Meses</p>
                                <select 
                                    value={filters.period}
                                    onChange={(e) => setFilters({...filters, period: e.target.value})}
                                    className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2D3A96]"
                                >
                                    <option value="all">Todos</option>
                                    <option value="30days">Últimos 30 días</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>

                            {/* Divisor Punteado */}
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                            {/* Filtro Compra */}
                            <div className="mb-6">
                                <label className="block font-bold text-gray-700 mb-3 text-sm">
                                    Compra...
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="accent-[#5CA982] w-4 h-4 rounded"
                                            checked={filters.showCommon}
                                            onChange={(e) => setFilters({...filters, showCommon: e.target.checked})}
                                        />
                                        <span className="text-sm text-gray-600">Común</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="accent-[#5CA982] w-4 h-4 rounded"
                                            checked={filters.showSubscription}
                                            onChange={(e) => setFilters({...filters, showSubscription: e.target.checked})}
                                        />
                                        <span className="text-sm text-gray-600">Suscripción</span>
                                    </label>
                                </div>
                            </div>

                            {/* Divisor Punteado */}
                            <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

                            {/* Filtro Rango de Precio */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2 text-sm">
                                    Rango de Precio
                                </label>
                                <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                                    <span>${filters.priceRange[0].toLocaleString()}</span>
                                    <span>${filters.priceRange[1].toLocaleString()}</span>
                                </div>
                                
                                {/* Slider de Rango con Inputs Nativos */}
                                <div className="relative pt-2 pb-6">
                                    {/* Track de fondo */}
                                    <div className="absolute top-2 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
                                    
                                    {/* Track activo (entre los dos valores) */}
                                    <div 
                                        className="absolute top-2 h-2 bg-[#5CA982] rounded-full"
                                        style={{
                                            left: `${(filters.priceRange[0] / maxPrice) * 100}%`,
                                            right: `${100 - (filters.priceRange[1] / maxPrice) * 100}%`
                                        }}
                                    ></div>
                                    
                                    {/* Input para valor mínimo */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxPrice}
                                        step="50"
                                        value={filters.priceRange[0]}
                                        onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                                        className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5CA982] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#5CA982] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                                    />
                                    
                                    {/* Input para valor máximo */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={maxPrice}
                                        step="50"
                                        value={filters.priceRange[1]}
                                        onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                                        className="absolute top-0 left-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5CA982] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#5CA982] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                                    />
                                </div>
                            </div>

                            {/* Divisor Punteado Final */}
                            <div className="border-t-2 border-dashed border-gray-400 mt-8"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
