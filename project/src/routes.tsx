import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EquiposListPage } from './pages/EquiposListPage';
import { EquipoFormPage } from './pages/EquipoFormPage';
import { RegistrarEntradaPage } from './pages/RegistrarEntradaPage';
import { RegistrarSalidaPage } from './pages/RegistrarSalidaPage';
import { HistorialMovimientosPage } from './pages/HistorialMovimientosPage';
import { UsuariosPage } from './pages/UsuariosPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/equipos" element={
            <ProtectedRoute requireAdmin>
              <EquiposListPage />
            </ProtectedRoute>
          } />
          <Route path="/equipos/nuevo" element={
            <ProtectedRoute requireAdmin>
              <EquipoFormPage />
            </ProtectedRoute>
          } />
          <Route path="/equipos/editar/:id" element={
            <ProtectedRoute requireAdmin>
              <EquipoFormPage />
            </ProtectedRoute>
          } />
          <Route path="/registrar-entrada" element={
            <ProtectedRoute>
              <RegistrarEntradaPage />
            </ProtectedRoute>
          } />
          <Route path="/registrar-salida" element={
            <ProtectedRoute>
              <RegistrarSalidaPage />
            </ProtectedRoute>
          } />
          <Route path="/historial" element={
            <ProtectedRoute>
              <HistorialMovimientosPage />
            </ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute requireAdmin>
              <UsuariosPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
