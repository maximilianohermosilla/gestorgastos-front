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
import { Tarjeta } from '../../core/models/tarjeta';
import { TarjetaService } from '../../core/services/tarjeta.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TarjetaDialog } from './tarjeta-dialog';

@Component({
  selector: 'app-tarjetas',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, EmptyState],
  templateUrl: './tarjetas.html',
})
export class Tarjetas implements OnInit {
  private readonly service = inject(TarjetaService);
  private readonly token = inject(TokenService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly columnas = ['numero', 'banco', 'tipo', 'vencimiento', 'estado', 'acciones'];
  readonly items = signal<Tarjeta[]>([]);
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
        this.snackbar.open('No se pudieron cargar las tarjetas', 'Cerrar');
      },
    });
  }

  abrir(item?: Tarjeta): void {
    const ref = this.dialog.open(TarjetaDialog, { width: '440px', data: { item } });
    ref.afterClosed().subscribe((res?: Tarjeta) => {
      if (!res) {
        return;
      }
      const idUsuario = Number(this.token.getUserId() ?? 0);
      const body = { ...res, idUsuario };
      const accion = item?.id ? this.service.update({ ...body, id: item.id }) : this.service.insert(body);
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Tarjeta actualizada' : 'Tarjeta creada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar la tarjeta', 'Cerrar'),
      });
    });
  }

  eliminar(item: Tarjeta): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar la tarjeta "${item.numero}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Tarjeta eliminada', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar la tarjeta', 'Cerrar'),
      });
    });
  }
}
