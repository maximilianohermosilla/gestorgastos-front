import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TokenService } from '../../core/auth/token.service';
import { CategoriaGasto } from '../../core/models/categoria-gasto';
import { Cuenta } from '../../core/models/cuenta';
import { Empresa } from '../../core/models/empresa';
import { Registro } from '../../core/models/registro';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { todayDateOnly, toDateOnly } from '../../shared/utils/date';

export interface RegistroDialogData {
  item?: Registro;
}

@Component({
  selector: 'app-registro-dialog',
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
  templateUrl: './registro-dialog.html',
})
export class RegistroDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly token = inject(TokenService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly empresaService = inject(EmpresaService);
  readonly data = inject<RegistroDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<RegistroDialog>);

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly empresas = signal<Empresa[]>([]);

  readonly form = this.fb.group({
    descripcion: [this.data.item?.descripcion ?? '', Validators.required],
    fecha: [toDateOnly(this.data.item?.fecha) ?? todayDateOnly(), Validators.required],
    valor: [this.data.item?.valor ?? null, Validators.required],
    idCategoriaGasto: [this.data.item?.idCategoriaGasto ?? null, Validators.required],
    idCuenta: [this.data.item?.idCuenta ?? null, Validators.required],
    idEmpresa: [this.data.item?.idEmpresa ?? null],
    observaciones: [this.data.item?.observaciones ?? ''],
    pagado: [this.data.item?.pagado ?? false],
    fechaPago: [toDateOnly(this.data.item?.fechaPago) ?? todayDateOnly()],
  });

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
    this.cuentaService.getAllByUsuario().subscribe((r) => this.cuentas.set(r.filter((c) => c.habilitado)));
    this.empresaService.getAll().subscribe((r) => this.empresas.set(r));
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v: any = this.form.getRawValue();
    const fecha: string = v.fecha;
    const payload: Partial<Registro> = {
      id: this.data.item?.id ?? 0,
      descripcion: v.descripcion,
      idCategoriaGasto: v.idCategoriaGasto,
      idCuenta: v.idCuenta,
      idEmpresa: v.idEmpresa || undefined,
      idSuscripcion: this.data.item?.idSuscripcion,
      idRegistroVinculado: this.data.item?.idRegistroVinculado,
      numeroCuota: this.data.item?.numeroCuota,
      fecha,
      valor: Number(v.valor),
      idUsuario: Number(this.token.getUserId() ?? 0),
      observaciones: v.observaciones ?? '',
      periodo: fecha.substring(0, 7),
      pagado: v.pagado,
      fechaPago: v.pagado ? v.fechaPago : undefined,
    };
    this.ref.close(payload);
  }
}
