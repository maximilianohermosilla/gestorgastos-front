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
import { RegistroVinculado } from '../../core/models/registro-vinculado';
import { Registro } from '../../core/models/registro';
import { CategoriaGastoService } from '../../core/services/categoria-gasto.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { RegistroService } from '../../core/services/registro.service';
import { RegistroVinculadoService } from '../../core/services/registro-vinculado.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { DetalleDialog } from '../../shared/components/detalle-dialog/detalle-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { textoContraste } from '../../shared/utils/color';
import { currentPeriod } from '../../shared/utils/date';
import { RegistroDialog } from '../gastos/registro-dialog';
import { VinculadoDialog } from './vinculado-dialog';

@Component({
  selector: 'app-vinculados',
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
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './vinculados.html',
})
export class Vinculados implements OnInit {
  private readonly service = inject(RegistroVinculadoService);
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
  readonly items = signal<RegistroVinculado[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['categoria', 'descripcion', 'cuenta', 'cuotas', 'valorFinal', 'valorCuota', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    const cat = this.categoria();
    const cta = this.cuenta();
    return this.items().filter((v) => {
      const reg = v.registros?.[0];
      if (term && !(v.descripcion ?? '').toLowerCase().includes(term)) {
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

  readonly total = computed(() => this.filtered().reduce((s, x) => s + x.valorFinal, 0));

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

  categoriaDe(item: RegistroVinculado): CategoriaGasto | undefined {
    return item.registros?.[0]?.categoriaGasto;
  }

  cuentaDe(item: RegistroVinculado): string {
    return item.registros?.[0]?.cuenta?.nombre ?? '—';
  }

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }

  valorCuota(item: RegistroVinculado): number {
    return item.cuotas > 0 ? item.valorFinal / item.cuotas : 0;
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
        this.snackbar.open('No se pudieron cargar los gastos en cuotas', 'Cerrar');
      },
    });
  }

  abrir(item?: RegistroVinculado): void {
    const ref = this.dialog.open(VinculadoDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: RegistroVinculado) => {
      if (!res) {
        return;
      }
      const accion = item?.id ? this.service.update(res) : this.service.insert(res);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Gasto en cuotas actualizado' : 'Gasto en cuotas creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el gasto en cuotas', 'Cerrar'),
      });
    });
  }

  /** Detalle de las cuotas del gasto en cuotas (grilla de cards). */
  verCuotas(item: RegistroVinculado): void {
    const ref = this.dialog.open(DetalleDialog, {
      width: '640px',
      data: {
        titulo: item.descripcion ?? 'Cuotas',
        tipo: 'gastos',
        registros: item.registros ?? [],
      },
    });
    ref.componentInstance.editarGasto.subscribe((registro) => this.editarCuota(registro));
    ref.componentInstance.togglePagado.subscribe((registro) => this.togglePagado(registro));
  }

  /** Edita una cuota individual desde el detalle. */
  editarCuota(item: Registro): void {
    const ref = this.dialog.open(RegistroDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: Registro) => {
      if (!res) {
        return;
      }
      this.registroService.update(res).subscribe({
        next: () => {
          this.snackbar.open('Cuota actualizada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar la cuota', 'Cerrar'),
      });
    });
  }

  /** Marca una cuota como pagada (o viceversa). */
  togglePagado(item: Registro): void {
    const pagado = !item.pagado;
    this.registroService.alternarPago(item).subscribe({
      next: () => {
        this.snackbar.open(pagado ? 'Cuota marcada como pagada' : 'Cuota marcada como pendiente', 'Cerrar');
        this.cargar();
      },
      error: () => this.snackbar.open('No se pudo actualizar el estado', 'Cerrar'),
    });
  }

  eliminar(item: RegistroVinculado): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar el gasto "${item.descripcion}" y sus cuotas?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Gasto en cuotas eliminado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar el gasto en cuotas', 'Cerrar'),
      });
    });
  }
}
