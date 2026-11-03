import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Suscripcion } from '../models/suscripcion';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class SuscripcionService extends CrudService<Suscripcion> {
  protected readonly resource = 'gestorGastos/Suscripcion';

  getAllByUsuario(periodo?: string): Observable<Suscripcion[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo });
  }
}
