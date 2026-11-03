import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { RegistroAhorroService } from '../../core/services/registro-ahorro.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { DateShortPipe } from '../../shared/pipes/date-short.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { currentPeriod } from '../../shared/utils/date';
import { AhorroDialog } from './ahorro-dialog';

@Component({
  selector: 'app-ahorros',
  imports: [
    ReactiveFormsModule,
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
  templateUrl: './ahorros.html',
})
export class Ahorros implements OnInit {
  private readonly service = inject(RegistroAhorroService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly periodo = new FormControl<string>(currentPeriod(), { nonNullable: true });
  readonly searchText = signal('');

  readonly items = signal<RegistroAhorro[]>([]);
  readonly loading = signal(false);

  readonly columnas = ['fecha', 'descripcion', 'cuenta', 'valor', 'diferencia', 'acciones'];

  readonly filtered = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    return this.items().filter((a) => (a.descripcion ?? '').toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.cargar();
  }

  onSearch(e: Event): void {
    this.searchText.set((e.target as HTMLInputElement).value);
  }

  cargar(): void {
    this.loading.set(true);
    this.service.getAllByUsuario(this.periodo.value).subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudieron cargar los ahorros', 'Cerrar');
      },
    });
  }

  abrir(item?: RegistroAhorro): void {
    const ref = this.dialog.open(AhorroDialog, { width: '440px', data: { item } });
    ref.afterClosed().subscribe((res?: RegistroAhorro) => {
      if (!res) {
        return;
      }
      const accion = item?.id ? this.service.update(res) : this.service.insert(res);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Ahorro actualizado' : 'Ahorro creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el ahorro', 'Cerrar'),
      });
    });
  }

  eliminar(item: RegistroAhorro): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar el ahorro "${item.descripcion}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Ahorro eliminado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar el ahorro', 'Cerrar'),
      });
    });
  }
}
