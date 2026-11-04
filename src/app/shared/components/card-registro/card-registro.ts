import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Registro } from '../../../core/models/registro';
import { DateShortPipe } from '../../pipes/date-short.pipe';
import { MoneyPipe } from '../../pipes/money.pipe';
import { textoContraste } from '../../utils/color';

/**
 * Card de un gasto: resume los datos principales del registro y permite
 * marcarlo como pagado o editarlo sin salir de la vista.
 */
@Component({
  selector: 'app-card-registro',
  imports: [MatIconModule, MatTooltipModule, DateShortPipe, MoneyPipe],
  templateUrl: './card-registro.html',
})
export class CardRegistro {
  readonly registro = input.required<Registro>();

  /** Emite el registro a editar. */
  readonly editar = output<Registro>();
  /** Emite el registro cuyo estado de pago debe alternarse. */
  readonly togglePagado = output<Registro>();

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }
}
