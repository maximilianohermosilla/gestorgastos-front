/** Payload de login (`UsuarioLoginDTO`). */
export interface LoginRequest {
  login: string;
  password: string;
  passwordNew?: string;
  idSistema: number;
}

/** Respuesta del endpoint POST /login. */
export interface LoginResponse {
  token: string;
}

/** Claims del JWT emitido por el backend. */
export interface DecodedToken {
  unique_name?: string;
  nameid?: string;
  role?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}
