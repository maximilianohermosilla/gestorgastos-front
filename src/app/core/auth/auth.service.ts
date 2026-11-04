import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { esRolAdministrador } from '../../shared/utils/role';
import { DecodedToken, LoginRequest, LoginResponse } from '../models/jwt';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly jwtHelper = new JwtHelperService();

  private readonly _currentUser = signal<DecodedToken | null>(this.readStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenService.getToken() !== null);

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
    return decoded;
  }

  /** Cambio de contraseña (PUT /login). */
  changePassword(body: LoginRequest): Observable<unknown> {
    return this.http.put<unknown>(`${environment.apiUrl}login`, body);
  }

  logout(): void {
    this.tokenService.logOut();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
