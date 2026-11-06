import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registro } from '../models/registro';
import { todayDateOnly } from '../../shared/utils/date';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class RegistroService extends CrudService<Registro> {
  protected readonly resource = 'gestorGastos/Registro';

  getAllByUsuario(
    periodo: string,
    filters: { categoria?: number; descripcion?: string; pagado?: boolean } = {},
  ): Observable<Registro[]> {
    const idUsuario = this.token.getUserId();
    return this.getAll({ idUsuario, periodo, ...filters });
  }

  /** Marca el registro como pagado (o pendiente) y actualiza su fecha de pago. */
  alternarPago(registro: Registro): Observable<unknown> {
    const pagado = !registro.pagado;
    const payload: Partial<Registro> = {
      id: registro.id,
      descripcion: registro.descripcion,
      idCategoriaGasto: registro.idCategoriaGasto,
      idCuenta: registro.idCuenta,
      idEmpresa: registro.idEmpresa || undefined,
      idSuscripcion: registro.idSuscripcion,
      idRegistroVinculado: registro.idRegistroVinculado,
      numeroCuota: registro.numeroCuota,
      fecha: registro.fecha,
      valor: registro.valor,
      idUsuario: Number(this.token.getUserId() ?? 0),
      observaciones: registro.observaciones,
      periodo: registro.periodo ?? registro.fecha.substring(0, 7),
      pagado,
      fechaPago: pagado ? todayDateOnly() : undefined,
    };
    return this.update(payload);
  }
}
