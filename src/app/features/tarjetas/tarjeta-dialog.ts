import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Banco } from '../../core/models/banco';
import { Tarjeta } from '../../core/models/tarjeta';
import { TipoTarjeta } from '../../core/models/tipo-tarjeta';
import { BancoService } from '../../core/services/banco.service';
import { TipoTarjetaService } from '../../core/services/tipo-tarjeta.service';

export interface TarjetaDialogData {
  item?: Tarjeta;
}

@Component({
  selector: 'app-tarjeta-dialog',
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
  templateUrl: './tarjeta-dialog.html',
})
export class TarjetaDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bancoService = inject(BancoService);
  private readonly tipoTarjetaService = inject(TipoTarjetaService);
  readonly data = inject<TarjetaDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<TarjetaDialog>);

  readonly bancos = signal<Banco[]>([]);
  readonly tiposTarjeta = signal<TipoTarjeta[]>([]);

  readonly form = this.fb.nonNullable.group({
    numero: [this.data.item?.numero ?? ''],
    vencimiento: [this.data.item?.vencimiento ?? ''],
    idBanco: [this.data.item?.idBanco ?? 0],
    idTipoTarjeta: [this.data.item?.idTipoTarjeta ?? 0],
    habilitado: [this.data.item?.habilitado ?? true],
  });

  ngOnInit(): void {
    this.bancoService.getAll().subscribe((r) => this.bancos.set(r));
    this.tipoTarjetaService.getAll().subscribe((r) => this.tiposTarjeta.set(r));
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.ref.close({
      ...v,
      idBanco: v.idBanco ? v.idBanco : null,
      idTipoTarjeta: v.idTipoTarjeta ? v.idTipoTarjeta : null,
    });
  }
}
