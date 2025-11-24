import { useAuth } from '../context/AuthContext';

export function useRoles() {
  const { usuario } = useAuth();

  const isAdmin = usuario?.rol?.nombre === 'ADMIN';
  const isSeguridad = usuario?.rol?.nombre === 'SEGURIDAD';
  const isBiomedico = usuario?.rol?.nombre === 'BIOMEDICO';

  const canManageEquipos = isAdmin;
  const canManageUsuarios = isAdmin;
  const canRegistrarMovimientos = isAdmin || isSeguridad || isBiomedico;

  return {
    isAdmin,
    isSeguridad,
    isBiomedico,
    canManageEquipos,
    canManageUsuarios,
    canRegistrarMovimientos,
    rolNombre: usuario?.rol?.nombre
  };
}
