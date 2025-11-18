/**
 * Componente de protección de rutas
 * Verifica si el usuario está autenticado antes de permitir el acceso
 * Si no está autenticado, redirige al login
 */
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Componente que protege rutas privadas
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @returns {React.ReactNode} Renderiza los hijos o redirige al login
 */
export const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, renderizar el contenido solicitado
  return children;
};
