import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RegistroVinculado } from '../../core/models/registro-vinculado';
import { RegistroVinculadoService } from '../../core/services/registro-vinculado.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { CuotasDialog } from './cuotas-dialog';
import { VinculadoDialog } from './vinculado-dialog';

@Component({
  selector: 'app-vinculados',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    EmptyState,
    MoneyPipe,
  ],
  templateUrl: './vinculados.html',
})
export class Vinculados implements OnInit {
  private readonly service = inject(RegistroVinculadoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly searchText = signal('');
  readonly items = signal<RegistroVinculado[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['descripcion', 'cuotas', 'valorFinal', 'valorCuota', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    return this.items().filter((v) => (v.descripcion ?? '').toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.cargar();
  }

  onSearch(e: Event): void {
    this.searchText.set((e.target as HTMLInputElement).value);
  }

  valorCuota(item: RegistroVinculado): number {
    return item.cuotas > 0 ? item.valorFinal / item.cuotas : 0;
  }

  cargar(): void {
    this.loading.set(true);
    this.service.getAllByUsuario().subscribe({
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

  verCuotas(item: RegistroVinculado): void {
    this.dialog.open(CuotasDialog, {
      width: '560px',
      data: { titulo: item.descripcion ?? 'Cuotas', registros: item.registros ?? [] },
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
