import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Servicio CRUD base sobre los endpoints de GestorGastos.
 * Los servicios concretos solo definen el recurso y los filtros específicos.
 */
export abstract class CrudService<T extends { id: number }> {
  protected abstract readonly resource: string;

  protected readonly http = inject(HttpClient);
  protected readonly token = inject(TokenService);

  protected get url(): string {
    return `${environment.apiUrl}${this.resource}`;
  }

  /** Construye la URL con query params, ignorando valores vacíos. */
  protected buildUrl(params: QueryParams = {}): string {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return qs ? `${this.url}?${qs}` : this.url;
  }

  getAll(params: QueryParams = {}): Observable<T[]> {
    return this.http.get<T[]>(this.buildUrl(params));
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  insert(body: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url, body);
  }

  update(body: Partial<T>): Observable<unknown> {
    return this.http.put<unknown>(this.url, body);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`);
  }
}
