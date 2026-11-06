import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { concatMap, from, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { esRolAdministrador } from '../../shared/utils/role';
import { APP_CONSTANTS } from '../config/app.constants';
import { cifrarPassword } from '../crypto/cryptography';
import { DecodedToken, LoginRequest, LoginResponse } from '../models/jwt';
import { Usuario } from '../models/usuario';
import { UsuarioService } from '../services/usuario.service';
import { TokenService } from './token.service';

/** Datos necesarios para dar de alta un usuario. */
export interface DatosRegistro {
  nombre: string;
  login: string;
  password: string;
  correo?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly jwtHelper = new JwtHelperService();

  private readonly _currentUser = signal<DecodedToken | null>(this.readStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenService.getToken() !== null);

  /** Datos del usuario autenticado (nombre real, correo, perfil). */
  private readonly _perfil = signal<Usuario | null>(null);
  readonly perfil = this._perfil.asReadonly();

  /** Rol (perfil) del usuario actual. */
  readonly role = computed(() => this._currentUser()?.role ?? this.tokenService.getAuthorities());

  /** Solo el administrador accede a los catálogos. */
  readonly esAdministrador = computed(() => esRolAdministrador(this.role()));

  private readStoredUser(): DecodedToken | null {
    const token = this.tokenService.getToken();
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      return null;
    }
    try {
      return this.jwtHelper.decodeToken<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<DecodedToken> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}login`, credentials)
      .pipe(map((res) => this.applyToken(res.token)));
  }

  private applyToken(token: string): DecodedToken {
    const decoded = this.jwtHelper.decodeToken<DecodedToken>(token) ?? {};
    this.tokenService.setToken(token);
    this.tokenService.setUserName(decoded.unique_name ?? '');
    this.tokenService.setUserId(decoded.nameid ?? '');
    this.tokenService.setAuthorities(decoded.role ?? '');
    this._currentUser.set(decoded);
    // El perfil corresponde al usuario nuevo: se vuelve a cargar.
    this._perfil.set(null);
    return decoded;
  }

  /** Cambio de contraseña (PUT /login). */
  changePassword(body: LoginRequest): Observable<unknown> {
    return this.http.put<unknown>(`${environment.apiUrl}login`, body);
  }

  /**
   * Carga los datos del usuario autenticado (el token solo trae el login).
   * Se hace una sola vez por sesión.
   */
  cargarPerfil(): void {
    if (this._perfil()) {
      return;
    }
    this.usuarioService.getCurrent().subscribe({
      next: (usuario) => this._perfil.set(usuario),
      error: () => this._perfil.set(null),
    });
  }

  /**
   * Crea un usuario y lo habilita para el sistema de Gestor de Gastos.
   * La contraseña se cifra igual que en el backend y, al final, se inicia
   * sesión automáticamente con las credenciales recién creadas.
   */
  registrar(datos: DatosRegistro): Observable<DecodedToken> {
    return from(cifrarPassword(datos.password)).pipe(
      concatMap((passwordCifrado) =>
        this.usuarioService
          .insert({
            id: 0,
            nombre: datos.nombre,
            login: datos.login,
            password: passwordCifrado,
            correo: datos.correo || undefined,
            habilitado: true,
            idPerfil: APP_CONSTANTS.ID_PERFIL_USUARIO,
          })
          .pipe(
            concatMap((usuario) => this.usuarioService.asociarSistema(usuario.id, APP_CONSTANTS.ID_SISTEMA)),
            concatMap(() =>
              this.login({ login: datos.login, password: datos.password, idSistema: APP_CONSTANTS.ID_SISTEMA }),
            ),
          ),
      ),
    );
  }

  logout(): void {
    this.tokenService.logOut();
    this._currentUser.set(null);
    this._perfil.set(null);
    this.router.navigate(['/login']);
  }
}
