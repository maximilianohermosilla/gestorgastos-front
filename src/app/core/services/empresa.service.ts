import { Injectable } from '@angular/core';
import { Empresa } from '../models/empresa';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class EmpresaService extends CrudService<Empresa> {
  protected readonly resource = 'gestorGastos/Empresa';
}
