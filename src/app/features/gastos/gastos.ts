import { Component, inject, OnInit, signal } from '@angular/core';
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
import { TokenService } from '../../core/auth/token.service';
import { CategoriaGasto } from '../../core/models/categoria-gasto';
import { Registro } from '../../core/models/registro';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { RegistroService } from '../../core/services/registro.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { currentPeriod, todayDateOnly } from '../../shared/utils/date';
import { RegistroDialog } from './registro-dialog';

@Component({
  selector: 'app-gastos',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
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
  ],
  templateUrl: './gastos.html',
})
export class Gastos implements OnInit {
  private readonly service = inject(RegistroService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly token = inject(TokenService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly periodo = new FormControl<string>(currentPeriod(), { nonNullable: true });
  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly categoria = new FormControl<number | null>(null);
  readonly soloPendientes = new FormControl<boolean>(false, { nonNullable: true });

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly items = signal<Registro[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['fecha', 'descripcion', 'categoria', 'cuenta', 'valor', 'pagado', 'acciones'];

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const filters = {
      categoria: this.categoria.value ?? undefined,
      descripcion: this.search.value || undefined,
      pagado: this.soloPendientes.value ? false : undefined,
    };
    this.service.getAllByUsuario(this.periodo.value, filters).subscribe({
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
