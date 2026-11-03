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
import { Suscripcion } from '../../core/models/suscripcion';
import { SuscripcionService } from '../../core/services/suscripcion.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { SuscripcionDialog } from './suscripcion-dialog';

@Component({
  selector: 'app-suscripciones',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    EmptyState,
    DateShortPipe,
    MoneyPipe,
  ],
  templateUrl: './suscripciones.html',
})
export class Suscripciones implements OnInit {
  private readonly service = inject(SuscripcionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly searchText = signal('');
  readonly items = signal<Suscripcion[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['nombre', 'valor', 'desde', 'hasta', 'cuotas', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    return this.items().filter((s) => (s.nombre ?? '').toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.cargar();
  }

  onSearch(e: Event): void {
    this.searchText.set((e.target as HTMLInputElement).value);
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
