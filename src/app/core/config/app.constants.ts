export const APP_CONSTANTS = {
  /** Id del sistema "Gestor de Gastos" en el backend. */
  ID_SISTEMA: 3,
  /** Prefijo de rutas del controlador de GestorGastos. */
  PREFIX_GESTOR_GASTOS: 'gestorGastos',
  STORAGE_KEYS: {
    TOKEN: 'AuthToken',
    USERNAME: 'AuthUserName',
    USER_ID: 'AuthUserId',
    AUTHORITIES: 'AuthAuthorities',
  },
} as const;
