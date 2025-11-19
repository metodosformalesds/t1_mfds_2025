// utils/auth.js

/**
 * Verifica si un usuario está autenticado revisando si existe un access_token
 * y si no ha expirado.
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("expires_at") || 0);

  if (!token) return false;
  if (expiresAt && Date.now() > expiresAt) return false;

  return true;
};


/**
 * Cierra sesión limpiando los tokens relevantes.
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
};
