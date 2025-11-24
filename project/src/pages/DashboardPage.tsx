import { useState, useEffect } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { supabase } from '../lib/supabaseClient';
import { DashboardStats } from '../types/domain';
import { Package, CheckCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipos: 0,
    equiposActivos: 0,
    entradasHoy: 0,
    salidasHoy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [equiposRes, activosRes, entradasRes, salidasRes] = await Promise.all([
        supabase.from('equipos_externos').select('id', { count: 'exact', head: true }),
        supabase.from('equipos_externos').select('id', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('registros_movimiento').select('id', { count: 'exact', head: true })
          .eq('estado', 'ENTRADA')
          .gte('fecha_hora_entrada', new Date().toISOString().split('T')[0]),
        supabase.from('registros_movimiento').select('id', { count: 'exact', head: true })
          .eq('estado', 'SALIDA')
          .gte('fecha_hora_salida', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalEquipos: equiposRes.count || 0,
        equiposActivos: activosRes.count || 0,
        entradasHoy: entradasRes.count || 0,
        salidasHoy: salidasRes.count || 0,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Equipos',
      value: stats.totalEquipos,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Equipos Activos',
      value: stats.equiposActivos,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Entradas Hoy',
      value: stats.entradasHoy,
      icon: ArrowDownCircle,
      color: 'bg-orange-500',
    },
    {
      title: 'Salidas Hoy',
      value: stats.salidasHoy,
      icon: ArrowUpCircle,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Control</h2>
          <p className="text-gray-600">Estadísticas en tiempo real del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Sistema</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Sistema de control de equipos externos para hospital</p>
            <p>• Registro de entradas y salidas con fotografías</p>
            <p>• Control de acceso basado en roles</p>
            <p>• Historial completo de movimientos</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
