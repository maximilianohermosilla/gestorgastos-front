import { Injectable } from '@angular/core';
import { TipoCuenta } from '../models/tipo-cuenta';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TipoCuentaService extends CrudService<TipoCuenta> {
  protected readonly resource = 'gestorGastos/TipoCuenta';
}
