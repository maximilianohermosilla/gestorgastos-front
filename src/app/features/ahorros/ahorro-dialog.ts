import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TokenService } from '../../core/auth/token.service';
import { Cuenta } from '../../core/models/cuenta';
import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { CuentaService } from '../../core/services/cuenta.service';
import { todayDateOnly, toDateOnly } from '../../shared/utils/date';

export interface AhorroDialogData {
  item?: RegistroAhorro;
}

@Component({
  selector: 'app-ahorro-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './ahorro-dialog.html',
})
export class AhorroDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly token = inject(TokenService);
  private readonly cuentaService = inject(CuentaService);
  readonly data = inject<AhorroDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<AhorroDialog>);

  readonly cuentas = signal<Cuenta[]>([]);

  readonly form = this.fb.group({
    descripcion: [this.data.item?.descripcion ?? '', Validators.required],
    fecha: [toDateOnly(this.data.item?.fecha) ?? todayDateOnly(), Validators.required],
    valor: [this.data.item?.valor ?? null, Validators.required],
    idCuenta: [this.data.item?.idCuenta ?? null],
    diferencia: [this.data.item?.diferencia ?? 0],
    observaciones: [this.data.item?.observaciones ?? ''],
  });

  ngOnInit(): void {
    this.cuentaService.getAllByUsuario().subscribe((r) => this.cuentas.set(r.filter((c) => c.habilitado)));
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v: any = this.form.getRawValue();
    const fecha: string = v.fecha;
    const payload: Partial<RegistroAhorro> = {
      id: this.data.item?.id ?? 0,
      descripcion: v.descripcion,
      idCuenta: v.idCuenta || undefined,
      fecha,
      valor: Number(v.valor),
      diferencia: Number(v.diferencia ?? 0),
      idUsuario: Number(this.token.getUserId() ?? 0),
      observaciones: v.observaciones ?? '',
      periodo: fecha.substring(0, 7),
    };
    this.ref.close(payload);
  }
}
