import { Registro } from './registro';

/** Suscripción recurrente. */
export interface Suscripcion {
  id: number;
  nombre: string;
  fechaDesde: string;
  fechaHasta?: string;
  valorActual: number;
  idUsuario?: number;
  usuarioNombre?: string;
  idEmpresa?: number;
  idCuenta: number;
  idCategoriaGasto: number;
  fechaUpdate?: string;
  proximoMes: boolean;
  registros?: Registro[];
}
