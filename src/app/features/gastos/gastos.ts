import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { TokenService } from '../../core/auth/token.service';
import { CategoriaGasto } from '../../core/models/categoria-gasto';
import { Cuenta } from '../../core/models/cuenta';
import { Registro } from '../../core/models/registro';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { RegistroService } from '../../core/services/registro.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { textoContraste } from '../../shared/utils/color';
import { currentPeriod, todayDateOnly } from '../../shared/utils/date';
import { RegistroDialog } from './registro-dialog';

@Component({
  selector: 'app-gastos',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    EmptyState,
    DateShortPipe,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './gastos.html',
})
export class Gastos implements OnInit {
  private readonly service = inject(RegistroService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly token = inject(TokenService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly periodo = signal(currentPeriod());
  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly categoria = new FormControl<number | null>(null);
  readonly cuenta = signal<number | null>(null);
  readonly soloPendientes = new FormControl<boolean>(false, { nonNullable: true });

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly items = signal<Registro[]>([]);
  readonly loading = signal(false);

  readonly filtered = computed(() => {
    const c = this.cuenta();
    return c ? this.items().filter((r) => r.idCuenta === c) : this.items();
  });

  readonly total = computed(() => this.filtered().reduce((s, r) => s + r.valor, 0));

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly paged = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  readonly columnas = ['categoria', 'fecha', 'descripcion', 'cuenta', 'valor', 'pagado', 'acciones'];

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
    this.cuentaService.getAllByUsuario().subscribe((r) => this.cuentas.set(r));
    this.cargar();
  }

  onPeriodoChange(p: string): void {
    this.periodo.set(p);
    this.cargar();
  }

  onCuentaChange(v: number | null): void {
    this.cuenta.set(v);
    this.pageIndex.set(0);
  }

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }

  cargar(): void {
    this.pageIndex.set(0);
    this.loading.set(true);
    const filters = {
      categoria: this.categoria.value ?? undefined,
      descripcion: this.search.value || undefined,
      pagado: this.soloPendientes.value ? false : undefined,
    };
    this.service.getAllByUsuario(this.periodo(), filters).subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudieron cargar los gastos', 'Cerrar');
      },
    });
  }

  abrir(item?: Registro): void {
    const ref = this.dialog.open(RegistroDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: Registro) => {
      if (!res) {
        return;
      }
      const accion = item?.id ? this.service.update(res) : this.service.insert(res);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Gasto actualizado' : 'Gasto creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el gasto', 'Cerrar'),
      });
    });
  }

  togglePagado(item: Registro): void {
    const pagado = !item.pagado;
    const payload: Partial<Registro> = {
      id: item.id,
      descripcion: item.descripcion,
      idCategoriaGasto: item.idCategoriaGasto,
      idCuenta: item.idCuenta,
      idEmpresa: item.idEmpresa || undefined,
      idSuscripcion: item.idSuscripcion,
      idRegistroVinculado: item.idRegistroVinculado,
      numeroCuota: item.numeroCuota,
      fecha: item.fecha,
      valor: item.valor,
      idUsuario: Number(this.token.getUserId() ?? 0),
      observaciones: item.observaciones,
      periodo: item.periodo ?? item.fecha.substring(0, 7),
      pagado,
      fechaPago: pagado ? todayDateOnly() : undefined,
    };
    this.service.update(payload).subscribe({
      next: () => this.cargar(),
      error: () => this.snackbar.open('No se pudo actualizar el estado', 'Cerrar'),
    });
  }

  eliminar(item: Registro): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar el gasto "${item.descripcion}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Gasto eliminado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar el gasto', 'Cerrar'),
      });
    });
  }
}
