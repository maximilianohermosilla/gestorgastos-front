import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ingreso } from '../models/ingreso';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class IngresoService extends CrudService<Ingreso> {
  protected readonly resource = 'gestorGastos/Ingreso';

  getAllByUsuario(periodo: string, categoria?: number): Observable<Ingreso[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo, categoria });
  }
}
