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
import { RegistroVinculado } from '../../core/models/registro-vinculado';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { todayDateOnly, toDateOnly } from '../../shared/utils/date';

export interface VinculadoDialogData {
  item?: RegistroVinculado;
}

@Component({
  selector: 'app-vinculado-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MoneyPipe,
  ],
  templateUrl: './vinculado-dialog.html',
})
export class VinculadoDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly token = inject(TokenService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly empresaService = inject(EmpresaService);
  readonly data = inject<VinculadoDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<VinculadoDialog>);

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly valorCuota = signal(0);

  private get primerRegistro() {
    return this.data.item?.registros?.[0];
  }

  readonly form = this.fb.group({
    descripcion: [this.data.item?.descripcion ?? '', Validators.required],
    fecha: [toDateOnly(this.primerRegistro?.fecha) ?? todayDateOnly(), Validators.required],
    idCategoriaGasto: [this.primerRegistro?.idCategoriaGasto ?? null, Validators.required],
    idCuenta: [this.primerRegistro?.idCuenta ?? null, Validators.required],
    idEmpresa: [this.primerRegistro?.idEmpresa ?? null],
    cuotas: [this.data.item?.cuotas ?? 1, [Validators.required, Validators.min(1)]],
    valorFinal: [this.data.item?.valorFinal ?? null, Validators.required],
    proximoMes: [false],
  });

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
    this.cuentaService.getAllByUsuario().subscribe((r) => this.cuentas.set(r.filter((c) => c.habilitado)));
    this.empresaService.getAll().subscribe((r) => this.empresas.set(r));
    this.form.get('cuotas')?.valueChanges.subscribe(() => this.recalcular());
    this.form.get('valorFinal')?.valueChanges.subscribe(() => this.recalcular());
    this.recalcular();
  }

  private recalcular(): void {
    const valor = Number(this.form.get('valorFinal')?.value ?? 0);
    const cuotas = Number(this.form.get('cuotas')?.value ?? 1);
    this.valorCuota.set(cuotas > 0 ? valor / cuotas : 0);
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    const v: any = this.form.getRawValue();
    const payload: Partial<RegistroVinculado> = {
      id: this.data.item?.id ?? 0,
      descripcion: v.descripcion,
      cuotas: Number(v.cuotas),
      valorFinal: Number(v.valorFinal),
      idUsuario: Number(this.token.getUserId() ?? 0),
      idEmpresa: v.idEmpresa || undefined,
      idCuenta: v.idCuenta,
      idCategoriaGasto: v.idCategoriaGasto,
      fecha: v.fecha,
      proximoMes: v.proximoMes,
    };
    this.ref.close(payload);
  }
}
