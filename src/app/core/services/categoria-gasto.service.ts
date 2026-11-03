import { Injectable } from '@angular/core';
import { CategoriaGasto } from '../models/categoria-gasto';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CategoriaGastoService extends CrudService<CategoriaGasto> {
  protected readonly resource = 'gestorGastos/CategoriaGasto';
  // Solo lectura: el backend no expone POST/PUT/DELETE para categorías de gasto.
}
