import { Component, computed, effect, input, output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { currentPeriod } from '../../utils/date';

/**
 * Formatos del datepicker del selector de periodo.
 * Sobrescribe `dateInput` para mostrar "MM/AAAA" en lugar del nombre del mes
 * ("noviembre de 2026"). Es local al componente: no afecta a otros datepickers.
 */
const PERIODO_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
    timeInput: null,
  },
  display: {
    dateInput: { year: 'numeric', month: '2-digit' },
    timeInput: { hour: 'numeric', minute: 'numeric' },
    monthLabel: { year: 'numeric', month: 'short' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
    timeOptionLabel: { hour: 'numeric', minute: 'numeric' },
  },
};

/**
 * Adapter que formatea el input del selector de periodo como "MM/AAAA"
 * (con el mes siempre a 2 dígitos), en lugar del nombre del mes.
 */
class PeriodoDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: any): string {
    if (displayFormat === PERIODO_DATE_FORMATS.display.dateInput) {
      const mm = String(this.getMonth(date) + 1).padStart(2, '0');
      return `${mm}/${this.getYear(date)}`;
    }
    return super.format(date, displayFormat);
  }
}

/**
 * Selector de periodo con tabs Mes/Año y flechas de navegación.
 * Recibe el periodo actual (`periodo`) y emite el nuevo valor en `cambio`.
 */
@Component({
  selector: 'app-form-periodo',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: PERIODO_DATE_FORMATS },
    { provide: DateAdapter, useClass: PeriodoDateAdapter },
  ],
  templateUrl: './form-periodo.html',
})
export class FormPeriodo {
  @ViewChild('dpMes') private dpMes?: MatDatepicker<Date>;

  /** Periodo actual: "YYYY-MM" o "YYYY". */
  readonly periodo = input('');
  /** Oculta la pestaña de mes (solo año). */
  readonly hiddenMonth = input(false);

  readonly cambio = output<string>();

  readonly mesCtrl = new FormControl<Date | null>(null);
  readonly anioCtrl = new FormControl<number | null>(null);

  readonly modo = computed<'mes' | 'anio'>(() =>
    this.hiddenMonth() || this.periodo().length === 4 ? 'anio' : 'mes',
  );

  /** Índice de la pestaña activa (0 = Mes, 1 = Año). */
  readonly selectedIndex = computed(() => (this.hiddenMonth() || this.modo() === 'mes' ? 0 : 1));

  readonly mes = computed(() => (this.periodo().length === 7 ? this.periodo() : currentPeriod()));

  readonly anio = computed(() =>
    this.periodo().length === 4 ? this.periodo() : this.periodo().substring(0, 4),
  );

  constructor() {
    // Sincroniza los controles con el periodo recibido desde el padre.
    effect(() => {
      const p = this.periodo();
      if (!p) {
        return;
      }
      if (p.length === 7) {
        const [y, m] = p.split('-').map(Number);
        // Mediodía local: evita que el formateo en UTC desplace el mes.
        const fecha = new Date(y, m - 1, 1, 12);
        const actual = this.mesCtrl.value;
        if (!actual || actual.getFullYear() !== y || actual.getMonth() !== m - 1) {
          this.mesCtrl.setValue(fecha);
        }
      } else {
        const y = Number(p);
        if (String(this.anioCtrl.value ?? '') !== String(y)) {
          this.anioCtrl.setValue(y);
        }
      }
    });
  }

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

  onMesSelected(e: MatDatepickerInputEvent<Date>): void {
    const d = e.value;
    if (!d) {
      return;
    }
    this.dpMes?.close();
    const periodo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (periodo !== this.periodo()) {
      this.cambio.emit(periodo);
    }
  }

  onAnioChange(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    if (v && v !== this.anio()) {
      this.cambio.emit(v);
    }
  }
}
