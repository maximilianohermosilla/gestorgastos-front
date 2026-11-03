import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/usuario';
import { TokenService } from '../auth/token.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly token = inject(TokenService);
  private readonly url = `${environment.apiUrl}Usuario`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  getCurrent(): Observable<Usuario> {
    const id = this.token.getUserId();
    return this.http.get<Usuario>(`${this.url}/IdUsuario?Id=${id}`);
  }

  insert(body: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, body);
  }

  update(body: UsuarioRequest): Observable<unknown> {
    return this.http.put<unknown>(this.url, body);
  }
}
