export const APP_CONSTANTS = {
  /** Id del sistema "Gestor de Gastos" en el backend. */
  ID_SISTEMA: 3,
  /** Id del perfil "Usuario" (los registrados públicos no acceden a los catálogos). */
  ID_PERFIL_USUARIO: 2,
  /** Prefijo de rutas del controlador de GestorGastos. */
  PREFIX_GESTOR_GASTOS: 'gestorGastos',
  STORAGE_KEYS: {
    TOKEN: 'AuthToken',
    USERNAME: 'AuthUserName',
    USER_ID: 'AuthUserId',
    AUTHORITIES: 'AuthAuthorities',
  },
} as const;
