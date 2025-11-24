import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { EquipoExterno } from '../types/domain';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export function EquiposListPage() {
  const [equipos, setEquipos] = useState<EquipoExterno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const { data, error } = await supabase
        .from('equipos_externos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipos(data || []);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return;

    try {
      const { error } = await supabase
        .from('equipos_externos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadEquipos();
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      alert('Error al eliminar el equipo');
    }
  };

  const filteredEquipos = equipos.filter(equipo =>
    equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.empresa_tercero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando equipos...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Equipos Externos</h2>
            <p className="text-gray-600">Gestión de equipos de terceros</p>
          </div>
          <button
            onClick={() => navigate('/equipos/nuevo')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <Plus size={20} />
            <span>Nuevo Equipo</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por marca, modelo, serial o empresa..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Marca</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Serial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{equipo.tipo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{equipo.marca}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{equipo.modelo}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{equipo.serial}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{equipo.empresa_tercero}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        equipo.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {equipo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/equipos/editar/${equipo.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(equipo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEquipos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No se encontraron equipos con ese criterio' : 'No hay equipos registrados'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
