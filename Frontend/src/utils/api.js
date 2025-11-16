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
    // User Profile
    USER_PROFILE: "/api/v1/user-profile/me",
    USER_PROFILE_BASIC: "/api/v1/user-profile/me/basic",
    USER_PROFILE_UPDATE: "/api/v1/user-profile/me",
    USER_PROFILE_IMAGE: "/api/v1/user-profile/me/image",
    USER_PROFILE_DELETE: "/api/v1/user-profile/me",
    
    // Fitness Profile
    FITNESS_PROFILE: "/api/v1/placement-test/fitness-profile",
    
    // Products
    PRODUCT_DETAIL: (productId) => `/api/v1/products/${productId}`,
    PRODUCT_RELATED: (productId, limit = 3) => `/api/v1/products/${productId}/related?limit=${limit}`,
    PRODUCT_REVIEWS: (productId, page = 1, limit = 10) => `/api/v1/products/${productId}/reviews?page=${page}&limit=${limit}`,
    PRODUCT_CREATE_REVIEW: (productId) => `/api/v1/products/${productId}/reviews`,
    
    // Auth
    AUTH_LOGIN: "/api/v1/auth/login",
    AUTH_REGISTER: "/api/v1/auth/register",
    AUTH_LOGOUT: "/api/v1/auth/logout",
};

/**
 * ============================================================================
 * HELPERS ESPECÍFICOS PARA ENDPOINTS COMUNES
 * ============================================================================
 * Funciones de conveniencia que encapsulan llamadas comunes al API.
 * Simplifican el uso desde componentes React y mantienen consistencia.
 */

// ============ USER PROFILE ============

/**
 * Descripción: Obtiene el perfil completo del usuario autenticado.
 * Endpoint: GET /api/v1/user-profile/me
 * Retorna: Información completa del usuario incluyendo email, nombre, foto, etc.
 */
export const getUserProfile = () => apiFetch(API_ENDPOINTS.USER_PROFILE);

/**
 * Descripción: Obtiene información básica del perfil del usuario.
 * Endpoint: GET /api/v1/user-profile/me/basic
 * Retorna: Versión reducida del perfil (útil para headers, avatares, etc.)
 */
export const getBasicUserProfile = () => apiFetch(API_ENDPOINTS.USER_PROFILE_BASIC);

/**
 * Descripción: Actualiza la información del perfil del usuario.
 * Endpoint: PUT /api/v1/user-profile/me
 * Parámetros:
 *   @param {object} data - Objeto con campos a actualizar (first_name, last_name, etc.)
 * Retorna: Perfil actualizado completo
 */
export const updateUserProfile = (data) => apiFetch(API_ENDPOINTS.USER_PROFILE_UPDATE, {
    method: "PUT",
    body: JSON.stringify(data)
});

/**
 * Descripción: Actualiza la imagen de perfil del usuario.
 * Endpoint: PUT /api/v1/user-profile/me/image
 * Parámetros:
 *   @param {File} imageFile - Archivo de imagen (jpeg, png, etc.)
 * Retorna: URL de la nueva imagen de perfil
 */
export const updateProfileImage = (imageFile) => apiUploadFile(
    API_ENDPOINTS.USER_PROFILE_IMAGE, 
    imageFile, 
    "profile_image"
);

/**
 * Descripción: Elimina la cuenta del usuario (soft delete).
 * Endpoint: DELETE /api/v1/user-profile/me
 * Retorna: Confirmación de eliminación
 * Nota: Esta acción desactiva la cuenta pero no elimina datos permanentemente.
 */
export const deleteUserAccount = () => apiFetch(API_ENDPOINTS.USER_PROFILE_DELETE, {
    method: "DELETE"
});

// ============ FITNESS PROFILE ============

/**
 * Descripción: Obtiene el perfil fitness del usuario autenticado.
 * Endpoint: GET /api/v1/placement-test/fitness-profile
 * Retorna: Información completa del perfil fitness incluyendo:
 *          - Fecha del test
 *          - Atributos físicos (altura, peso, BMI)
 *          - Nivel de actividad y objetivos fitness
 *          - Restricciones dietéticas
 */
export const getFitnessProfile = () => apiFetch(API_ENDPOINTS.FITNESS_PROFILE);

// ============ PRODUCTS ============

/**
 * Descripción: Obtiene los detalles completos de un producto específico.
 * Endpoint: GET /api/v1/products/{product_id}
 * Parámetros:
 *   @param {number} productId - ID del producto a consultar
 * Retorna: Información completa del producto (nombre, precio, imágenes, stock, etc.)
 */
export const getProductDetail = (productId) => apiFetch(API_ENDPOINTS.PRODUCT_DETAIL(productId));

/**
 * Descripción: Obtiene productos relacionados basados en categoría y objetivos fitness.
 * Endpoint: GET /api/v1/products/{product_id}/related
 * Parámetros:
 *   @param {number} productId - ID del producto de referencia
 *   @param {number} limit - Cantidad máxima de productos a retornar (default: 3)
 * Retorna: Lista de productos relacionados con información básica
 * Uso: Útil para recomendaciones en páginas de detalle o perfil fitness
 */
export const getRelatedProducts = (productId, limit = 3) => 
    apiFetch(API_ENDPOINTS.PRODUCT_RELATED(productId, limit));

/**
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
