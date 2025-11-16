/**
 * Autor: Diego Jasso
 * Descripción: Módulo de utilidades para realizar peticiones HTTP al backend.
 *              Centraliza la lógica de autenticación, manejo de errores y endpoints.
 *              Proporciona helpers específicos para cada tipo de operación.
 */

// URL base del API, se obtiene de variables de entorno o usa localhost por defecto
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

/**
 * Autor: Diego Jasso
 * Descripción: Helper genérico para realizar peticiones API con autenticación JWT.
 *              Automáticamente incluye el token de autorización si está disponible.
 *              Maneja errores y convierte respuestas a JSON.
 * Parámetros:
 *   @param {string} path - Ruta del endpoint (ej: "/api/v1/user-profile/me")
 *   @param {object} options - Opciones adicionales de fetch (method, body, headers, etc.)
 * Retorna:
 *   @returns {Promise<object>} - Respuesta del servidor en formato JSON
 * Excepciones:
 *   @throws {Error} - Error con mensaje descriptivo si la petición falla (4xx, 5xx)
 */
export async function apiFetch(path, options = {}) {
    // Recuperar token JWT de localStorage para autenticación
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        },
        // Para testing sin autenticación, comentar el header anterior y usar:
        // headers: { "Content-Type": "application/json" },
        ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.detail || data.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return data;
}

/**
 * Autor: Diego Jasso
 * Descripción: Helper especializado para realizar upload de archivos al servidor.
 *              Utiliza FormData para enviar archivos binarios (imágenes, documentos, etc.).
 *              Especialmente útil para actualizar imágenes de perfil.
 * Parámetros:
 *   @param {string} path - Ruta del endpoint (ej: "/api/v1/user-profile/me/image")
 *   @param {File} file - Objeto File del navegador conteniendo el archivo a subir
 *   @param {string} fieldName - Nombre del campo en FormData (default: "file")
 * Retorna:
 *   @returns {Promise<object>} - Respuesta del servidor con información del archivo subido
 * Excepciones:
 *   @throws {Error} - Error si el upload falla o el servidor rechaza el archivo
 */
export async function apiUploadFile(path, file, fieldName = "file") {
    // Recuperar token para autenticación
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append(fieldName, file);

    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            ...(token && { "Authorization": `Bearer ${token}` })
            // No incluir Content-Type para FormData, el browser lo maneja automáticamente
        },
        body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.detail || data.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return data;
}

/**
 * Autor: Diego Jasso
 * Descripción: Catálogo centralizado de todos los endpoints del API.
 *              Facilita el mantenimiento y evita hardcodear URLs en componentes.
 *              Usa funciones para endpoints dinámicos que requieren parámetros.
 * Uso:
 *   - Endpoints estáticos: API_ENDPOINTS.USER_PROFILE
 *   - Endpoints dinámicos: API_ENDPOINTS.PRODUCT_DETAIL(123)
 */
export const API_ENDPOINTS = {
    // ============ AUTENTICACIÓN ============
    AUTH_SIGNUP: "/api/v1/auth/signup",
    AUTH_CONFIRM: "/api/v1/auth/confirm",
    AUTH_RESEND_CODE: "/api/v1/auth/resend-code",
    AUTH_LOGIN: "/api/v1/auth/login",
    AUTH_REFRESH: "/api/v1/auth/refresh",
    AUTH_LOGOUT: "/api/v1/auth/logout",
    AUTH_FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    AUTH_CONFIRM_FORGOT_PASSWORD: "/api/v1/auth/confirm-forgot-password",
    
    // ============ PERFIL DE USUARIO ============
    USER_PROFILE: "/api/v1/profile/me",
    USER_PROFILE_BASIC: "/api/v1/profile/me/basic",
    USER_PROFILE_UPDATE: "/api/v1/profile/me",
    USER_PROFILE_IMAGE: "/api/v1/profile/me/image",
    USER_PROFILE_DELETE: "/api/v1/profile/me",
    
    // ============ PLACEMENT TEST Y FITNESS PROFILE ============
    PLACEMENT_TEST: "/api/v1/placement-test",
    FITNESS_PROFILE: "/api/v1/placement-test/fitness-profile",
    
    // ============ BÚSQUEDA Y FILTROS ============
    SEARCH_PRODUCTS: "/api/v1/search",
    SEARCH_FILTERS: "/api/v1/search/filters",
    
    // ============ PRODUCTOS ============
    PRODUCT_DETAIL: (productId) => `/api/v1/products/${productId}`,
    PRODUCT_RELATED: (productId, limit = 6) => `/api/v1/products/${productId}/related?limit=${limit}`,
    PRODUCT_REVIEWS: (productId, page = 1, limit = 10) => `/api/v1/products/${productId}/reviews?page=${page}&limit=${limit}`,
    PRODUCT_CREATE_REVIEW: (productId) => `/api/v1/products/${productId}/reviews`,
    
    // ============ CARRITO DE COMPRAS ============
    CART_GET: "/api/v1/cart",
    CART_SUMMARY: "/api/v1/cart/summary",
    CART_ADD_ITEM: "/api/v1/cart/add",
    CART_UPDATE_ITEM: (cartItemId) => `/api/v1/cart/${cartItemId}`,
    CART_REMOVE_ITEM: (cartItemId) => `/api/v1/cart/${cartItemId}`,
    CART_CLEAR: "/api/v1/cart/actions/clear",
    CART_VALIDATE: "/api/v1/cart/validate",
    
    // ============ DIRECCIONES DE ENVÍO ============
    ADDRESSES_LIST: "/api/v1/addresses",
    ADDRESSES_DETAIL: (addressId) => `/api/v1/addresses/${addressId}`,
    ADDRESSES_CREATE: "/api/v1/addresses",
    ADDRESSES_UPDATE: (addressId) => `/api/v1/addresses/${addressId}`,
    ADDRESSES_DELETE: (addressId) => `/api/v1/addresses/${addressId}`,
    ADDRESSES_SET_DEFAULT: (addressId) => `/api/v1/addresses/${addressId}/set-default`,
    
    // ============ MÉTODOS DE PAGO ============
    PAYMENT_METHODS_LIST: "/api/v1/payment-methods",
    PAYMENT_METHODS_DETAIL: (paymentId) => `/api/v1/payment-methods/${paymentId}`,
    PAYMENT_METHODS_SETUP_INTENT: "/api/v1/payment-methods/setup-intent",
    PAYMENT_METHODS_SAVE: "/api/v1/payment-methods/save",
    PAYMENT_METHODS_DELETE: (paymentId) => `/api/v1/payment-methods/${paymentId}`,
    PAYMENT_METHODS_SET_DEFAULT: (paymentId) => `/api/v1/payment-methods/${paymentId}/set-default`,
    
    // ============ PROGRAMA DE LEALTAD ============
    LOYALTY_STATUS: "/api/v1/loyalty/me",
    LOYALTY_TIERS: "/api/v1/loyalty/tiers",
    LOYALTY_TIER_DETAIL: (tierId) => `/api/v1/loyalty/tiers/${tierId}`,
    LOYALTY_HISTORY: "/api/v1/loyalty/me/history",
    LOYALTY_EXPIRE_POINTS: "/api/v1/loyalty/me/expire-points",
    LOYALTY_GENERATE_COUPONS: (userId) => `/api/v1/loyalty/${userId}/coupons/generate`,
    
    // ============ ÓRDENES ============
    ORDERS_LIST: "/api/v1/orders",
    ORDERS_DETAIL: (orderId) => `/api/v1/orders/${orderId}`,
    ORDERS_SUBSCRIPTION: "/api/v1/orders/subscription/all",
    ORDERS_CANCEL: (orderId) => `/api/v1/orders/${orderId}/cancel`,
    ORDERS_STATUS: (orderId) => `/api/v1/orders/${orderId}/status`,
    
    // ============ PROCESO DE PAGO (CHECKOUT) ============
    CHECKOUT_SUMMARY: "/api/v1/checkout/summary",
    CHECKOUT_STRIPE: "/api/v1/checkout/stripe",
    CHECKOUT_STRIPE_WEBHOOK: "/api/v1/checkout/stripe/webhook",
    CHECKOUT_PAYPAL_INIT: "/api/v1/checkout/paypal/init",
    CHECKOUT_PAYPAL_CAPTURE: "/api/v1/checkout/paypal/capture",
    
    // ============ ADMINISTRACIÓN DE PRODUCTOS ============
    ADMIN_PRODUCTS_CREATE: "/api/v1/admin/products",
    ADMIN_PRODUCTS_UPDATE: (productId) => `/api/v1/admin/products/${productId}`,
    ADMIN_PRODUCTS_DELETE: (productId) => `/api/v1/admin/products/${productId}`,
    ADMIN_PRODUCTS_BULK_ACTION: "/api/v1/admin/products/bulk-action",
    
    // ============ ANALYTICS Y REPORTES (ADMIN) ============
    ANALYTICS_DASHBOARD: "/api/v1/analytics/dashboard",
    ANALYTICS_SALES_REPORT: "/api/v1/analytics/reports/sales",
    ANALYTICS_PRODUCTS_REPORT: "/api/v1/analytics/reports/products",
    ANALYTICS_LOW_STOCK: "/api/v1/analytics/products/low-stock",
    ANALYTICS_SALES_CSV: "/api/v1/analytics/reports/sales/export/csv",
    ANALYTICS_SALES_PDF: "/api/v1/analytics/reports/sales/export/pdf",
    ANALYTICS_PRODUCTS_CSV: "/api/v1/analytics/reports/products/export/csv",
    ANALYTICS_PRODUCTS_PDF: "/api/v1/analytics/reports/products/export/pdf",
    ANALYTICS_LOW_STOCK_CSV: "/api/v1/analytics/reports/low-stock/export/csv",
};

/**
 * ============================================================================
 * HELPERS ESPECÍFICOS PARA ENDPOINTS COMUNES
 * ============================================================================
 * Funciones de conveniencia que encapsulan llamadas comunes al API.
 * Simplifican el uso desde componentes React y mantienen consistencia.
 */

// ============ AUTENTICACIÓN ============

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Registra un nuevo usuario en el sistema usando AWS Cognito.
 *              Requiere multipart/form-data para soportar imagen de perfil.
 * Endpoint: POST /api/v1/auth/signup
 * Parámetros:
 *   @param {FormData} formData - FormData con campos:
 *     - first_name (string): Nombre del usuario
 *     - last_name (string): Apellido del usuario
 *     - email (string): Email (username) del usuario
 *     - password (string): Contraseña (debe cumplir requisitos de Cognito)
 *     - gender (string, opcional): Género ('M', 'F', 'prefer_not_say')
 *     - birth_date (string, opcional): Fecha de nacimiento (ISO 8601)
 *     - profile_image (File, opcional): Imagen de perfil
 * Retorna: user_sub de Cognito y user_id de la base de datos local
 * Excepciones: 400 si el email ya existe o los datos son inválidos
 */
export const signUp = (formData) => {
    const token = localStorage.getItem("token");
    return fetch(`${API_BASE}${API_ENDPOINTS.AUTH_SIGNUP}`, {
        method: "POST",
        headers: {
            ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: formData
    }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || data.message || `Error ${res.status}`);
        return data;
    });
};

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Confirma el registro de un usuario usando el código enviado por email.
 * Endpoint: POST /api/v1/auth/confirm
 * Parámetros:
 *   @param {string} email - Email del usuario
 *   @param {string} code - Código de verificación de 6 dígitos
 * Retorna: Mensaje de confirmación exitosa
 * Excepciones: 400 si el código es inválido o expiró
 */
export const confirmSignUp = (email, code) => apiFetch(API_ENDPOINTS.AUTH_CONFIRM, {
    method: "POST",
    body: JSON.stringify({ email, code })
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Reenvía el código de confirmación a un email no verificado.
 * Endpoint: POST /api/v1/auth/resend-code
 * Parámetros:
 *   @param {string} email - Email del usuario
 * Retorna: Mensaje de confirmación del reenvío
 */
export const resendConfirmationCode = (email) => apiFetch(API_ENDPOINTS.AUTH_RESEND_CODE, {
    method: "POST",
    body: JSON.stringify({ email })
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Inicia sesión con email y contraseña.
 * Endpoint: POST /api/v1/auth/login
 * Parámetros:
 *   @param {string} email - Email del usuario
 *   @param {string} password - Contraseña
 * Retorna: access_token, id_token, refresh_token, expires_in, token_type
 * Excepciones: 401 si las credenciales son incorrectas
 * Nota: Guarda el access_token en localStorage para peticiones subsecuentes
 */
export const login = (email, password) => apiFetch(API_ENDPOINTS.AUTH_LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password })
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Refresca los tokens usando el refresh_token.
 * Endpoint: POST /api/v1/auth/refresh
 * Parámetros:
 *   @param {string} refreshToken - Refresh token obtenido en el login
 * Retorna: Nuevos access_token e id_token
 * Excepciones: 401 si el refresh_token es inválido o expiró
 */
export const refreshToken = (refreshToken) => apiFetch(API_ENDPOINTS.AUTH_REFRESH, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken })
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Cierra sesión del usuario invalidando el access_token en Cognito.
 * Endpoint: POST /api/v1/auth/logout
 * Retorna: Mensaje de confirmación de logout
 * Nota: Requiere token de autenticación en headers (automático con apiFetch)
 */
export const logout = () => apiFetch(API_ENDPOINTS.AUTH_LOGOUT, {
    method: "POST"
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Inicia el proceso de recuperación de contraseña.
 * Endpoint: POST /api/v1/auth/forgot-password
 * Parámetros:
 *   @param {string} email - Email del usuario
 * Retorna: Mensaje indicando que se envió el código de verificación
 */
export const forgotPassword = (email) => apiFetch(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
    method: "POST",
    body: JSON.stringify({ email })
});

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Confirma el restablecimiento de contraseña con el código recibido.
 * Endpoint: POST /api/v1/auth/confirm-forgot-password
 * Parámetros:
 *   @param {string} email - Email del usuario
 *   @param {string} code - Código de verificación recibido por email
 *   @param {string} newPassword - Nueva contraseña
 * Retorna: Mensaje de confirmación
 * Excepciones: 400 si el código es inválido o la contraseña no cumple requisitos
 */
export const confirmForgotPassword = (email, code, newPassword) => 
    apiFetch(API_ENDPOINTS.AUTH_CONFIRM_FORGOT_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ email, code, new_password: newPassword })
    });

// ============ PERFIL DE USUARIO ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene el perfil completo del usuario autenticado.
 * Endpoint: GET /api/v1/profile/me
 * Retorna: Información completa del usuario incluyendo email, nombre, foto, género, etc.
 */
export const getUserProfile = () => apiFetch(API_ENDPOINTS.USER_PROFILE);

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene información básica del perfil del usuario.
 * Endpoint: GET /api/v1/profile/me/basic
 * Retorna: Versión reducida del perfil (útil para headers, avatares, etc.)
 */
export const getBasicUserProfile = () => apiFetch(API_ENDPOINTS.USER_PROFILE_BASIC);

/**
 * Autor: Diego Jasso
 * Descripción: Actualiza la información del perfil del usuario.
 * Endpoint: PUT /api/v1/profile/me
 * Parámetros:
 *   @param {object} data - Objeto con campos a actualizar:
 *     - first_name (string, opcional): Nombre
 *     - last_name (string, opcional): Apellido
 *     - gender (string, opcional): Género
 *     - date_of_birth (string, opcional): Fecha de nacimiento
 * Retorna: Perfil actualizado completo
 */
export const updateUserProfile = (data) => apiFetch(API_ENDPOINTS.USER_PROFILE_UPDATE, {
    method: "PUT",
    body: JSON.stringify(data)
});

/**
 * Autor: Diego Jasso
 * Descripción: Actualiza la imagen de perfil del usuario.
 * Endpoint: PUT /api/v1/profile/me/image
 * Parámetros:
 *   @param {File} imageFile - Archivo de imagen (jpeg, png, etc.)
 * Retorna: URL de la nueva imagen de perfil en S3
 */
export const updateProfileImage = (imageFile) => apiUploadFile(
    API_ENDPOINTS.USER_PROFILE_IMAGE, 
    imageFile, 
    "profile_image"
);

/**
 * Autor: Diego Jasso
 * Descripción: Elimina la cuenta del usuario (soft delete).
 * Endpoint: DELETE /api/v1/profile/me
 * Retorna: Confirmación de eliminación
 * Nota: Esta acción desactiva la cuenta pero no elimina datos permanentemente.
 */
export const deleteUserAccount = () => apiFetch(API_ENDPOINTS.USER_PROFILE_DELETE, {
    method: "DELETE"
});

// ============ PLACEMENT TEST Y FITNESS PROFILE ============

/**
 * Autor: Diego Jasso
 * Descripción: Envía las respuestas del test de posicionamiento para obtener plan personalizado.
 * Endpoint: POST /api/v1/placement-test
 * Parámetros:
 *   @param {object} testData - Respuestas del test:
 *     - age (number): Edad del usuario
 *     - gender (string): Género
 *     - exercise_freq (number): Frecuencia de ejercicio (días/semana)
 *     - activity_type (string): Tipo de actividad preferida
 *     - activity_intensity (string): Intensidad de actividad
 *     - diet_type (string): Tipo de dieta
 *     - diet_special (string): Consideraciones dietéticas especiales
 *     - supplements (string): Suplementos actuales
 *     - goal_declared (string): Objetivo fitness declarado
 *     - sleep_hours (number): Horas de sueño promedio
 * Retorna: Plan recomendado, descripción y atributos del perfil fitness
 */
export const submitPlacementTest = (testData) => apiFetch(API_ENDPOINTS.PLACEMENT_TEST, {
    method: "POST",
    body: JSON.stringify(testData)
});

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene el perfil fitness del usuario autenticado.
 * Endpoint: GET /api/v1/placement-test/fitness-profile
 * Retorna: Información completa del perfil fitness incluyendo:
 *          - Fecha del test
 *          - Atributos físicos (altura, peso, BMI)
 *          - Nivel de actividad y objetivos fitness
 *          - Restricciones dietéticas
 */
export const getFitnessProfile = () => apiFetch(API_ENDPOINTS.FITNESS_PROFILE);

// ============ BÚSQUEDA Y FILTROS ============

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Busca y filtra productos con múltiples criterios.
 * Endpoint: GET /api/v1/search
 * Parámetros:
 *   @param {object} params - Parámetros de búsqueda:
 *     - query (string, opcional): Término de búsqueda
 *     - page (number): Número de página (default: 1)
 *     - limit (number): Items por página (default: 10, max: 100)
 *     - category (string, opcional): Filtrar por categoría
 *     - fitness_objective (string, opcional): Filtrar por objetivo fitness
 *     - physical_activity (string, opcional): Filtrar por actividad física
 *     - min_price (number, opcional): Precio mínimo
 *     - max_price (number, opcional): Precio máximo
 *     - is_active (boolean): Solo productos activos (default: true)
 * Retorna: items (productos), total, page, limit, total_pages
 */
export const searchProducts = (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`${API_ENDPOINTS.SEARCH_PRODUCTS}?${queryString}`);
};

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene todos los filtros disponibles para búsqueda.
 * Endpoint: GET /api/v1/search/filters
 * Retorna: Listas de categorías, actividades físicas y objetivos fitness disponibles
 */
export const getAvailableFilters = () => apiFetch(API_ENDPOINTS.SEARCH_FILTERS);

// ============ PRODUCTOS ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene los detalles completos de un producto específico.
 * Endpoint: GET /api/v1/products/{product_id}
 * Parámetros:
 *   @param {number} productId - ID del producto a consultar
 * Retorna: Información completa del producto (nombre, precio, imágenes, stock, etc.)
 */
export const getProductDetail = (productId) => apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(productId));

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene productos relacionados basados en categoría y objetivos fitness.
 * Endpoint: GET /api/v1/products/{product_id}/related
 * Parámetros:
 *   @param {number} productId - ID del producto de referencia
 *   @param {number} limit - Cantidad máxima de productos a retornar (default: 6)
 * Retorna: Lista de productos relacionados con información básica
 * Uso: Útil para recomendaciones en páginas de detalle o perfil fitness
 */
export const getRelatedProducts = (productId, limit = 6) => 
    apiFetch(API_ENDPOINTS.PRODUCT_RELATED(productId, limit));

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene las reseñas de un producto con paginación.
 * Endpoint: GET /api/v1/products/{product_id}/reviews
 * Parámetros:
 *   @param {number} productId - ID del producto
 *   @param {number} page - Número de página (default: 1)
 *   @param {number} limit - Reseñas por página (default: 10)
 * Retorna: Lista de reseñas ordenadas por fecha (más recientes primero)
 */
export const getProductReviews = (productId, page = 1, limit = 10) => 
    apiFetch(API_ENDPOINTS.PRODUCT_REVIEWS(productId, page, limit));

/**
 * Autor: Diego Jasso
 * Descripción: Crea una nueva reseña para un producto (requiere autenticación).
 * Endpoint: POST /api/v1/products/{product_id}/reviews
 * Parámetros:
 *   @param {number} productId - ID del producto a reseñar
 *   @param {object} reviewData - Objeto con rating y texto de reseña
 *     - rating (number): Calificación de 1 a 5 estrellas
 *     - text (string): Comentario opcional del usuario
 * Retorna: Reseña creada con información del usuario
 * Excepciones: 400 si el usuario ya reseñó este producto
 */
export const createProductReview = (productId, reviewData) => 
    apiFetch(API_ENDPOINTS.PRODUCT_CREATE_REVIEW(productId), {
        method: "POST",
        body: JSON.stringify(reviewData)
    });

// ============ CARRITO DE COMPRAS ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene el carrito completo del usuario con todos sus items.
 * Endpoint: GET /api/v1/cart
 * Retorna: Carrito con lista de items, información de productos, subtotales y total
 */
export const getCart = () => apiFetch(API_ENDPOINTS.CART_GET);

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene un resumen rápido del carrito (total items y precio).
 * Endpoint: GET /api/v1/cart/summary
 * Retorna: total_items y total_price
 * Uso: Útil para badges del icono del carrito en el header
 */
export const getCartSummary = () => apiFetch(API_ENDPOINTS.CART_SUMMARY);

/**
 * Autor: Diego Jasso
 * Descripción: Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
 * Endpoint: POST /api/v1/cart/add
 * Parámetros:
 *   @param {number} productId - ID del producto a agregar
 *   @param {number} quantity - Cantidad a agregar (default: 1)
 * Retorna: Item del carrito creado/actualizado con información del producto
 * Excepciones: 400 si no hay stock suficiente
 */
export const addItemToCart = (productId, quantity = 1) => 
    apiFetch(API_ENDPOINTS.CART_ADD_ITEM, {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity })
    });

/**
 * Autor: Diego Jasso
 * Descripción: Actualiza la cantidad de un item específico en el carrito.
 * Endpoint: PUT /api/v1/cart/{cart_item_id}
 * Parámetros:
 *   @param {number} cartItemId - ID del item del carrito
 *   @param {number} quantity - Nueva cantidad
 * Retorna: Item actualizado con subtotal recalculado
 * Excepciones: 400 si no hay stock suficiente o 404 si el item no existe
 */
export const updateCartItem = (cartItemId, quantity) => 
    apiFetch(API_ENDPOINTS.CART_UPDATE_ITEM(cartItemId), {
        method: "PUT",
        body: JSON.stringify({ quantity })
    });

/**
 * Autor: Diego Jasso
 * Descripción: Elimina un item específico del carrito.
 * Endpoint: DELETE /api/v1/cart/{cart_item_id}
 * Parámetros:
 *   @param {number} cartItemId - ID del item a eliminar
 * Retorna: null (204 No Content)
 */
export const removeItemFromCart = (cartItemId) => 
    apiFetch(API_ENDPOINTS.CART_REMOVE_ITEM(cartItemId), {
        method: "DELETE"
    });

/**
 * Autor: Diego Jasso
 * Descripción: Vacía completamente el carrito eliminando todos los items.
 * Endpoint: DELETE /api/v1/cart/actions/clear
 * Retorna: null (204 No Content)
 * Uso: Llamar después de confirmar un pago exitoso
 */
export const clearCart = () => apiFetch(API_ENDPOINTS.CART_CLEAR, {
    method: "DELETE"
});

/**
 * Autor: Diego Jasso
 * Descripción: Valida que todos los productos del carrito tengan stock suficiente.
 * Endpoint: GET /api/v1/cart/validate
 * Retorna: { valid: boolean, issues: array } con lista de problemas si existen
 * Uso: Llamar antes de proceder al checkout
 */
export const validateCartStock = () => apiFetch(API_ENDPOINTS.CART_VALIDATE);

// ============ DIRECCIONES DE ENVÍO ============

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene todas las direcciones del usuario.
 * Endpoint: GET /api/v1/addresses
 * Retorna: Lista de direcciones con información completa
 */
export const getAddresses = () => apiFetch(API_ENDPOINTS.ADDRESSES_LIST);

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene una dirección específica por ID.
 * Endpoint: GET /api/v1/addresses/{address_id}
 * Parámetros:
 *   @param {number} addressId - ID de la dirección
 * Retorna: Información completa de la dirección
 * Excepciones: 404 si la dirección no existe o no pertenece al usuario
 */
export const getAddressById = (addressId) => apiFetch(API_ENDPOINTS.ADDRESSES_DETAIL(addressId));

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Crea una nueva dirección de envío.
 * Endpoint: POST /api/v1/addresses
 * Parámetros:
 *   @param {object} addressData - Datos de la dirección:
 *     - address_name (string): Nombre descriptivo (ej: "Casa", "Oficina")
 *     - address_line1 (string): Línea 1 de la dirección
 *     - address_line2 (string, opcional): Línea 2 (depto, piso, etc.)
 *     - country (string): País
 *     - state (string): Estado/Provincia
 *     - city (string): Ciudad
 *     - zip_code (string): Código postal
 *     - recipient_name (string): Nombre del destinatario
 *     - phone_number (string): Teléfono de contacto
 *     - is_default (boolean): Si es la dirección predeterminada
 * Retorna: Dirección creada
 */
export const createAddress = (addressData) => 
    apiFetch(API_ENDPOINTS.ADDRESSES_CREATE, {
        method: "POST",
        body: JSON.stringify(addressData)
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Actualiza una dirección existente.
 * Endpoint: PUT /api/v1/addresses/{address_id}
 * Parámetros:
 *   @param {number} addressId - ID de la dirección a actualizar
 *   @param {object} addressData - Campos a actualizar (mismos que createAddress)
 * Retorna: Dirección actualizada
 */
export const updateAddress = (addressId, addressData) => 
    apiFetch(API_ENDPOINTS.ADDRESSES_UPDATE(addressId), {
        method: "PUT",
        body: JSON.stringify(addressData)
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Elimina una dirección.
 * Endpoint: DELETE /api/v1/addresses/{address_id}
 * Parámetros:
 *   @param {number} addressId - ID de la dirección a eliminar
 * Retorna: Mensaje de confirmación
 */
export const deleteAddress = (addressId) => 
    apiFetch(API_ENDPOINTS.ADDRESSES_DELETE(addressId), {
        method: "DELETE"
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Establece una dirección como predeterminada.
 * Endpoint: PATCH /api/v1/addresses/{address_id}/set-default
 * Parámetros:
 *   @param {number} addressId - ID de la dirección a marcar como predeterminada
 * Retorna: Dirección actualizada
 */
export const setDefaultAddress = (addressId) => 
    apiFetch(API_ENDPOINTS.ADDRESSES_SET_DEFAULT(addressId), {
        method: "PATCH"
    });

// ============ MÉTODOS DE PAGO ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene todos los métodos de pago guardados del usuario.
 * Endpoint: GET /api/v1/payment-methods
 * Retorna: Lista de tarjetas guardadas con últimos 4 dígitos y marca
 */
export const getPaymentMethods = () => apiFetch(API_ENDPOINTS.PAYMENT_METHODS_LIST);

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene un método de pago específico.
 * Endpoint: GET /api/v1/payment-methods/{payment_id}
 * Parámetros:
 *   @param {number} paymentId - ID del método de pago
 * Retorna: Información del método de pago
 */
export const getPaymentMethodById = (paymentId) => 
    apiFetch(API_ENDPOINTS.PAYMENT_METHODS_DETAIL(paymentId));

/**
 * Autor: Diego Jasso
 * Descripción: Crea un Setup Intent de Stripe para agregar una tarjeta.
 * Endpoint: POST /api/v1/payment-methods/setup-intent
 * Retorna: client_secret y setup_intent_id para usar con Stripe Elements
 * Uso: Llamar antes de mostrar el formulario de tarjeta de Stripe
 */
export const createSetupIntent = () => 
    apiFetch(API_ENDPOINTS.PAYMENT_METHODS_SETUP_INTENT, {
        method: "POST"
    });

/**
 * Autor: Diego Jasso
 * Descripción: Guarda un método de pago después de completar el Setup Intent.
 * Endpoint: POST /api/v1/payment-methods/save
 * Parámetros:
 *   @param {string} paymentMethodId - ID del método de pago de Stripe
 *   @param {boolean} isDefault - Si será el método predeterminado
 * Retorna: Método de pago guardado
 */
export const savePaymentMethod = (paymentMethodId, isDefault = false) => 
    apiFetch(API_ENDPOINTS.PAYMENT_METHODS_SAVE, {
        method: "POST",
        body: JSON.stringify({ payment_method_id: paymentMethodId, is_default: isDefault })
    });

/**
 * Autor: Diego Jasso
 * Descripción: Elimina un método de pago (también lo elimina de Stripe).
 * Endpoint: DELETE /api/v1/payment-methods/{payment_id}
 * Parámetros:
 *   @param {number} paymentId - ID del método de pago a eliminar
 * Retorna: Mensaje de confirmación
 */
export const deletePaymentMethod = (paymentId) => 
    apiFetch(API_ENDPOINTS.PAYMENT_METHODS_DELETE(paymentId), {
        method: "DELETE"
    });

/**
 * Autor: Diego Jasso
 * Descripción: Establece un método de pago como predeterminado.
 * Endpoint: PATCH /api/v1/payment-methods/{payment_id}/set-default
 * Parámetros:
 *   @param {number} paymentId - ID del método de pago
 * Retorna: Método de pago actualizado
 */
export const setDefaultPaymentMethod = (paymentId) => 
    apiFetch(API_ENDPOINTS.PAYMENT_METHODS_SET_DEFAULT(paymentId), {
        method: "PATCH"
    });

// ============ PROGRAMA DE LEALTAD ============

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene el estado de lealtad del usuario actual.
 * Endpoint: GET /api/v1/loyalty/me
 * Retorna: Puntos actuales, nivel, progreso al siguiente tier, beneficios
 */
export const getLoyaltyStatus = () => apiFetch(API_ENDPOINTS.LOYALTY_STATUS);

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene todos los niveles de lealtad disponibles.
 * Endpoint: GET /api/v1/loyalty/tiers
 * Retorna: Lista de tiers con requisitos y beneficios
 */
export const getLoyaltyTiers = () => apiFetch(API_ENDPOINTS.LOYALTY_TIERS);

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene información detallada de un tier específico.
 * Endpoint: GET /api/v1/loyalty/tiers/{tier_id}
 * Parámetros:
 *   @param {number} tierId - ID del tier
 * Retorna: Información completa del tier
 */
export const getLoyaltyTierDetail = (tierId) => 
    apiFetch(API_ENDPOINTS.LOYALTY_TIER_DETAIL(tierId));

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene el historial de puntos del usuario.
 * Endpoint: GET /api/v1/loyalty/me/history
 * Parámetros:
 *   @param {number} limit - Cantidad máxima de registros (default: 50, max: 100)
 * Retorna: Lista de transacciones de puntos ordenadas por fecha
 */
export const getPointHistory = (limit = 50) => {
    const queryString = new URLSearchParams({ limit }).toString();
    return apiFetch(`${API_ENDPOINTS.LOYALTY_HISTORY}?${queryString}`);
};

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Procesa la expiración de puntos del usuario.
 * Endpoint: POST /api/v1/loyalty/me/expire-points
 * Retorna: Resultado de la expiración con puntos expirados
 */
export const expirePoints = () => 
    apiFetch(API_ENDPOINTS.LOYALTY_EXPIRE_POINTS, {
        method: "POST"
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Genera cupones mensuales para un usuario (ADMIN).
 * Endpoint: POST /api/v1/loyalty/{user_id}/coupons/generate
 * Parámetros:
 *   @param {number} userId - ID del usuario
 * Retorna: Lista de códigos de cupón generados
 */
export const generateMonthlyCoupons = (userId) => 
    apiFetch(API_ENDPOINTS.LOYALTY_GENERATE_COUPONS(userId), {
        method: "POST"
    });

// ============ ÓRDENES ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene todas las órdenes del usuario con paginación.
 * Endpoint: GET /api/v1/orders
 * Parámetros:
 *   @param {number} limit - Cantidad de órdenes por página (default: 50, max: 100)
 *   @param {number} offset - Cantidad de órdenes a omitir (para paginación)
 * Retorna: Lista de órdenes y total encontrado
 */
export const getOrders = (limit = 50, offset = 0) => {
    const queryString = new URLSearchParams({ limit, offset }).toString();
    return apiFetch(`${API_ENDPOINTS.ORDERS_LIST}?${queryString}`);
};

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene los detalles completos de una orden específica.
 * Endpoint: GET /api/v1/orders/{order_id}
 * Parámetros:
 *   @param {number} orderId - ID de la orden
 * Retorna: Orden detallada con productos, dirección, totales y estado
 * Excepciones: 404 si la orden no existe o no pertenece al usuario
 */
export const getOrderDetail = (orderId) => apiFetch(API_ENDPOINTS.ORDERS_DETAIL(orderId));

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene únicamente las órdenes de suscripción del usuario.
 * Endpoint: GET /api/v1/orders/subscription/all
 * Retorna: Lista de órdenes marcadas como suscripciones
 */
export const getSubscriptionOrders = () => apiFetch(API_ENDPOINTS.ORDERS_SUBSCRIPTION);

/**
 * Autor: Diego Jasso
 * Descripción: Cancela una orden (solo si no ha sido enviada).
 * Endpoint: POST /api/v1/orders/{order_id}/cancel
 * Parámetros:
 *   @param {number} orderId - ID de la orden a cancelar
 *   @param {string} reason - Razón de la cancelación
 * Retorna: Resultado de la cancelación
 * Excepciones: 400 si la orden ya fue enviada o no se puede cancelar
 */
export const cancelOrder = (orderId, reason) => 
    apiFetch(API_ENDPOINTS.ORDERS_CANCEL(orderId), {
        method: "POST",
        body: JSON.stringify({ reason })
    });

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene el estado actual de una orden.
 * Endpoint: GET /api/v1/orders/{order_id}/status
 * Parámetros:
 *   @param {number} orderId - ID de la orden
 * Retorna: Estado actual y número de rastreo si está disponible
 */
export const getOrderStatus = (orderId) => apiFetch(API_ENDPOINTS.ORDERS_STATUS(orderId));

// ============ PROCESO DE PAGO (CHECKOUT) ============

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Obtiene el resumen del checkout con cálculo de totales.
 * Endpoint: POST /api/v1/checkout/summary
 * Parámetros:
 *   @param {number} addressId - ID de la dirección de envío
 *   @param {string} couponCode - Código de cupón (opcional)
 * Retorna: Subtotal, envío, descuentos, total y puntos estimados
 */
export const getCheckoutSummary = (addressId, couponCode = null) => 
    apiFetch(API_ENDPOINTS.CHECKOUT_SUMMARY, {
        method: "POST",
        body: JSON.stringify({ address_id: addressId, coupon_code: couponCode })
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Crea una sesión de pago con Stripe.
 * Endpoint: POST /api/v1/checkout/stripe
 * Parámetros:
 *   @param {object} checkoutData - Datos del checkout:
 *     - address_id (number): ID de la dirección de envío
 *     - payment_method_id (number, opcional): ID del método de pago guardado
 *     - coupon_code (string, opcional): Código de cupón
 *     - subscription_id (number, opcional): ID de suscripción si aplica
 * Retorna: URL de Stripe Checkout o client_secret para payment intent
 */
export const createStripeCheckout = (checkoutData) => 
    apiFetch(API_ENDPOINTS.CHECKOUT_STRIPE, {
        method: "POST",
        body: JSON.stringify(checkoutData)
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Inicializa el proceso de pago con PayPal.
 * Endpoint: POST /api/v1/checkout/paypal/init
 * Parámetros:
 *   @param {object} paypalData - Datos del checkout:
 *     - address_id (number): ID de la dirección de envío
 *     - coupon_code (string, opcional): Código de cupón
 * Retorna: URL de aprobación de PayPal y datos del resumen
 */
export const initializePayPalCheckout = (paypalData) => 
    apiFetch(API_ENDPOINTS.CHECKOUT_PAYPAL_INIT, {
        method: "POST",
        body: JSON.stringify(paypalData)
    });

/**
 * Autor: Ricardo Rodriguez
 * Descripción: Captura el pago de PayPal después de la aprobación del usuario.
 * Endpoint: POST /api/v1/checkout/paypal/capture
 * Parámetros:
 *   @param {object} captureData - Datos de captura:
 *     - paypal_order_id (string): ID de la orden de PayPal
 *     - address_id (number): ID de la dirección de envío
 *     - coupon_code (string, opcional): Código de cupón
 * Retorna: Resultado de la captura con datos de la orden creada
 */
export const capturePayPalPayment = (captureData) => 
    apiFetch(API_ENDPOINTS.CHECKOUT_PAYPAL_CAPTURE, {
        method: "POST",
        body: JSON.stringify(captureData)
    });

// ============ ADMINISTRACIÓN DE PRODUCTOS (ADMIN) ============

/**
 * Autor: Diego Jasso
 * Descripción: Crea un nuevo producto con sus imágenes (requiere rol admin).
 * Endpoint: POST /api/v1/admin/products
 * Parámetros:
 *   @param {FormData} formData - FormData con campos del producto e imágenes
 * Retorna: Producto creado con todas sus relaciones
 * Nota: Usa FormData para soportar upload de múltiples imágenes
 */
export const createProduct = (formData) => {
    const token = localStorage.getItem("token");
    return fetch(`${API_BASE}${API_ENDPOINTS.ADMIN_PRODUCTS_CREATE}`, {
        method: "POST",
        headers: {
            ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: formData
    }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || data.message || `Error ${res.status}`);
        return data;
    });
};

/**
 * Autor: Diego Jasso
 * Descripción: Actualiza un producto existente (requiere rol admin).
 * Endpoint: PUT /api/v1/admin/products/{product_id}
 * Parámetros:
 *   @param {number} productId - ID del producto a actualizar
 *   @param {object} productData - Campos a actualizar (todos opcionales)
 * Retorna: Producto actualizado
 */
export const updateProduct = (productId, productData) => 
    apiFetch(API_ENDPOINTS.ADMIN_PRODUCTS_UPDATE(productId), {
        method: "PUT",
        body: JSON.stringify(productData)
    });

/**
 * Autor: Diego Jasso
 * Descripción: Elimina un producto (requiere rol admin).
 * Endpoint: DELETE /api/v1/admin/products/{product_id}
 * Parámetros:
 *   @param {number} productId - ID del producto a eliminar
 *   @param {boolean} hardDelete - Si es true, elimina permanentemente (default: false)
 * Retorna: null (204 No Content)
 */
export const deleteProduct = (productId, hardDelete = false) => {
    const queryString = hardDelete ? "?hard_delete=true" : "";
    return apiFetch(`${API_ENDPOINTS.ADMIN_PRODUCTS_DELETE(productId)}${queryString}`, {
        method: "DELETE"
    });
};

/**
 * Autor: Diego Jasso
 * Descripción: Realiza operaciones en lote sobre múltiples productos (requiere rol admin).
 * Endpoint: POST /api/v1/admin/products/bulk-action
 * Parámetros:
 *   @param {object} bulkData - Datos de la operación en lote:
 *     - product_ids (array): Lista de IDs de productos
 *     - action (string): Acción a realizar ('activate', 'deactivate', 'delete')
 * Retorna: Resultado con cantidad de éxitos, fallos y lista de errores
 */
export const bulkProductAction = (bulkData) => 
    apiFetch(API_ENDPOINTS.ADMIN_PRODUCTS_BULK_ACTION, {
        method: "POST",
        body: JSON.stringify(bulkData)
    });

// ============ ANALYTICS Y REPORTES (ADMIN) ============

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene todas las estadísticas del dashboard administrativo.
 * Endpoint: GET /api/v1/analytics/dashboard
 * Retorna: Estadísticas de ventas, usuarios, productos y reviews pendientes
 * Nota: Requiere rol de administrador
 */
export const getDashboardStats = () => apiFetch(API_ENDPOINTS.ANALYTICS_DASHBOARD);

/**
 * Autor: Diego Jasso
 * Descripción: Genera un reporte de ventas para un período específico.
 * Endpoint: GET /api/v1/analytics/reports/sales
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (ISO format, opcional)
 *   @param {string} endDate - Fecha de fin (ISO format, opcional)
 * Retorna: Reporte con totales, productos más vendidos y gráficas
 */
export const getSalesReport = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`${API_ENDPOINTS.ANALYTICS_SALES_REPORT}${queryString ? `?${queryString}` : ""}`);
};

/**
 * Autor: Diego Jasso
 * Descripción: Genera un reporte de productos con métricas de ventas.
 * Endpoint: GET /api/v1/analytics/reports/products
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (opcional)
 *   @param {string} endDate - Fecha de fin (opcional)
 * Retorna: Lista de productos con ventas totales, ingresos, stock y rating
 */
export const getProductsReport = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`${API_ENDPOINTS.ANALYTICS_PRODUCTS_REPORT}${queryString ? `?${queryString}` : ""}`);
};

/**
 * Autor: Diego Jasso
 * Descripción: Obtiene productos con stock bajo.
 * Endpoint: GET /api/v1/analytics/products/low-stock
 * Parámetros:
 *   @param {number} threshold - Umbral de stock bajo (default: 10)
 * Retorna: Lista de productos con stock por debajo del umbral
 */
export const getLowStockProducts = (threshold = 10) => {
    const queryString = new URLSearchParams({ threshold }).toString();
    return apiFetch(`${API_ENDPOINTS.ANALYTICS_LOW_STOCK}?${queryString}`);
};

/**
 * Autor: Diego Jasso
 * Descripción: Descarga el reporte de ventas en formato CSV.
 * Endpoint: GET /api/v1/analytics/reports/sales/export/csv
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (opcional)
 *   @param {string} endDate - Fecha de fin (opcional)
 * Retorna: Archivo CSV para descargar
 */
export const downloadSalesReportCSV = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_BASE}${API_ENDPOINTS.ANALYTICS_SALES_CSV}${queryString ? `?${queryString}` : ""}`, '_blank');
};

/**
 * Autor: Diego Jasso
 * Descripción: Descarga el reporte de ventas en formato PDF.
 * Endpoint: GET /api/v1/analytics/reports/sales/export/pdf
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (opcional)
 *   @param {string} endDate - Fecha de fin (opcional)
 * Retorna: Archivo PDF para descargar
 */
export const downloadSalesReportPDF = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_BASE}${API_ENDPOINTS.ANALYTICS_SALES_PDF}${queryString ? `?${queryString}` : ""}`, '_blank');
};

/**
 * Autor: Diego Jasso
 * Descripción: Descarga el reporte de productos en formato CSV.
 * Endpoint: GET /api/v1/analytics/reports/products/export/csv
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (opcional)
 *   @param {string} endDate - Fecha de fin (opcional)
 * Retorna: Archivo CSV para descargar
 */
export const downloadProductsReportCSV = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_BASE}${API_ENDPOINTS.ANALYTICS_PRODUCTS_CSV}${queryString ? `?${queryString}` : ""}`, '_blank');
};

/**
 * Autor: Diego Jasso
 * Descripción: Descarga el reporte de productos en formato PDF.
 * Endpoint: GET /api/v1/analytics/reports/products/export/pdf
 * Parámetros:
 *   @param {string} startDate - Fecha de inicio (opcional)
 *   @param {string} endDate - Fecha de fin (opcional)
 * Retorna: Archivo PDF para descargar
 */
export const downloadProductsReportPDF = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_BASE}${API_ENDPOINTS.ANALYTICS_PRODUCTS_PDF}${queryString ? `?${queryString}` : ""}`, '_blank');
};

/**
 * Autor: Diego Jasso
 * Descripción: Descarga el reporte de stock bajo en formato CSV.
 * Endpoint: GET /api/v1/analytics/reports/low-stock/export/csv
 * Parámetros:
 *   @param {number} threshold - Umbral de stock bajo (default: 10)
 * Retorna: Archivo CSV para descargar
 */
export const downloadLowStockReportCSV = (threshold = 10) => {
    const queryString = new URLSearchParams({ threshold }).toString();
    window.open(`${API_BASE}${API_ENDPOINTS.ANALYTICS_LOW_STOCK_CSV}?${queryString}`, '_blank');
};
