import { useState, useEffect, FormEvent } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { RegistroMovimiento } from '../types/domain';
import { Save, AlertCircle } from 'lucide-react';

export function RegistrarSalidaPage() {
  const [registrosAbiertos, setRegistrosAbiertos] = useState<RegistroMovimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    loadRegistrosAbiertos();
  }, []);

  const loadRegistrosAbiertos = async () => {
    try {
      const { data, error } = await supabase
        .from('registros_movimiento')
        .select(`
          *,
          equipo:equipos_externos(*)
        `)
        .eq('estado', 'ENTRADA')
        .is('fecha_hora_salida', null)
        .order('fecha_hora_entrada', { ascending: false });

      if (error) throw error;
      setRegistrosAbiertos(data || []);
    } catch (error) {
      console.error('Error cargando registros:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRegistro) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('registros_movimiento')
        .update({
          fecha_hora_salida: new Date().toISOString(),
          estado: 'SALIDA',
          observacion: observacion || null,
        })
        .eq('id', parseInt(selectedRegistro));

      if (error) throw error;

      alert('Salida registrada exitosamente');
      setSelectedRegistro('');
      setObservacion('');
      loadRegistrosAbiertos();
    } catch (error) {
      console.error('Error registrando salida:', error);
      alert('Error al registrar la salida');
    } finally {
      setLoading(false);
    }
  };

  const selectedMovimiento = registrosAbiertos.find(r => r.id.toString() === selectedRegistro);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registrar Salida</h2>
          <p className="text-gray-600">Registre la salida de un equipo externo del hospital</p>
        </div>

        {registrosAbiertos.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">No hay equipos en el hospital</h3>
                <p className="text-yellow-700 text-sm">
                  No hay registros de entrada pendientes de salida.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione Equipo *
                </label>
                <select
                  value={selectedRegistro}
                  onChange={(e) => setSelectedRegistro(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Seleccione un equipo</option>
                  {registrosAbiertos.map((registro) => (
                    <option key={registro.id} value={registro.id}>
                      {registro.equipo?.marca} {registro.equipo?.modelo} - {registro.equipo?.serial}
                      {' '}(Entrada: {new Date(registro.fecha_hora_entrada).toLocaleString('es-ES')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMovimiento && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900 mb-2">Información de Entrada</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Área:</span>
                      <p className="text-blue-900">{selectedMovimiento.area_destino}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Motivo:</span>
                      <p className="text-blue-900">{selectedMovimiento.motivo}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Empresa:</span>
                      <p className="text-blue-900">{selectedMovimiento.equipo?.empresa_tercero}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Contacto:</span>
                      <p className="text-blue-900">{selectedMovimiento.equipo?.contacto}</p>
                    </div>
                  </div>
                  {selectedMovimiento.foto_url && (
                    <div className="mt-4">
                      <span className="text-blue-700 font-medium text-sm">Foto de Entrada:</span>
                      <img
                        src={selectedMovimiento.foto_url}
                        alt="Foto de entrada"
                        className="mt-2 w-full h-48 object-cover rounded-lg border border-blue-200"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones de Salida
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Información adicional sobre la salida..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedRegistro}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Save size={20} />
                <span>{loading ? 'Registrando...' : 'Registrar Salida'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
