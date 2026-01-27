import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRouteUser = ({ children }) => {
  const { isAuthenticated, loading, token } = useSelector((state) => state.userAuth);

  // Si hay token y está cargando, mostrar spinner
  if (token && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-sm text-primary-600">Cargando user...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado y no hay token, redirigir a login user
  if (!isAuthenticated && !token) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default ProtectedRouteUser;