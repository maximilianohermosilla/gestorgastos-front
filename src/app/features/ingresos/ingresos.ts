import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { CategoriaIngreso } from '../../core/models/categoria-ingreso';
import { Ingreso } from '../../core/models/ingreso';
import { CategoriaIngresoService } from '../../core/services/categoria-ingreso.service';
import { IngresoService } from '../../core/services/ingreso.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { textoContraste } from '../../shared/utils/color';
import { currentPeriod } from '../../shared/utils/date';
import { IngresoDialog } from './ingreso-dialog';

@Component({
  selector: 'app-ingresos',
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
    EmptyState,
    DateShortPipe,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './ingresos.html',
})
export class Ingresos implements OnInit {
  private readonly service = inject(IngresoService);
  private readonly categoriaService = inject(CategoriaIngresoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly periodo = signal(currentPeriod());
  readonly categoria = new FormControl<number | null>(null);
  readonly searchText = signal('');

  readonly categorias = signal<CategoriaIngreso[]>([]);
  readonly items = signal<Ingreso[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['categoria', 'fecha', 'descripcion', 'valor', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    return this.items().filter((i) => (i.descripcion ?? '').toLowerCase().includes(term));
  });

  readonly total = computed(() => this.filtered().reduce((s, i) => s + i.valor, 0));

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

  colorTexto(hex?: string | null): string {
    return textoContraste(hex);
  }

  cargar(): void {
    this.loading.set(true);
    this.service.getAllByUsuario(this.periodo(), this.categoria.value ?? undefined).subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudieron cargar los ingresos', 'Cerrar');
      },
    });
  }

  abrir(item?: Ingreso): void {
    const ref = this.dialog.open(IngresoDialog, { width: '440px', data: { item } });
    ref.afterClosed().subscribe((res?: Ingreso) => {
      if (!res) {
        return;
      }
      const accion = item?.id ? this.service.update(res) : this.service.insert(res);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Ingreso actualizado' : 'Ingreso creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el ingreso', 'Cerrar'),
      });
    });
  }

  eliminar(item: Ingreso): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar el ingreso "${item.descripcion}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Ingreso eliminado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar el ingreso', 'Cerrar'),
      });
    });
  }
}
