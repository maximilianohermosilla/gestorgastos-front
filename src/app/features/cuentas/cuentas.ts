import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { TokenService } from '../../core/auth/token.service';
import { Cuenta } from '../../core/models/cuenta';
import { CuentaService } from '../../core/services/cuenta.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { CuentaDialog } from './cuenta-dialog';

@Component({
  selector: 'app-cuentas',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, EmptyState],
  templateUrl: './cuentas.html',
})
export class Cuentas implements OnInit {
  private readonly service = inject(CuentaService);
  private readonly token = inject(TokenService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly columnas = ['nombre', 'tipo', 'tarjeta', 'estado', 'acciones'];
  readonly items = signal<Cuenta[]>([]);
  readonly loading = signal(false);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly paged = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.items().slice(start, start + this.pageSize());
  });

  onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.pageIndex.set(0);
    this.loading.set(true);
    this.service.getAllByUsuario().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudieron cargar las cuentas', 'Cerrar');
      },
    });
  }

  abrir(item?: Cuenta): void {
    const ref = this.dialog.open(CuentaDialog, { width: '440px', data: { item } });
    ref.afterClosed().subscribe((res?: Cuenta) => {
      if (!res) {
        return;
      }
      const idUsuario = Number(this.token.getUserId() ?? 0);
      const body = { ...res, idUsuario };
      const accion = item?.id ? this.service.update({ ...body, id: item.id }) : this.service.insert(body);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Cuenta actualizada' : 'Cuenta creada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar la cuenta', 'Cerrar'),
      });
    });
  }

  eliminar(item: Cuenta): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar la cuenta "${item.nombre}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Cuenta eliminada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar la cuenta', 'Cerrar'),
      });
    });
  }
}
