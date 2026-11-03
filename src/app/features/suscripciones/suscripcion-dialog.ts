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
import { Suscripcion } from '../../core/models/suscripcion';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { todayDateOnly, toDateOnly } from '../../shared/utils/date';

export interface SuscripcionDialogData {
  item?: Suscripcion;
}

@Component({
  selector: 'app-suscripcion-dialog',
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
  templateUrl: './suscripcion-dialog.html',
})
export class SuscripcionDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly token = inject(TokenService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly empresaService = inject(EmpresaService);
  readonly data = inject<SuscripcionDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<SuscripcionDialog>);

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly empresas = signal<Empresa[]>([]);

  private get primerRegistro() {
    return this.data.item?.registros?.[0];
  }

  readonly form = this.fb.group({
    nombre: [this.data.item?.nombre ?? '', Validators.required],
    fechaDesde: [toDateOnly(this.data.item?.fechaDesde) ?? todayDateOnly(), Validators.required],
    fechaHasta: [toDateOnly(this.data.item?.fechaHasta) ?? todayDateOnly(), Validators.required],
    valorActual: [this.data.item?.valorActual ?? null, Validators.required],
    idCategoriaGasto: [this.primerRegistro?.idCategoriaGasto ?? null, Validators.required],
    idCuenta: [this.primerRegistro?.idCuenta ?? null, Validators.required],
    idEmpresa: [this.primerRegistro?.idEmpresa ?? null],
    proximoMes: [false],
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
    const fechaDesde: string = v.fechaDesde;
    const payload: Partial<Suscripcion> = {
      id: this.data.item?.id ?? 0,
      nombre: v.nombre,
      fechaDesde,
      fechaHasta: v.fechaHasta,
      valorActual: Number(v.valorActual),
      idUsuario: Number(this.token.getUserId() ?? 0),
      idEmpresa: v.idEmpresa || undefined,
      idCuenta: v.idCuenta,
      idCategoriaGasto: v.idCategoriaGasto,
      fechaUpdate: this.data.item?.id ? fechaDesde : undefined,
      proximoMes: v.proximoMes,
    };
    this.ref.close(payload);
  }
}
