import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RegistroVinculado } from '../models/registro-vinculado';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class RegistroVinculadoService extends CrudService<RegistroVinculado> {
  protected readonly resource = 'gestorGastos/RegistroVinculado';

  getAllByUsuario(periodo?: string): Observable<RegistroVinculado[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo });
  }
}
