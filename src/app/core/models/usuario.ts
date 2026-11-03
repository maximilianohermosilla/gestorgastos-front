/** Usuario autenticado (response de `/Usuario/IdUsuario`). */
export interface Usuario {
  id: number;
  nombre: string;
  login: string;
  password?: string;
  correo?: string;
  imagen?: string;
  habilitado?: boolean;
  idPerfil?: number;
  perfilDescripcion?: string;
  usuariosSistema?: unknown[];
}

/** Payload para crear/actualizar usuario (`UsuarioRequest`). */
export interface UsuarioRequest {
  id: number;
  nombre: string;
  login: string;
  password: string;
  correo?: string;
  imagen?: string;
  habilitado?: boolean;
  idPerfil?: number;
}
