import { Cuenta } from './cuenta';

/** Registro de ahorro. */
export interface RegistroAhorro {
  id: number;
  descripcion?: string;
  idCuenta?: number;
  cuentaNombre?: string;
  cuenta?: Cuenta;
  fecha: string;
  valor: number;
  diferencia: number;
  idUsuario?: number;
  observaciones?: string;
  periodo?: string;
}
