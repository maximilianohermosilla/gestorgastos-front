import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { BancoService } from '../../../core/services/banco.service';
import { CrudService } from '../../../core/services/crud.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { TipoCuentaService } from '../../../core/services/tipo-cuenta.service';
import { TipoTarjetaService } from '../../../core/services/tipo-tarjeta.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { CatalogoDialog } from '../catalogo-dialog/catalogo-dialog';

type Entidad = 'empresa' | 'banco' | 'tipoCuenta' | 'tipoTarjeta';

interface Item {
  id: number;
  nombre?: string;
}

interface Config {
  titulo: string;
  service: CrudService<Item>;
}

@Component({
  selector: 'app-catalogo',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, EmptyState],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly bancoService = inject(BancoService);
  private readonly tipoCuentaService = inject(TipoCuentaService);
  private readonly tipoTarjetaService = inject(TipoTarjetaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly entity = input.required<Entidad>();

  private readonly config = computed<Config>(() => {
    const map: Record<Entidad, Config> = {
      empresa: { titulo: 'Empresas', service: this.empresaService },
      banco: { titulo: 'Bancos', service: this.bancoService },
      tipoCuenta: { titulo: 'Tipos de cuenta', service: this.tipoCuentaService },
      tipoTarjeta: { titulo: 'Tipos de tarjeta', service: this.tipoTarjetaService },
    };
    return map[this.entity()];
  });

  readonly columnas = ['nombre', 'acciones'];
  readonly items = signal<Item[]>([]);
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
    this.config().service.getAll().subscribe({
      next: (r) => {
        this.items.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackbar.open('No se pudo cargar el catálogo', 'Cerrar');
      },
    });
  }

  abrir(item?: Item): void {
    const ref = this.dialog.open(CatalogoDialog, {
      width: '420px',
      data: { titulo: this.config().titulo, item },
    });
    ref.afterClosed().subscribe((nombre?: string) => {
      if (nombre === undefined) {
        return;
      }
      const service = this.config().service;
      const accion = item?.id
        ? service.update({ id: item.id, nombre })
        : service.insert({ nombre });
      accion.subscribe({
        next: () => {
          this.snackbar.open(item?.id ? 'Registro actualizado' : 'Registro creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el registro', 'Cerrar'),
      });
    });
  }

  eliminar(item: Item): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar', mensaje: `¿Eliminar "${item.nombre}"?` },
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.config().service.delete(item.id).subscribe({
        next: () => {
          this.snackbar.open('Registro eliminado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo eliminar el registro', 'Cerrar'),
      });
    });
  }
}
