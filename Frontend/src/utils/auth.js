/**
 * Utilidades de autenticación
 * Funciones para validar el estado de autenticación del usuario
 */

/**
 * Verifica si el usuario tiene un token de autenticación válido
 * @returns {boolean} true si existe un token en localStorage
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
