import { CategoriaGasto } from './categoria-gasto';
import { Cuenta } from './cuenta';
import { RegistroVinculado } from './registro-vinculado';
import { Suscripcion } from './suscripcion';

/** Gasto (Registro). */
export interface Registro {
  id: number;
  descripcion?: string;
  idEmpresa?: number;
  empresaNombre?: string;
  idSuscripcion?: number;
  suscripcion?: Suscripcion;
  idCategoriaGasto: number;
  categoriaGastoNombre?: string;
  categoriaGasto?: CategoriaGasto;
  idCuenta: number;
  cuenta?: Cuenta;
  idRegistroVinculado?: number;
  registroVinculado?: RegistroVinculado;
  numeroCuota?: number;
  fecha: string;
  valor: number;
  idUsuario?: number;
  observaciones?: string;
  periodo?: string;
  pagado?: boolean;
  fechaPago?: string;
}
