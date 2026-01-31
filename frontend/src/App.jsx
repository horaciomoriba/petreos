import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

import store from './redux/store/store'

import { loadUser } from './redux/slices/authSlice'
import { loadUserData } from './redux/slices/userAuthSlice'

import ProtectedRoute from './components/common/ProtectedRoute'
import ProtectedRouteUser from './components/common/ProtectedRouteUser'

import DashboardLayout from './components/layout/DashboardLayout'

import NotFound from './pages/NotFound';

import Login from './pages/auth/Login'
import LoginUser from './pages/auth/LoginUser';

import Dashboard from './pages/dashboard/Dashboard'
import DashboardOperador from './pages/operator/DashboardOperador'

import Sedes from './pages/sedes/Sedes'

import Vehiculos from './pages/vehiculos/Vehiculos'
import NuevoVehiculo from './pages/vehiculos/NuevoVehiculo'
import DetalleVehiculo from './pages/vehiculos/DetalleVehiculo'
import NuevaRevision from './pages/revisiones/NuevaRevision'
import CombustibleGeneral from './pages/vehiculos/CombustibleGeneral'

import Revisiones from './pages/revisiones/Revisiones'
import DetalleRevision from './pages/revisiones/DetalleRevision'
import TiposRevision from './pages/tipos-revision/TiposRevision'
import NuevoTipoRevision from './pages/tipos-revision/NuevoTipoRevision'
import DetalleTipoRevision from './pages/tipos-revision/DetalleTipoRevision'
import EditarTipoRevision from './pages/tipos-revision/EditarTipoRevision'

import Usuarios from './pages/usuarios/Usuarios';
import NuevoAdmin from './pages/usuarios/NuevoAdmin';
import NuevoOperador from './pages/usuarios/NuevoOperador';
import EditarAdmin from './pages/usuarios/EditarAdmin';
import EditarOperador from './pages/usuarios/EditarOperador';

import Areas from './pages/areas/Areas';
import NuevaArea from './pages/areas/NuevaArea';

import MiVehiculo from './pages/operator/MiVehiculo';
import NuevaRevisionOperador from './pages/operator/NuevaRevisionOperador';
import MisRevisiones from './pages/operator/MisRevisiones';
import DetalleRevisionOperador from './pages/operator/DetalleRevisionOperador';

import Reparaciones from './pages/reparaciones/Reparaciones'
import NuevaReparacion from './pages/reparaciones/NuevaReparacion'
import DetalleReparacion from './pages/reparaciones/DetalleReparacion'
import EditarReparacion from './pages/reparaciones/EditarReparacion'

import Actividades from './pages/activities/Actividades'

// Componente interno que tiene acceso a dispatch
function AppContent() {
  const dispatch = useDispatch();
  const { token: adminToken, user: adminUser } = useSelector((state) => state.auth);
  const { token: userToken, user: userData } = useSelector((state) => state.userAuth); // ← AGREGAR

  // useEffect para ADMIN
  useEffect(() => {
    if (adminToken && !adminUser) {
      dispatch(loadUser());
    }
  }, [dispatch, adminToken, adminUser]);

  // useEffect para OPERADOR ← AGREGAR ESTE USEEFFECT COMPLETO
  useEffect(() => {
    if (userToken && !userData) {
      console.log('🚀 Cargando datos del operador...');
      dispatch(loadUserData());
    }
  }, [dispatch, userToken, userData]);
  return (
    <Router>
      <Routes>

        {/* Login Admin */}
        <Route path="/login" element={<Login />} />
        
        {/* Login Operador */}
        <Route path="/user/login" element={<LoginUser />} />
                
        {/* Rutas con Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/actividades"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Actividades />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sedes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sedes />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Vehiculos />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/combustible"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CombustibleGeneral />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/nuevo"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevoVehiculo />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehiculos/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DetalleVehiculo />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== REVISIONES ===== */}
        <Route
          path="/revisiones/nueva"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevaRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revisiones"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Revisiones />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revisiones/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DetalleRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        
        {/* ===== REPARACIONES ===== */}
        <Route
          path="/reparaciones"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reparaciones />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reparaciones/nueva"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevaReparacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reparaciones/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DetalleReparacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reparaciones/:id/editar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditarReparacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

     

        {/* ===== TIPOS DE REVISIÓN ===== */}
        <Route
          path="/tipos-revision"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TiposRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tipos-revision/nuevo"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevoTipoRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tipos-revision/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DetalleTipoRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tipos-revision/:id/editar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditarTipoRevision />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== USUARIOS ===== */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Usuarios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/nuevo-admin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevoAdmin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/nuevo-operador"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevoOperador />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/editar-admin/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditarAdmin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/usuarios/editar-operador/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditarOperador />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        
        {/* ===== AREAS ===== */}
        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Areas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas/nueva"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevaArea />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== RUTAS OPERADOR (sin layout por ahora, después agregaremos) ===== */}
        <Route
          path="/operador/dashboard"
          element={
            <ProtectedRouteUser>
              <DashboardOperador />
            </ProtectedRouteUser>
          }
        />

        <Route
          path="/operador/mi-vehiculo"
          element={
            <ProtectedRouteUser>
              <MiVehiculo />
            </ProtectedRouteUser>
          }
        />
        <Route
          path="/operador/nueva-revision"
          element={
            <ProtectedRouteUser>
              <NuevaRevisionOperador />
            </ProtectedRouteUser>
          }
        />
        <Route
          path="/operador/mis-revisiones"
          element={
            <ProtectedRouteUser>
              <MisRevisiones />
            </ProtectedRouteUser>
          }
        />
        <Route
          path="/operador/revisiones/:id"
          element={
            <ProtectedRouteUser>
              <DetalleRevisionOperador />
            </ProtectedRouteUser>
          }
        />




      
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#212529',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#212529',
              secondary: '#ffffff',
            },
            style: {
              background: '#f1f3f5',
              border: '1px solid #495057',
            },
          },
          error: {
            iconTheme: {
              primary: '#343a40',
              secondary: '#ffffff',
            },
            style: {
              background: '#343a40',
              color: '#ffffff',
              border: '1px solid #212529',
            },
          },
        }}
      />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App