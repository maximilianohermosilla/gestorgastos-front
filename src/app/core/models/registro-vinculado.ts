import { Registro } from './registro';

/** Gasto financiado en cuotas (RegistroVinculado). */
export interface RegistroVinculado {
  id: number;
  descripcion?: string;
  cuotas: number;
  valorFinal: number;
  idUsuario: number;
  idEmpresa?: number;
  idCuenta: number;
  idCategoriaGasto: number;
  fecha: string;
  proximoMes: boolean;
  registros?: Registro[];
}
