import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cuenta } from '../models/cuenta';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CuentaService extends CrudService<Cuenta> {
  protected readonly resource = 'gestorGastos/Cuenta';

  /** Ojo: el backend espera `IdUsuario` (mayúscula) en este controlador. */
  getAllByUsuario(): Observable<Cuenta[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ IdUsuario: idUsuario });
  }
}
