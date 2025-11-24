import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { EquipoExterno } from '../types/domain';
import { Upload, Save } from 'lucide-react';

export function RegistrarEntradaPage() {
  const { usuario } = useAuth();
  const [equipos, setEquipos] = useState<EquipoExterno[]>([]);
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    equipo_id: '',
    area_destino: '',
    motivo: '',
    observacion: '',
  });

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const { data, error } = await supabase
        .from('equipos_externos')
        .select('*')
        .eq('activo', true)
        .order('marca');

      if (error) throw error;
      setEquipos(data || []);
    } catch (error) {
      console.error('Error cargando equipos:', error);
    }
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);
    try {
      let fotoUrl = null;

      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('equipos-fotos')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('equipos-fotos')
          .getPublicUrl(fileName);

        fotoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('registros_movimiento')
        .insert([{
          equipo_id: parseInt(formData.equipo_id),
          area_destino: formData.area_destino,
          motivo: formData.motivo,
          observacion: formData.observacion || null,
          estado: 'ENTRADA',
          foto_url: fotoUrl,
          registrado_por: usuario.id,
        }]);

      if (error) throw error;

      alert('Entrada registrada exitosamente');
      setFormData({ equipo_id: '', area_destino: '', motivo: '', observacion: '' });
      setFoto(null);
      setFotoPreview(null);
    } catch (error) {
      console.error('Error registrando entrada:', error);
      alert('Error al registrar la entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registrar Entrada</h2>
          <p className="text-gray-600">Registre el ingreso de un equipo externo al hospital</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo *
              </label>
              <select
                value={formData.equipo_id}
                onChange={(e) => setFormData({ ...formData, equipo_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.marca} {equipo.modelo} - {equipo.serial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de Destino *
              </label>
              <input
                type="text"
                value={formData.area_destino}
                onChange={(e) => setFormData({ ...formData, area_destino: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ej: Urgencias, UCI, Quirófano 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ej: Mantenimiento preventivo, Reparación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observacion}
                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Información adicional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotografía
              </label>
              <div className="space-y-4">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gray-500" />
                  <span className="text-gray-600">Seleccionar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
                {fotoPreview && (
                  <div className="relative">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFoto(null);
                        setFotoPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Save size={20} />
              <span>{loading ? 'Registrando...' : 'Registrar Entrada'}</span>
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
