import { Component, computed, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Ingreso } from '../../../core/models/ingreso';
import { Registro } from '../../../core/models/registro';
import { CardIngreso } from '../card-ingreso/card-ingreso';
import { CardRegistro } from '../card-registro/card-registro';
import { EmptyState } from '../empty-state/empty-state';
import { MoneyPipe } from '../../pipes/money.pipe';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Datos del diálogo de detalle (click sobre un sector o barra de un chart). */
export interface DetalleDialogData {
  titulo: string;
  periodo?: string;
  /** 'gastos' muestra cards de gasto, 'ingresos' cards de ingreso. */
  tipo: 'gastos' | 'ingresos';
  registros?: Registro[];
  ingresos?: Ingreso[];
}

/**
 * Diálogo con el detalle de los registros que componen un sector o barra de
 * un gráfico (por ejemplo, los gastos de una categoría). Las cards permiten
 * editar o marcar como pagado sin salir del detalle.
 */
@Component({
  selector: 'app-detalle-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CardRegistro,
    CardIngreso,
    EmptyState,
    MoneyPipe,
  ],
  templateUrl: './detalle-dialog.html',
})
export class DetalleDialog {
  readonly data = inject<DetalleDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<DetalleDialog>);

  /** El gasto a editar. */
  readonly editarGasto = output<Registro>();
  /** El gasto cuyo estado de pago debe alternarse. */
  readonly togglePagado = output<Registro>();
  /** El ingreso a editar. */
  readonly editarIngreso = output<Ingreso>();

  readonly total = computed(() =>
    this.data.tipo === 'gastos'
      ? (this.data.registros ?? []).reduce((s, r) => s + r.valor, 0)
      : (this.data.ingresos ?? []).reduce((s, i) => s + i.valor, 0),
  );

  /** Período en texto: "noviembre 2026" o "2026". */
  readonly periodoTexto = computed(() => {
    const p = this.data.periodo ?? '';
    if (/^\d{4}$/.test(p)) {
      return p;
    }
    const [anio, mes] = p.split('-');
    const i = Number(mes) - 1;
    return i >= 0 && i < 12 ? `${MESES[i]} ${anio}` : p;
  });
}
