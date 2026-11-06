import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Ingreso } from '../../../core/models/ingreso';
import { DateShortPipe } from '../../pipes/date-short.pipe';
import { MoneyPipe } from '../../pipes/money.pipe';
import { textoContraste } from '../../utils/color';

/**
 * Card de un ingreso: resume los datos principales del registro y permite
 * editarlo sin salir de la vista.
 */
@Component({
  selector: 'app-card-ingreso',
  imports: [MatIconModule, MatTooltipModule, DateShortPipe, MoneyPipe],
  templateUrl: './card-ingreso.html',
})
export class CardIngreso {
  readonly registro = input.required<Ingreso>();

  /** Emite el ingreso a editar. */
  readonly editar = output<Ingreso>();

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }
}
