export interface Rol {
  id: number;
  nombre: 'ADMIN' | 'SEGURIDAD' | 'BIOMEDICO';
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: boolean;
  rol_id: number;
  created_at: string;
  rol?: Rol;
}

export interface EquipoExterno {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  serial: string;
  empresa_tercero: string;
  contacto: string;
  telefono_contacto: string;
  activo: boolean;
  created_at: string;
}

export interface RegistroMovimiento {
  id: number;
  equipo_id: number;
  fecha_hora_entrada: string;
  fecha_hora_salida: string | null;
  area_destino: string;
  motivo: string;
  estado: 'ENTRADA' | 'SALIDA';
  foto_url: string | null;
  observacion: string | null;
  registrado_por: string;
  created_at: string;
  equipo?: EquipoExterno;
  usuario?: Usuario;
}

export interface DashboardStats {
  totalEquipos: number;
  equiposActivos: number;
  entradasHoy: number;
  salidasHoy: number;
}
