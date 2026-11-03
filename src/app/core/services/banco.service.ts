import { Injectable } from '@angular/core';
import { Banco } from '../models/banco';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class BancoService extends CrudService<Banco> {
  protected readonly resource = 'gestorGastos/Banco';
}
