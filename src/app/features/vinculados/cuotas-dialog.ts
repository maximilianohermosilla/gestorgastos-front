import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Registro } from '../../core/models/registro';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

export interface CuotasDialogData {
  titulo: string;
  registros: Registro[];
}

@Component({
  selector: 'app-cuotas-dialog',
  imports: [MatDialogModule, MatTableModule, MatIconModule, DateShortPipe, MoneyPipe],
  templateUrl: './cuotas-dialog.html',
})
export class CuotasDialog {
  readonly data = inject<CuotasDialogData>(MAT_DIALOG_DATA);
  readonly columnas = ['numero', 'fecha', 'descripcion', 'valor', 'pagado'];
}
