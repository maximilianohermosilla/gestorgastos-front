import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { currentPeriod } from '../../utils/date';

/**
 * Selector de periodo con tabs Mes/Año y flechas de navegación.
 * Recibe el periodo actual (`periodo`) y emite el nuevo valor en `cambio`.
 */
@Component({
  selector: 'app-form-periodo',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './form-periodo.html',
})
export class FormPeriodo {
  /** Periodo actual: "YYYY-MM" o "YYYY". */
  readonly periodo = input('');
  /** Oculta la pestaña de mes (solo año). */
  readonly hiddenMonth = input(false);

  readonly cambio = output<string>();

  readonly modo = computed<'mes' | 'anio'>(() =>
    this.hiddenMonth() || this.periodo().length === 4 ? 'anio' : 'mes',
  );

  /** Índice de la pestaña activa (0 = Mes, 1 = Año). */
  readonly selectedIndex = computed(() => (this.hiddenMonth() || this.modo() === 'mes' ? 0 : 1));

  readonly mes = computed(() => (this.periodo().length === 7 ? this.periodo() : currentPeriod()));

  readonly anio = computed(() =>
    this.periodo().length === 4 ? this.periodo() : this.periodo().substring(0, 4),
  );

  anterior(): void {
    if (this.modo() === 'mes') {
      this.cambio.emit(format(subMonths(parse(this.mes(), 'yyyy-MM', new Date()), 1), 'yyyy-MM'));
    } else {
      this.cambio.emit(String(Number(this.anio()) - 1));
    }
  }

  siguiente(): void {
    if (this.modo() === 'mes') {
      this.cambio.emit(format(addMonths(parse(this.mes(), 'yyyy-MM', new Date()), 1), 'yyyy-MM'));
    } else {
      this.cambio.emit(String(Number(this.anio()) + 1));
    }
  }

  cambiarModo(index: number): void {
    const modo: 'mes' | 'anio' = this.hiddenMonth() ? 'anio' : index === 0 ? 'mes' : 'anio';
    this.cambio.emit(modo === 'mes' ? `${this.anio()}-${this.mes().substring(5)}` : this.anio());
  }

  onMesChange(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) {
      this.cambio.emit(v);
    }
  }

  onAnioChange(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v) {
      this.cambio.emit(v);
    }
  }
}
