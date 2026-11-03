import { Injectable } from '@angular/core';
import { TipoTarjeta } from '../models/tipo-tarjeta';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TipoTarjetaService extends CrudService<TipoTarjeta> {
  protected readonly resource = 'gestorGastos/TipoTarjeta';
}
