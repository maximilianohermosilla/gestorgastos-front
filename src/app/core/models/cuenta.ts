import { Tarjeta } from './tarjeta';

/** Cuenta (bancaria/tarjeta). */
export interface Cuenta {
  id: number;
  nombre?: string;
  idTipoCuenta: number;
  tipoCuentaNombre?: string;
  idTarjeta?: number;
  tarjetaNumero?: string;
  tarjeta?: Tarjeta;
  idUsuario: number;
  usuarioNombre?: string;
  habilitado?: boolean;
}
