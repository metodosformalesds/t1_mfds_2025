{
/*
 * Autor: Diego Jasso
 * Componente: ProtectedRoute
 * Descripción: Componente de orden superior que garantiza la seguridad de las rutas. Verifica el estado de autenticación del usuario mediante la función 'isAuthenticated' y lo redirige a la página de login si no ha iniciado sesión.
 */
}
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
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar el contenido solicitado
  return children;
};
