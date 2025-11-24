import { useState, useEffect } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { RegistroMovimiento } from '../types/domain';
import { Search, Filter, Calendar, Eye } from 'lucide-react';

export function HistorialMovimientosPage() {
  const [movimientos, setMovimientos] = useState<RegistroMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    marca: '',
    empresa: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  const [selectedMovimiento, setSelectedMovimiento] = useState<RegistroMovimiento | null>(null);

  useEffect(() => {
    loadMovimientos();
  }, []);

  const loadMovimientos = async () => {
    try {
      let query = supabase
        .from('registros_movimiento')
        .select(`
          *,
          equipo:equipos_externos(*),
          usuario:usuarios(nombre, apellido)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setMovimientos(data || []);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovimientos = movimientos.filter(mov => {
    if (filters.estado && mov.estado !== filters.estado) return false;
    if (filters.marca && !mov.equipo?.marca.toLowerCase().includes(filters.marca.toLowerCase())) return false;
    if (filters.empresa && !mov.equipo?.empresa_tercero.toLowerCase().includes(filters.empresa.toLowerCase())) return false;
    if (filters.fechaDesde && new Date(mov.fecha_hora_entrada) < new Date(filters.fechaDesde)) return false;
    if (filters.fechaHasta && new Date(mov.fecha_hora_entrada) > new Date(filters.fechaHasta)) return false;
    return true;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Historial de Movimientos</h2>
          <p className="text-gray-600">Registro completo de entradas y salidas de equipos</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-500" />
            <h3 className="font-semibold text-gray-800">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                value={filters.marca}
                onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
                placeholder="Buscar marca..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                value={filters.empresa}
                onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
                placeholder="Buscar empresa..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Área</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Salida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{mov.equipo?.marca} {mov.equipo?.modelo}</p>
                        <p className="text-xs text-gray-500">{mov.equipo?.serial}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mov.equipo?.empresa_tercero}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mov.area_destino}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        mov.estado === 'ENTRADA'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {mov.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(mov.fecha_hora_entrada).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {mov.fecha_hora_salida ? new Date(mov.fecha_hora_salida).toLocaleString('es-ES') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedMovimiento(mov)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMovimientos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No se encontraron movimientos con los filtros aplicados
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMovimiento(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Detalle del Movimiento</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipo</p>
                  <p className="text-gray-900">{selectedMovimiento.equipo?.marca} {selectedMovimiento.equipo?.modelo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Serial</p>
                  <p className="text-gray-900 font-mono">{selectedMovimiento.equipo?.serial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Empresa</p>
                  <p className="text-gray-900">{selectedMovimiento.equipo?.empresa_tercero}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Contacto</p>
                  <p className="text-gray-900">{selectedMovimiento.equipo?.contacto}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Área Destino</p>
                  <p className="text-gray-900">{selectedMovimiento.area_destino}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Motivo</p>
                  <p className="text-gray-900">{selectedMovimiento.motivo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedMovimiento.estado === 'ENTRADA'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedMovimiento.estado}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Registrado por</p>
                  <p className="text-gray-900">{selectedMovimiento.usuario?.nombre} {selectedMovimiento.usuario?.apellido}</p>
                </div>
              </div>
              {selectedMovimiento.observacion && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Observaciones</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedMovimiento.observacion}</p>
                </div>
              )}
              {selectedMovimiento.foto_url && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Fotografía</p>
                  <img
                    src={selectedMovimiento.foto_url}
                    alt="Foto del equipo"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedMovimiento(null)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
