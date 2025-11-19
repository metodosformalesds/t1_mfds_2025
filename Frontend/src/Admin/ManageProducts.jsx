{
/**
 * Autor: Diego Jasso
 * Componente: ManageProducts
 * Descripción: Componente de administración para gestión de productos.
 *              Permite crear, editar, eliminar y visualizar productos en formato tabla.
 */
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts, createProduct, updateProduct, deleteProduct } from "../utils/api";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ManageProducts = () => {
    const navigate = useNavigate();

    // ============ ESTADOS DEL COMPONENTE ============
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para modales
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Producto siendo editado o eliminado
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Formulario de producto
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        brand: "",
        category: "",
        description: "",
        images: []
    });

    // Estados para drag and drop
    const [isDragging, setIsDragging] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [showImageHover, setShowImageHover] = useState(false);

    // Estados para búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Estados para notificaciones
    const [notification, setNotification] = useState({
        show: false,
        type: '', // 'added', 'updated', 'deleted', 'error'
        productName: ''
    });



    // ============================================================================
    // EFECTO: CARGAR PRODUCTOS
    // ============================================================================
    useEffect(() => {
        fetchProducts();
    }, []);

    // ============================================================================
    // EFECTO: FILTRAR PRODUCTOS
    // ============================================================================
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const searchLower = searchTerm.toLowerCase();
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.brand.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower)
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

    // ============================================================================
    // FUNCIÓN: MOSTRAR NOTIFICACIÓN
    // ============================================================================
    function showNotification(type, productName) {
        setNotification({ show: true, type, productName });
        setTimeout(() => {
            setNotification({ show: false, type: '', productName: '' });
        }, 3000);
    }

    async function fetchProducts() {
        setLoading(true);
        setError(null);

        try {
            const response = await searchProducts({ 
                page: 1, 
                limit: 100,
                is_active: true 
            });
            // La respuesta tiene la estructura: { items, total, page, limit, total_pages }
            setProducts(response.items || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ============================================================================
    // FUNCIÓN: AGREGAR PRODUCTO
    // ============================================================================
    async function handleAddProduct(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            formDataToSend.append("price", parseFloat(formData.price));
            formDataToSend.append("stock", parseInt(formData.stock));
            formDataToSend.append("brand", formData.brand);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("description", formData.description);
            
            // Agregar imágenes (el backend espera la key "images" para múltiples archivos)
            formData.images.forEach((image) => {
                formDataToSend.append("images", image);
            });

            const productName = formData.name;
            await createProduct(formDataToSend);
            await fetchProducts();
            
            setShowAddModal(false);
            resetForm();
            showNotification('added', productName);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ============================================================================
    // FUNCIÓN: EDITAR PRODUCTO
    // ============================================================================
    async function handleEditProduct(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const productName = formData.name;
            // updateProduct espera JSON con campos opcionales a actualizar
            await updateProduct(selectedProduct.product_id, {
                name: formData.name,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                brand: formData.brand,
                category: formData.category,
                description: formData.description
            });
            
            await fetchProducts();
            setShowEditModal(false);
            resetForm();
            showNotification('updated', productName);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ============================================================================
    // FUNCIÓN: ELIMINAR PRODUCTO
    // ============================================================================
    async function handleDeleteProduct() {
        setLoading(true);
        setError(null);

        try {
            const deletedName = selectedProduct.name;
            // deleteProduct(productId, hardDelete=false) - soft delete por defecto
            await deleteProduct(selectedProduct.product_id, false);
            await fetchProducts();
            setShowDeleteConfirm(false);
            setSelectedProduct(null);
            showNotification('deleted', deletedName);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // ============================================================================
    // FUNCIONES HELPER
    // ============================================================================

    function openAddModal() {
        resetForm();
        setShowAddModal(true);
    }

    function openEditModal(product) {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            brand: product.brand,
            category: product.category,
            description: product.description,
            images: []
        });
        setShowEditModal(true);
    }

    function openDeleteConfirm(product) {
        setSelectedProduct(product);
        setShowDeleteConfirm(true);
    }

    function resetForm() {
        setFormData({
            name: "",
            price: "",
            stock: "",
            brand: "",
            category: "",
            description: "",
            images: []
        });
        setSelectedProduct(null);
        setError(null);
        setPreviewImages([]);
        setShowImageHover(false);
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleImageChange(e) {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: files }));
        
        // Crear previews
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    }

    function handleDragOver(e) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, images: files }));
            const previews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(previews);
        }
    }

    function removePreviewImage(index) {
        const newImages = formData.images.filter((_, i) => i !== index);
        const newPreviews = previewImages.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
        setPreviewImages(newPreviews);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // ============================================================================
    // RENDERIZADO
    // ============================================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* ============ NOTIFICACIÓN ============ */}
                {notification.show && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center mx-4">
                            {/* Círculo de check */}
                            <div className="flex items-center justify-center mb-6">
                                <div className={`size-24 rounded-full flex items-center justify-center ${
                                    notification.type === 'deleted' ? 'bg-[#C05F5F]' : 
                                    notification.type === 'updated' ? 'bg-[#31478F]' : 
                                    'bg-[#70AA77]'
                                }`}>
                                    {notification.type === 'deleted' ? (
                                        <svg width="60" height="60" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M40.25 120.75C37.0875 120.75 34.3792 119.623 32.1252 117.369C29.8712 115.115 28.7462 112.409 28.75 109.25V34.5H23V23H51.75V17.25H86.25V23H115V34.5H109.25V109.25C109.25 112.412 108.123 115.121 105.869 117.375C103.615 119.629 100.909 120.754 97.75 120.75H40.25ZM97.75 34.5H40.25V109.25H97.75V34.5ZM51.75 97.75H63.25V46H51.75V97.75ZM74.75 97.75H86.25V46H74.75V97.75Z" fill="#FFFCF2"/>
                                        </svg>
                                    ) : notification.type === 'updated' ? (
                                        <svg width="60" height="60" viewBox="0 0 102 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M98.26 10.6586L90.7873 3.55225C88.2991 1.18408 85.0359 0 81.7726 0C78.5094 0 75.2462 1.18408 72.756 3.55035L2.55528 70.3098L0.0251989 91.9492C-0.293551 94.6735 1.9636 97 4.76661 97C4.94391 97 5.12122 96.9905 5.30251 96.9716L28.0413 94.5826L98.262 27.8041C103.24 23.0697 103.24 15.3931 98.26 10.6586ZM25.1148 88.7929L6.58149 90.7461L8.6454 73.0948L61.2173 23.1L77.7066 38.7811L25.1148 88.7929ZM93.7537 23.5187L82.2129 34.4937L65.7236 18.8127L77.2643 7.83768C78.4676 6.69338 80.0693 6.0625 81.7726 6.0625C83.476 6.0625 85.0757 6.69338 86.281 7.83768L93.7537 14.9441C96.2379 17.3084 96.2379 21.1543 93.7537 23.5187Z" fill="#FFFCF2"/>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="white"
                                            className="size-12"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Mensaje de éxito */}
                            <h1 className="text-3xl font-bold mb-3">
                                {notification.type === 'added' && '¡Producto Agregado!'}
                                {notification.type === 'updated' && '¡Producto Actualizado!'}
                                {notification.type === 'deleted' && '¡Producto Eliminado!'}
                            </h1>
                            <p className="text-base text-gray-700">
                                {notification.type === 'added' && (
                                    <>
                                        El producto <span className="font-semibold">{notification.productName}</span> ha sido agregado correctamente
                                    </>
                                )}
                                {notification.type === 'updated' && (
                                    <>
                                        El producto <span className="font-semibold">{notification.productName}</span> ha sido actualizado correctamente
                                    </>
                                )}
                                {notification.type === 'deleted' && (
                                    <>
                                        El producto <span className="font-semibold">{notification.productName}</span> ha sido eliminado correctamente
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* ============ HEADER ============ */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5 19.5L3 12M3 12L10.5 4.5M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Gestión de Productos
                        </h1>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-[#70AA77] hover:bg-[#5f8a5f] text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Agregar Producto
                    </button>
                </header>

                {/* ============ BARRA DE BÚSQUEDA ============ */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, marca, categoría o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <p className="mt-2 text-sm text-gray-600">
                            Se encontraron <span className="font-semibold text-[#70AA77]">{filteredProducts.length}</span> productos
                        </p>
                    )}
                </div>

                {/* ============ ERROR MESSAGE ============ */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* ============ LOADING STATE ============ */}
                {loading && products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AA77] mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando productos...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* ============ TABLA DE PRODUCTOS ============ */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Foto
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre del Producto
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Agregado
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                {searchTerm 
                                                    ? `No se encontraron productos que coincidan con "${searchTerm}"`
                                                    : "No hay productos disponibles. Agrega uno nuevo."
                                                }
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                                                {/* FOTO */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        <img
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                            src={product.primary_image || "https://via.placeholder.com/100"}
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                </td>

                                                {/* NOMBRE */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.brand}
                                                    </div>
                                                </td>

                                                {/* PRECIO */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        ${product.price.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Stock: {product.stock}
                                                    </div>
                                                </td>

                                                {/* CATEGORÍA */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {product.category}
                                                    </span>
                                                </td>

                                                {/* FECHA */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(product.created_at)}
                                                </td>

                                                {/* ACCIONES */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-3 items-center">
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Editar producto"
                                                        >
                                                            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clipPath="url(#clip0_926_1030)">
                                                                    <path d="M20.414 2.2018L18.8615 0.733803C18.3446 0.244601 17.6666 0 16.9887 0C16.3107 0 15.6328 0.244601 15.1154 0.733411L0.530909 14.5242L0.00527305 18.9943C-0.0609488 19.5571 0.407985 20.0377 0.990323 20.0377C1.02716 20.0377 1.06399 20.0357 1.10166 20.0318L5.82576 19.5383L20.4144 5.74362C21.4487 4.76561 21.4487 3.17981 20.414 2.2018ZM5.21776 18.3423L1.36737 18.7458L1.79616 15.0995L12.7182 4.77187L16.144 8.01117L5.21776 18.3423ZM19.4778 4.85836L17.0802 7.12552L13.6544 3.88622L16.0521 1.61906C16.3021 1.38268 16.6348 1.25236 16.9887 1.25236C17.3426 1.25236 17.6749 1.38268 17.9253 1.61906L19.4778 3.08706C19.9939 3.57548 19.9939 4.36994 19.4778 4.85836Z" fill="#459385"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_926_1030">
                                                                        <rect width="21.191" height="20.0377" fill="white"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirm(product)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Eliminar producto"
                                                        >
                                                            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <g clipPath="url(#clip0_926_1028)">
                                                                    <path d="M0.318663 2.37289H4.46126L5.79964 0.711866C5.97773 0.490839 6.20867 0.311442 6.47416 0.187884C6.73964 0.0643261 7.03239 0 7.32921 0L10.5158 0C10.8127 0 11.1054 0.0643261 11.3709 0.187884C11.6364 0.311442 11.8673 0.490839 12.0454 0.711866L13.3838 2.37289H17.5264C17.6109 2.37289 17.6919 2.40414 17.7517 2.45976C17.8115 2.51539 17.845 2.59083 17.845 2.6695V3.26272C17.845 3.34138 17.8115 3.41683 17.7517 3.47245C17.6919 3.52808 17.6109 3.55933 17.5264 3.55933H16.7735L15.4511 17.3629C15.4083 17.8054 15.1892 18.2171 14.8369 18.5169C14.4846 18.8167 14.0245 18.983 13.5471 18.9831H4.29795C3.82056 18.983 3.36047 18.8167 3.00813 18.5169C2.6558 18.2171 2.43671 17.8054 2.39394 17.3629L1.0715 3.55933H0.318663C0.234148 3.55933 0.153095 3.52808 0.0933342 3.47245C0.0335732 3.41683 0 3.34138 0 3.26272V2.6695C0 2.59083 0.0335732 2.51539 0.0933342 2.45976C0.153095 2.40414 0.234148 2.37289 0.318663 2.37289ZM11.0257 1.42373C10.9661 1.35027 10.8891 1.29062 10.8006 1.24946C10.7122 1.2083 10.6147 1.18673 10.5158 1.18644H7.32921C7.23033 1.18673 7.13285 1.2083 7.0444 1.24946C6.95596 1.29062 6.87893 1.35027 6.81936 1.42373L6.05457 2.37289H11.7905L11.0257 1.42373ZM3.66461 17.2553C3.67773 17.4031 3.75019 17.5409 3.86756 17.6413C3.98493 17.7416 4.1386 17.7971 4.29795 17.7966H13.5471C13.7064 17.7971 13.8601 17.7416 13.9775 17.6413C14.0949 17.5409 14.1673 17.4031 14.1804 17.2553L15.4949 3.55933H2.35013L3.66461 17.2553Z" fill="#C05F5F"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_926_1028">
                                                                        <rect width="17.845" height="18.9831" fill="white" transform="matrix(-1 0 0 1 17.845 0)"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ============================================================================ */}
                {/* MODAL: AGREGAR PRODUCTO */}
                {/* ============================================================================ */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Producto</h2>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Columna Izquierda - Información Básica */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700 text-lg mb-4">Información Básica</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del Producto *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                placeholder="Ej: Proteína Whey Premium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Marca *
                                            </label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                placeholder="Ej: FitNutrition"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Precio *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                    placeholder="29.99"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Stock *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={formData.stock}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                    placeholder="50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                            >
                                                <option value="">Selecciona una categoría</option>
                                                <option value="Proteínas">Proteínas</option>
                                                <option value="Suplementos">Suplementos</option>
                                                <option value="Aminoácidos">Aminoácidos</option>
                                                <option value="Vitaminas">Vitaminas</option>
                                                <option value="Pre-entreno">Pre-entreno</option>
                                                <option value="Post-entreno">Post-entreno</option>
                                                <option value="Barras">Barras Nutricionales</option>
                                                <option value="Accesorios">Accesorios</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Columna Derecha - Imagen y Descripción */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700 text-lg mb-4">Multimedia</h3>
                                        
                                        {/* Drag and Drop Zone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Imágenes del Producto *
                                            </label>
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`
                                                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                                                    transition-colors duration-200
                                                    ${isDragging 
                                                        ? 'border-[#70AA77] bg-green-50' 
                                                        : 'border-gray-300 hover:border-[#70AA77]'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                
                                                {previewImages.length === 0 ? (
                                                    <div className="space-y-2">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-semibold text-[#70AA77]">Haz clic para subir</span> o arrastra y suelta
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {previewImages.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <img 
                                                                    src={preview} 
                                                                    alt={`Preview ${index + 1}`} 
                                                                    className="w-full h-24 object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removePreviewImage(index);
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                required
                                                rows="6"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent resize-none"
                                                placeholder="Describe el producto, sus beneficios y características..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-6 mt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-[#70AA77] hover:bg-[#5f8a5f] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "Agregando..." : "Agregar Producto"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ============================================================================ */}
                {/* MODAL: EDITAR PRODUCTO */}
                {/* ============================================================================ */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Editar Producto</h2>
                                <button 
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditProduct}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Columna Izquierda - Información Básica */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700 text-lg mb-4">Información Básica</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre del Producto *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Marca *
                                            </label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Precio *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Stock *
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={formData.stock}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent"
                                            >
                                                <option value="">Selecciona una categoría</option>
                                                <option value="Proteínas">Proteínas</option>
                                                <option value="Suplementos">Suplementos</option>
                                                <option value="Aminoácidos">Aminoácidos</option>
                                                <option value="Vitaminas">Vitaminas</option>
                                                <option value="Pre-entreno">Pre-entreno</option>
                                                <option value="Post-entreno">Post-entreno</option>
                                                <option value="Barras">Barras Nutricionales</option>
                                                <option value="Accesorios">Accesorios</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Columna Derecha - Imagen y Descripción */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-700 text-lg mb-4">Multimedia</h3>
                                        
                                        {/* Imagen Actual con Hover Overlay */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Imagen del Producto
                                            </label>
                                            <div 
                                                className="relative rounded-lg overflow-hidden group cursor-pointer border-2 border-gray-300"
                                                onMouseEnter={() => setShowImageHover(true)}
                                                onMouseLeave={() => setShowImageHover(false)}
                                            >
                                                {/* Imagen actual del producto */}
                                                <img 
                                                    src={selectedProduct?.primary_image} 
                                                    alt={selectedProduct?.name}
                                                    className="w-full h-64 object-cover"
                                                />
                                                
                                                {/* Overlay con opción de cambiar imagen */}
                                                <div 
                                                    className={`
                                                        absolute inset-0 bg-black/60 flex flex-col items-center justify-center
                                                        transition-opacity duration-200
                                                        ${showImageHover ? 'opacity-100' : 'opacity-0'}
                                                    `}
                                                >
                                                    <svg className="h-12 w-12 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-white font-semibold">Cambiar Imagen</p>
                                                    <p className="text-white/80 text-sm mt-1">Haz clic para subir una nueva</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Preview de nueva imagen si se selecciona */}
                                            {previewImages.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Nueva imagen seleccionada:</p>
                                                    <div className="relative group">
                                                        <img 
                                                            src={previewImages[0]} 
                                                            alt="Preview nueva imagen" 
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removePreviewImage(0)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <svg className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                required
                                                rows="6"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70AA77] focus:border-transparent resize-none"
                                                placeholder="Describe el producto, sus beneficios y características..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-6 mt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-[#31478F] hover:bg-[#2a3f7f] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ============================================================================ */}
                {/* MODAL: CONFIRMAR ELIMINACIÓN */}
                {/* ============================================================================ */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                ¿Eliminar producto?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas eliminar <strong>{selectedProduct?.name}</strong>? 
                                Esta acción no se puede deshacer.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteProduct}
                                    disabled={loading}
                                    className="flex-1 bg-[#C05F5F] hover:bg-[#9b4b4b] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? "Eliminando..." : "Sí, eliminar"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageProducts;
