import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  titulo: string;
  mensaje: string;
  icono?: string;
}

/** Diálogo informativo (éxito/error/info). */
@Component({
  selector: 'app-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog.html',
})
export class Dialog {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<Dialog>);
}
