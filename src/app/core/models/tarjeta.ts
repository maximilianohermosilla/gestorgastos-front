/** Tarjeta. */
export interface Tarjeta {
  id: number;
  numero?: string;
  vencimiento?: string;
  idBanco?: number;
  bancoNombre?: string;
  idTipoTarjeta?: number;
  tipoTarjetaNombre?: string;
  idUsuario?: number;
  usuarioNombre?: string;
  habilitado?: boolean;
}
