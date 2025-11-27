import { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { Usuario, Rol } from '../types/domain';
import { Users, Edit, Plus } from 'lucide-react';

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);

  // estado para crear usuario
  const [showForm, setShowForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRolId, setNuevoRolId] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // si el usuario logueado es ADMIN
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    loadData();
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    try {
      setCheckingRole(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userData.user;
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select(
          `
          *,
          rol:roles(*)
        `
        )
        .eq('id', user.id)
        .single();

      if (perfilError) {
        console.error('Error obteniendo perfil del usuario actual:', perfilError);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(perfil?.rol?.nombre === 'ADMIN');
    } catch (err) {
      console.error('Error comprobando rol actual:', err);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usuariosRes, rolesRes] = await Promise.all([
        supabase
          .from('usuarios')
          .select(
            `
            *,
            rol:roles(*)
          `
          )
          .order('created_at', { ascending: false }),
        supabase.from('roles').select('*'),
      ]);

      if (usuariosRes.error) throw usuariosRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setUsuarios(usuariosRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (usuario: Usuario) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ estado: !usuario.estado })
        .eq('id', usuario.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!isAdmin) {
      setCreateError('No tienes permisos para crear usuarios.');
      return;
    }

    if (!nuevoRolId) {
      setCreateError('Debes seleccionar un rol.');
      return;
    }

    try {
      setCreating(true);

      // 1) Crear usuario en Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: nuevoEmail,
        password: nuevoPassword,
      });

      if (signUpError) {
        console.error('Error en signUp:', signUpError);
        throw new Error('No fue posible crear el usuario de autenticación.');
      }

      const user = signUpData.user;
      if (!user) {
        throw new Error('Supabase no devolvió el usuario creado.');
      }

      // 2) Insertar perfil en tabla usuarios
      const { error: perfilError } = await supabase.from('usuarios').insert({
        id: user.id,
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        email: nuevoEmail,
        estado: true,
        rol_id: nuevoRolId,
      });

      if (perfilError) {
        console.error('Error creando perfil:', perfilError);
        throw new Error('No fue posible guardar el perfil del usuario.');
      }

      // limpiar formulario y recargar lista
      setNuevoNombre('');
      setNuevoApellido('');
      setNuevoEmail('');
      setNuevoPassword('');
      setNuevoRolId('');
      setShowForm(false);
      await loadData();
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      setCreateError(error.message ?? 'Error al crear el usuario');
    } finally {
      setCreating(false);
    }
  };

  // Mientras verificamos rol, podemos mostrar loading ligero
  if (checkingRole || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Si NO es admin, bloquear página
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administración de usuarios del sistema</p>
          </div>

          {/* Botón solo visible para admin */}
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            <Plus size={18} />
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>
        </div>

        {/* Formulario de alta */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Registrar nuevo usuario
            </h3>

            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateUser}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={nuevoApellido}
                  onChange={(e) => setNuevoApellido(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@hospital.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={nuevoRolId}
                  onChange={(e) =>
                    setNuevoRolId(e.target.value ? Number(e.target.value) : '')
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating ? 'Guardando...' : 'Guardar usuario'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {usuario.rol?.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleEstado(usuario)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          usuario.estado
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay usuarios registrados
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
