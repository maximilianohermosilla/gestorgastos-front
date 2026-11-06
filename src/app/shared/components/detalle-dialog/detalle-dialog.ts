import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EmptyState } from '../empty-state/empty-state';
import { DateShortPipe } from '../../pipes/date-short.pipe';
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

/** Fila mostrada en el detalle de un gráfico. */
export interface DetalleItem {
  fecha: string;
  descripcion: string;
  categoria: string;
  cuenta: string;
  valor: number;
  pagado?: boolean;
}

/** Datos del diálogo de detalle (click sobre un sector de un chart). */
export interface DetalleDialogData {
  titulo: string;
  periodo?: string;
  items: DetalleItem[];
}

/**
 * Diálogo con el detalle de los registros que componen un sector o barra de
 * un gráfico (por ejemplo, los gastos de una categoría).
 */
@Component({
  selector: 'app-detalle-dialog',
  imports: [MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, EmptyState, DateShortPipe, MoneyPipe],
  templateUrl: './detalle-dialog.html',
})
export class DetalleDialog {
  readonly data = inject<DetalleDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<DetalleDialog>);

  readonly columnas = ['fecha', 'descripcion', 'categoria', 'cuenta', 'valor'];
  readonly total = computed(() => this.data.items.reduce((s, i) => s + i.valor, 0));

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
