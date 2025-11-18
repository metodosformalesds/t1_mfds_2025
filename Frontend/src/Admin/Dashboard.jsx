{
/*
 * Autor: Diego Jasso
 * Componente: Dashboard
 * Descripción: Panel principal de administración. Muestra estadísticas clave (ventas, ingresos, usuarios) y reportes en gráficos (recharts) y tablas. Se conecta a múltiples endpoints de la API para obtener datos en tiempo real.
 */
}
import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { getDashboardStats, getSalesReport, getProductsReport } from '../utils/api';

// --- Iconos SVG ---
const UsersIcon = () => (
    <svg className="size-10 text-white" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_453_378)">
        <path d="M6.25 8.75C6.25 10.0761 6.77678 11.3479 7.71447 12.2855C8.65215 13.2232 9.92392 13.75 11.25 13.75C12.5761 13.75 13.8479 13.2232 14.7855 12.2855C15.7232 11.3479 16.25 10.0761 16.25 8.75C16.25 7.42392 15.7232 6.15215 14.7855 5.21447C13.8479 4.27678 12.5761 3.75 11.25 3.75C9.92392 3.75 8.65215 4.27678 7.71447 5.21447C6.77678 6.15215 6.25 7.42392 6.25 8.75Z" stroke="#FFFCF2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.75 26.25V23.75C3.75 22.4239 4.27678 21.1521 5.21447 20.2145C6.15215 19.2768 7.42392 18.75 8.75 18.75H13.75C15.0761 18.75 16.3479 19.2768 17.2855 20.2145C18.2232 21.1521 18.75 22.4239 18.75 23.75V26.25" stroke="#FFFCF2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 3.9125C21.0755 4.18787 22.0288 4.81337 22.7095 5.69039C23.3903 6.5674 23.7598 7.64604 23.7598 8.75625C23.7598 9.86646 23.3903 10.9451 22.7095 11.8221C22.0288 12.6991 21.0755 13.3246 20 13.6" stroke="#FFFCF2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26.25 26.25V23.75C26.2437 22.6464 25.8724 21.576 25.1941 20.7055C24.5158 19.835 23.5685 19.2134 22.5 18.9375" stroke="#FFFCF2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
        <clipPath id="clip0_453_378">
        <rect className="size-10" fill="white"/>
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
        className="size-8 text-white"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
    </svg>
);

const DollarIcon = () => (
    <svg className="size-10" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_453_385)">
        <path d="M3.75 8.75C3.75 9.41304 4.01339 10.0489 4.48223 10.5178C4.95107 10.9866 5.58696 11.25 6.25 11.25C6.91304 11.25 7.54893 10.9866 8.01777 10.5178C8.48661 10.0489 8.75 9.41304 8.75 8.75C8.75 8.08696 8.48661 7.45107 8.01777 6.98223C7.54893 6.51339 6.91304 6.25 6.25 6.25C5.58696 6.25 4.95107 6.51339 4.48223 6.98223C4.01339 7.45107 3.75 8.08696 3.75 8.75Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 18.75C17.5 19.413 17.7634 20.0489 18.2322 20.5178C18.7011 20.9866 19.337 21.25 20 21.25C20.663 21.25 21.2989 20.9866 21.7678 20.5178C22.2366 20.0489 22.5 19.413 22.5 18.75C22.5 18.087 22.2366 17.4511 21.7678 16.9822C21.2989 16.5134 20.663 16.25 20 16.25C19.337 16.25 18.7011 16.5134 18.2322 16.9822C17.7634 17.4511 17.5 18.087 17.5 18.75Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.75 7.5C18.75 8.49456 19.1451 9.44839 19.8483 10.1517C20.5516 10.8549 21.5054 11.25 22.5 11.25C23.4946 11.25 24.4484 10.8549 25.1517 10.1517C25.8549 9.44839 26.25 8.49456 26.25 7.5C26.25 6.50544 25.8549 5.55161 25.1517 4.84835C24.4484 4.14509 23.4946 3.75 22.5 3.75C21.5054 3.75 20.5516 4.14509 19.8483 4.84835C19.1451 5.55161 18.75 6.50544 18.75 7.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.75 22.5C3.75 23.4946 4.14509 24.4484 4.84835 25.1517C5.55161 25.8549 6.50544 26.25 7.5 26.25C8.49456 26.25 9.44839 25.8549 10.1517 25.1517C10.8549 24.4484 11.25 23.4946 11.25 22.5C11.25 21.5054 10.8549 20.5516 10.1517 19.8483C9.44839 19.1451 8.49456 18.75 7.5 18.75C6.50544 18.75 5.55161 19.1451 4.84835 19.8483C4.14509 20.5516 3.75 21.5054 3.75 22.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.25 21.25L17.5 19.375" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.125 10.625L17.8875 17.3375" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.75 8.75L18.75 7.5" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
        <clipPath id="clip0_453_385">
        <rect className='size-10' fill="white"/>
        </clipPath>
    </defs>
    </svg>
);

const TrophyIcon = () => (
    <svg className="size-10" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_453_409)">
        <path d="M3.75 21.25L11.25 13.75L16.25 18.75L26.25 8.75" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.5 8.75H26.25V17.5" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
        <clipPath id="clip0_453_409">
        <rect className="size-10" fill="white"/>
        </clipPath>
    </defs>
    </svg>
);

// --- Componentes Reutilizables ---

// Tarjetas grandes del encabezado
const HeaderCard = ({ icon, title, value }) => (
    <div className="bg-[#A5C9A9] p-5 rounded-xl shadow-sm text-gray-800 flex items-center space-x-4">
        <div className="flex-shrink-0 text-gray-600">{icon}</div>
        <div>
            <span className="text-sm font-medium">{title}</span>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

// Tarjetas pequeñas de resumen
const StatCard = ({ title, value, change, color }) => (
    <div className={`p-4 rounded-xl shadow-sm text-white`} style={{ backgroundColor: color }}>
        <span className="text-xs opacity-90">{title}</span>
        <p className="text-xl font-bold">{value}</p>
        <span className="text-xs opacity-80">{change}</span>
    </div>
);

// --- Componente Principal del Dashboard ---
const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [productsData, setProductsData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setLoading(true);
        setError(null);

        try {
            // Obtener estadísticas del dashboard
            const dashboard = await getDashboardStats();
            setDashboardData(dashboard);

            // Obtener reporte de ventas (últimos 30 días)
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const sales = await getSalesReport(startDate, endDate);
            setSalesData(sales);

            // Obtener reporte de productos
            const products = await getProductsReport(startDate, endDate);
            setProductsData(products);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FCFBF4] p-5 md:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AA77] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FCFBF4] p-5 md:p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error al cargar el dashboard: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCFBF4] p-5 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de control</h1>

            <div className="grid grid-cols-1 gap-6">
                {/* Fila de Reporte y Encabezado */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-1 my-auto">
                        <HeaderCard
                            icon={<UsersIcon />}
                            title="Suscriptores activos"
                            value={dashboardData?.total_active_subscribers?.toLocaleString() || '0'}
                        />
                        <HeaderCard
                            icon={<DollarIcon />}
                            title="Ventas"
                            value={dashboardData?.total_sales?.toLocaleString() || '0'}
                        />
                        <HeaderCard
                            icon={<ChartBarIcon />}
                            title="Ingresos"
                            value={`$${dashboardData?.total_revenue?.toLocaleString() || '0'}`}
                        />
                        <HeaderCard
                            icon={<TrophyIcon />}
                            title="Producto top"
                            value={productsData?.top_product?.name || 'N/A'}
                        />
                    </div>
                    <div className="bg-white p-5 border border-gray-300 rounded-xl shadow-sm w-full md:w-auto">
                        <h3 className="font-semibold text-gray-800 mb-3">Generar reporte</h3>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => {
                                    const endDate = new Date().toISOString();
                                    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                                    window.open(`http://localhost:8000/api/v1/analytics/reports/sales/export/csv?start_date=${startDate}&end_date=${endDate}`, '_blank');
                                }}
                                className="bg-[#31478F] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90"
                            >
                                Exportar csv
                            </button>
                            <button 
                                onClick={() => {
                                    const endDate = new Date().toISOString();
                                    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                                    window.open(`http://localhost:8000/api/v1/analytics/reports/sales/export/pdf?start_date=${startDate}&end_date=${endDate}`, '_blank');
                                }}
                                className="bg-gray-100 text-gray-700 border border-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-200"
                            >
                                Exportar pdf
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fila de Resumen de hoy */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Resumen de hoy
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Ventas"
                            value={`$${dashboardData?.today_sales?.toLocaleString() || '0'} MXN`}
                            change={`${dashboardData?.sales_change_percent || 0}% desde ayer`}
                            color="#5A8A93"
                        />
                        <StatCard
                            title="Pedidos"
                            value={dashboardData?.today_orders?.toLocaleString() || '0'}
                            change="Pedidos totales"
                            color="#69AEA2"
                        />
                        <StatCard
                            title="Productos"
                            value={dashboardData?.total_products?.toLocaleString() || '0'}
                            change={`${dashboardData?.products_change_percent || 0}% desde ayer`}
                            color="#77C6B3"
                        />
                        <StatCard
                            title="Nuevos subs"
                            value={dashboardData?.new_subscribers_today?.toLocaleString() || '0'}
                            change={`+${dashboardData?.subscribers_change || 0} desde ayer`}
                            color="#54BAB9"
                        />
                    </div>
                </div>

                {/* Fila de Gráficos Principales */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                    {/* Ventas Mensuales (Columna de 2) */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Ventas mensuales
                        </h2>
                        <ResponsiveContainer width="100%" height={256}>
                            <AreaChart data={salesData?.monthly_data || []}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#70AA77" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#70AA77" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#31478F" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#31478F" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#69AEA2" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#69AEA2" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="ventas"
                                    name="Ventas"
                                    stroke="#70AA77"
                                    fillOpacity={1}
                                    fill="url(#colorVentas)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pedidos"
                                    name="Pedidos"
                                    stroke="#31478F"
                                    fillOpacity={1}
                                    fill="url(#colorPedidos)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="ingresos"
                                    name="Ingresos"
                                    stroke="#69AEA2"
                                    fillOpacity={1}
                                    fill="url(#colorIngresos)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Nuevos Subscriptores */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Nuevos subscriptores
                        </h2>
                        <p className="text-5xl font-bold text-gray-800">
                            +{dashboardData?.new_subscribers_this_month || 0}{' '}
                            <span className={`text-3xl align-middle ${
                                (dashboardData?.subscribers_trend || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {(dashboardData?.subscribers_trend || 0) >= 0 ? '▲' : '▼'}
                            </span>
                        </p>
                        <p className="text-sm text-gray-500 mb-4">Nuevos este mes</p>
                        <ResponsiveContainer width="100%" height={192}>
                            <BarChart data={dashboardData?.subscribers_weekly || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '11px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="nuevos" name="Nuevos" fill="#54BAB9" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fila de Gráficos Secundarios y Tablas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Productos más Vendidos */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Productos más Vendidos
                        </h2>
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2 px-3">#</th>
                                    <th className="py-2 px-3">Nombre</th>
                                    <th className="py-2 px-3">Popularidad</th>
                                    <th className="py-2 px-3">Ventas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsData?.top_products?.slice(0, 5).map((product, index) => (
                                    <tr key={product.product_id} className="border-b border-gray-100">
                                        <td className="py-3 px-3">{String(index + 1).padStart(2, '0')}</td>
                                        <td className="py-3 px-3 font-medium">{product.name}</td>
                                        <td className="py-3 px-3">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-orange-400 h-1.5 rounded-full"
                                                    style={{ width: `${product.popularity_percent || 0}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
                                                {product.sales_count || 0}
                                            </span>
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan="4" className="py-3 px-3 text-center text-gray-500">
                                            No hay datos disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Categorías Top */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Categorías top
                        </h2>
                        <div className="space-y-2">
                            {salesData?.top_categories?.map((category, index) => {
                                const colors = ['#31478F', '#2563eb', '#3b82f6', '#06b6d4', '#14b8a6'];
                                return (
                                    <div key={category.category} className="flex items-center">
                                        <span className="text-sm text-gray-700 w-28">{category.category}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                                            <div
                                                className="h-4 rounded-full"
                                                style={{ 
                                                    width: `${category.percentage || 0}%`,
                                                    backgroundColor: colors[index % colors.length]
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            }) || (
                                <p className="text-sm text-gray-500 text-center">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fila de Gráfico de Suscriptores */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Subscriptores activos
                    </h2>
                    <p className="text-2xl font-bold text-gray-800 mb-4">
                        {dashboardData?.total_active_subscribers?.toLocaleString() || '0'}
                    </p>
                        <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={dashboardData?.subscribers_history || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} domain={['dataMin - 10', 'dataMax + 10']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Total"
                                stroke="#70AA77"
                                strokeWidth={2}
                                dot={{ fill: '#70AA77', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;