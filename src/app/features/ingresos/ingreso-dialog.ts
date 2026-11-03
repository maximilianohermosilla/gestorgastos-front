import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TokenService } from '../../core/auth/token.service';
import { CategoriaIngreso } from '../../core/models/categoria-ingreso';
import { Ingreso } from '../../core/models/ingreso';
import { CategoriaIngresoService } from '../../core/services/categoria-ingreso.service';
import { todayDateOnly, toDateOnly } from '../../shared/utils/date';

export interface IngresoDialogData {
  item?: Ingreso;
}

@Component({
  selector: 'app-ingreso-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './ingreso-dialog.html',
})
export class IngresoDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly token = inject(TokenService);
  private readonly categoriaService = inject(CategoriaIngresoService);
  readonly data = inject<IngresoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<IngresoDialog>);

  readonly categorias = signal<CategoriaIngreso[]>([]);

  readonly form = this.fb.group({
    descripcion: [this.data.item?.descripcion ?? '', Validators.required],
    fecha: [toDateOnly(this.data.item?.fecha) ?? todayDateOnly(), Validators.required],
    valor: [this.data.item?.valor ?? null, Validators.required],
    idCategoriaIngreso: [this.data.item?.idCategoriaIngreso ?? null, Validators.required],
  });

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v: any = this.form.getRawValue();
    const fecha: string = v.fecha;
    const payload: Partial<Ingreso> = {
      id: this.data.item?.id ?? 0,
      descripcion: v.descripcion,
      fecha,
      valor: Number(v.valor),
      idUsuario: Number(this.token.getUserId() ?? 0),
      idCategoriaIngreso: v.idCategoriaIngreso,
      periodo: fecha.substring(0, 7),
    };
    this.ref.close(payload);
  }
}
