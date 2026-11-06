import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { CategoriaGasto } from '../../core/models/categoria-gasto';
import { Cuenta } from '../../core/models/cuenta';
import { Registro } from '../../core/models/registro';
import { Suscripcion } from '../../core/models/suscripcion';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { RegistroService } from '../../core/services/registro.service';
import { SuscripcionService } from '../../core/services/suscripcion.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { DetalleDialog } from '../../shared/components/detalle-dialog/detalle-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { textoContraste } from '../../shared/utils/color';
import { currentPeriod } from '../../shared/utils/date';
import { RegistroDialog } from '../gastos/registro-dialog';
import { SuscripcionDialog } from './suscripcion-dialog';

@Component({
  selector: 'app-suscripciones',
  imports: [
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
    EmptyState,
    DateShortPipe,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './suscripciones.html',
})
export class Suscripciones implements OnInit {
  private readonly service = inject(SuscripcionService);
  private readonly categoriaService = inject(CategoriaGastoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly registroService = inject(RegistroService);

  readonly periodo = signal(currentPeriod());
  readonly searchText = signal('');
  readonly categoria = signal<number | null>(null);
  readonly cuenta = signal<number | null>(null);

  readonly categorias = signal<CategoriaGasto[]>([]);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly items = signal<Suscripcion[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['categoria', 'nombre', 'valor', 'desde', 'hasta', 'cuotas', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    const cat = this.categoria();
    const cta = this.cuenta();
    return this.items().filter((s) => {
      const reg = s.registros?.[0];
      if (term && !(s.nombre ?? '').toLowerCase().includes(term)) {
        return false;
      }
      if (cat && reg?.idCategoriaGasto !== cat) {
        return false;
      }
      if (cta && reg?.idCuenta !== cta) {
        return false;
      }
      return true;
    });
  });

  readonly total = computed(() => this.filtered().reduce((s, x) => s + x.valorActual, 0));

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

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe((r) => this.categorias.set(r));
    this.cuentaService.getAllByUsuario().subscribe((r) => this.cuentas.set(r));
    this.cargar();
  }

  onSearch(e: Event): void {
    this.pageIndex.set(0);
    this.searchText.set((e.target as HTMLInputElement).value);
  }

  onPeriodoChange(p: string): void {
    this.periodo.set(p);
    this.cargar();
  }

  onCategoriaChange(v: number | null): void {
    this.categoria.set(v);
    this.pageIndex.set(0);
  }

  onCuentaChange(v: number | null): void {
    this.cuenta.set(v);
    this.pageIndex.set(0);
  }

  categoriaDe(item: Suscripcion): CategoriaGasto | undefined {
    return item.registros?.[0]?.categoriaGasto;
  }

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }

  cargar(): void {
    this.pageIndex.set(0);
    this.loading.set(true);
    this.service.getAllByUsuario(this.periodo()).subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudieron cargar las suscripciones', 'Cerrar');
      },
    });
  }

  abrir(item?: Suscripcion): void {
    const ref = this.dialog.open(SuscripcionDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: Suscripcion) => {
      if (!res) {
        return;
      }
      const accion = item?.id ? this.service.update(res) : this.service.insert(res);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Suscripción actualizada' : 'Suscripción creada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar la suscripción', 'Cerrar'),
      });
    });
  }

  /** Detalle de los cargos generados por la suscripción (grilla de cards). */
  verCargos(item: Suscripcion): void {
    const ref = this.dialog.open(DetalleDialog, {
      width: '640px',
      data: {
        titulo: item.nombre ?? 'Cargos',
        tipo: 'gastos',
        registros: item.registros ?? [],
      },
    });
    ref.componentInstance.editarGasto.subscribe((registro) => this.editarCarga(registro));
    ref.componentInstance.togglePagado.subscribe((registro) => this.togglePagado(registro));
  }

  /** Edita un cargo individual desde el detalle. */
  editarCarga(item: Registro): void {
    const ref = this.dialog.open(RegistroDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: Registro) => {
      if (!res) {
        return;
      }
      this.registroService.update(res).subscribe({
        next: () => {
          this.snackbar.open('Carga actualizada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar la carga', 'Cerrar'),
      });
    });
  }

  /** Marca un cargo como pagado (o viceversa). */
  togglePagado(item: Registro): void {
    const pagado = !item.pagado;
    this.registroService.alternarPago(item).subscribe({
      next: () => {
        this.snackbar.open(pagado ? 'Carga marcada como pagada' : 'Carga marcada como pendiente', 'Cerrar');
        this.cargar();
      },
      error: () => this.snackbar.open('No se pudo actualizar el estado', 'Cerrar'),
    });
  }

  eliminar(item: Suscripcion): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar la suscripción "${item.nombre}" y todos sus registros?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Suscripción eliminada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar la suscripción', 'Cerrar'),
      });
    });
  }
}
