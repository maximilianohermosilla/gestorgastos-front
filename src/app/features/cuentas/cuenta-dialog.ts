import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Cuenta } from '../../core/models/cuenta';
import { Tarjeta } from '../../core/models/tarjeta';
import { TipoCuenta } from '../../core/models/tipo-cuenta';
import { TarjetaService } from '../../core/services/tarjeta.service';
import { TipoCuentaService } from '../../core/services/tipo-cuenta.service';

export interface CuentaDialogData {
  item?: Cuenta;
}

@Component({
  selector: 'app-cuenta-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './cuenta-dialog.html',
})
export class CuentaDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tipoCuentaService = inject(TipoCuentaService);
  private readonly tarjetaService = inject(TarjetaService);
  readonly data = inject<CuentaDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<CuentaDialog>);

  readonly tiposCuenta = signal<TipoCuenta[]>([]);
  readonly tarjetas = signal<Tarjeta[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.item?.nombre ?? '', [Validators.required]],
    idTipoCuenta: [this.data.item?.idTipoCuenta ?? 0, [Validators.required, Validators.min(1)]],
    idTarjeta: [this.data.item?.idTarjeta ?? 0],
    habilitado: [this.data.item?.habilitado ?? true],
  });

  ngOnInit(): void {
    this.tipoCuentaService.getAll().subscribe((r) => this.tiposCuenta.set(r));
    this.tarjetaService.getAllByUsuario().subscribe((r) => this.tarjetas.set(r));
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({ ...v, idTarjeta: v.idTarjeta ? v.idTarjeta : null });
  }
}
