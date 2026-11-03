import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registro } from '../models/registro';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class RegistroService extends CrudService<Registro> {
  protected readonly resource = 'gestorGastos/Registro';

  getAllByUsuario(
    periodo: string,
    filters: { categoria?: number; descripcion?: string; pagado?: boolean } = {},
  ): Observable<Registro[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo, ...filters });
  }
}
