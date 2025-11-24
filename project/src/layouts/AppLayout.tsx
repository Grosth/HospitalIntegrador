import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoles } from '../hooks/useRoles';
import { LogOut, LayoutDashboard, Package, ArrowLeftRight, History, Users } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { usuario, signOut } = useAuth();
  const { canManageEquipos, canManageUsuarios } = useRoles();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { path: '/equipos', label: 'Equipos', icon: Package, show: canManageEquipos },
    { path: '/registrar-entrada', label: 'Registrar Entrada', icon: ArrowLeftRight, show: true },
    { path: '/registrar-salida', label: 'Registrar Salida', icon: ArrowLeftRight, show: true },
    { path: '/historial', label: 'Historial', icon: History, show: true },
    { path: '/usuarios', label: 'Usuarios', icon: Users, show: canManageUsuarios },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-blue-900 text-white shadow-lg">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">Control de Equipos</h1>
          <p className="text-sm text-blue-200 mt-1">Hospital</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.filter(item => item.show).map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Sistema'}
            </h2>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="text-xs text-gray-500">{usuario?.rol?.nombre}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
