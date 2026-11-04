/** Rol (perfil) con acceso a los catálogos del sistema. */
export const ROL_ADMINISTRADOR = 'administrador';

/**
 * Indica si el rol recibido corresponde a un administrador.
 * La comparación ignora mayúsculas y espacios sobrantes.
 */
export function esAdministrador(role?: string | null): boolean {
  return (role ?? '').trim().toLowerCase() === ROL_ADMINISTRADOR;
}
