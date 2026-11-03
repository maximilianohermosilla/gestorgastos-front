import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarjeta } from '../models/tarjeta';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TarjetaService extends CrudService<Tarjeta> {
  protected readonly resource = 'gestorGastos/Tarjeta';

  /** Ojo: el backend espera `IdUsuario` (mayúscula) en este controlador. */
  getAllByUsuario(): Observable<Tarjeta[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ IdUsuario: idUsuario });
  }
}
