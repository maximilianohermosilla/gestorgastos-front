import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegistroAhorro } from '../models/registro-ahorro';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class RegistroAhorroService extends CrudService<RegistroAhorro> {
  protected readonly resource = 'gestorGastos/RegistroAhorro';

  getAllByUsuario(periodo: string, descripcion?: string): Observable<RegistroAhorro[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo, descripcion });
  }
}
