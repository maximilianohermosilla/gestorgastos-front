import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CatalogoDialogData {
  titulo: string;
  item?: { id?: number; nombre?: string };
}

/** Formulario ABM para catálogos simples (solo nombre). */
@Component({
  selector: 'app-catalogo-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './catalogo-dialog.html',
})
export class CatalogoDialog {
  private readonly fb = inject(FormBuilder);
  readonly data = inject<CatalogoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<CatalogoDialog>);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.item?.nombre ?? '', [Validators.required]],
  });

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    this.ref.close(this.form.value.nombre?.trim());
  }
}
