import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated: adminAuth } = useSelector((state) => state.auth);
  const { isAuthenticated: userAuth } = useSelector((state) => state.userAuth);

  const handleGoBack = () => {
    if (userAuth) {
      navigate('/operador/dashboard');
    } else if (adminAuth) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        
        {/* Ilustración 404 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-primary-100 rounded-full mb-6">
            <svg className="w-20 h-20 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* 404 Grande */}
          <h1 className="text-9xl font-black text-primary-900 mb-2">404</h1>
          <div className="text-6xl mb-6">🔍</div>
        </div>

        {/* Mensaje */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <p className="text-sm text-gray-500">
            Verifica la URL o regresa al panel principal.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir al Dashboard
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver atrás
          </button>
        </div>

        {/* Links útiles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">¿Necesitas ayuda?</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {adminAuth && (
              <>
                <button
                  onClick={() => navigate('/vehiculos')}
                  className="text-primary-700 hover:text-primary-900 font-medium"
                >
                  Vehículos
                </button>
                <button
                  onClick={() => navigate('/revisiones')}
                  className="text-primary-700 hover:text-primary-900 font-medium"
                >
                  Revisiones
                </button>
                <button
                  onClick={() => navigate('/sedes')}
                  className="text-primary-700 hover:text-primary-900 font-medium"
                >
                  Sedes
                </button>
              </>
            )}
            {userAuth && (
              <>
                <button
                  onClick={() => navigate('/operador/mi-vehiculo')}
                  className="text-primary-700 hover:text-primary-900 font-medium"
                >
                  Mi Vehículo
                </button>
                <button
                  onClick={() => navigate('/operador/mis-revisiones')}
                  className="text-primary-700 hover:text-primary-900 font-medium"
                >
                  Mis Revisiones
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs text-gray-400">
            Fortya - Sistema de Gestión Industrial v1.0
          </p>
        </div>

      </div>
    </div>
  );
};

export default NotFound;