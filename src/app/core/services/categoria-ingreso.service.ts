import { Injectable } from '@angular/core';
import { CategoriaIngreso } from '../models/categoria-ingreso';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CategoriaIngresoService extends CrudService<CategoriaIngreso> {
  protected readonly resource = 'gestorGastos/CategoriaIngreso';
  // Solo lectura: el backend no expone POST/PUT/DELETE para categorías de ingreso.
}
