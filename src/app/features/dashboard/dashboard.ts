import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption, ECElementEvent } from 'echarts/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../core/auth/token.service';
import { Ingreso } from '../../core/models/ingreso';
import { Registro } from '../../core/models/registro';
import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { IngresoService } from '../../core/services/ingreso.service';
import { RegistroAhorroService } from '../../core/services/registro-ahorro.service';
import { RegistroService } from '../../core/services/registro.service';
import { CardRegistro } from '../../shared/components/card-registro/card-registro';
import { DetalleDialog } from '../../shared/components/detalle-dialog/detalle-dialog';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { valorAhorroActual } from '../../shared/utils/ahorro';
import { todayDateOnly } from '../../shared/utils/date';
import { IngresoDialog } from '../ingresos/ingreso-dialog';
import { RegistroDialog } from '../gastos/registro-dialog';

interface DatoGrafico {
  name: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgxEchartsDirective,
    RouterLink,
    CardRegistro,
    EmptyState,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly token = inject(TokenService);
  private readonly registroService = inject(RegistroService);
  private readonly ingresoService = inject(IngresoService);
  private readonly ahorroService = inject(RegistroAhorroService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  /** Nombre real del usuario (el token solo trae el login). */
  readonly userName = computed(() => this.auth.perfil()?.nombre ?? this.token.getUserName() ?? '');
  readonly periodo = signal(this.currentPeriod());
  readonly loading = signal(true);

  private readonly registros = signal<Registro[]>([]);
  private readonly ingresos = signal<Ingreso[]>([]);
  private readonly ahorros = signal<RegistroAhorro[]>([]);

  private readonly moneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });

  readonly totalIngresos = computed(() => this.ingresos().reduce((s, i) => s + i.valor, 0));
  readonly totalGastos = computed(() => this.registros().reduce((s, r) => s + r.valor, 0));
  /** El ahorro no se suma: se toma el valor del último registro. */
  readonly ahorroActual = computed(() => valorAhorroActual(this.ahorros()));
  readonly balance = computed(() => this.totalIngresos() - this.totalGastos());

  readonly gastosPorCategoria = computed(() => {
    const map = new Map<string, { value: number; color?: string }>();
    for (const r of this.registros()) {
      const nombre = r.categoriaGastoNombre ?? 'Otros';
      const entry = map.get(nombre) ?? { value: 0, color: r.categoriaGasto?.color };
      entry.value += r.valor;
      map.set(nombre, entry);
    }
    return [...map.entries()]
      .map(([name, { value, color }]) => ({
        name,
        value: Number(value.toFixed(2)),
        itemStyle: color ? { color } : undefined,
      }))
      .sort((a, b) => b.value - a.value);
  });

  /** Gastos agrupados por cuenta, para el gráfico de barras horizontales. */
  readonly gastosPorCuenta = computed<DatoGrafico[]>(() => {
    const map = new Map<string, number>();
    for (const r of this.registros()) {
      const nombre = r.cuenta?.nombre ?? 'Sin cuenta';
      map.set(nombre, (map.get(nombre) ?? 0) + r.valor);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  });

  /** Últimos gastos del periodo, para la grilla de cards. */
  readonly gastosRecientes = computed<Registro[]>(() =>
    [...this.registros()].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '')).slice(0, 8),
  );

  readonly donutOption = computed<EChartsCoreOption>(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center', type: 'scroll', textStyle: { color: '#a5ddc4' } },
    color: ['#34d399', '#2dd4bf', '#6ee7b7', '#5eead4', '#4ade80', '#a7f3d0', '#22d3ee', '#86efac'],
    series: [
      {
        name: 'Gastos por categoría',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 6, borderColor: '#0a1e18', borderWidth: 2 },
        label: { show: false },
        data: this.gastosPorCategoria(),
      },
    ],
  }));

  /** Comparativa de ingresos, gastos y la diferencia (balance) del periodo. */
  readonly comparativaOption = computed<EChartsCoreOption>(() => {
    const balance = this.balance();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v: unknown) => this.formatoMoneda(Number(v)),
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '14%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Ingresos', 'Gastos', 'Balance'],
        axisLabel: { color: '#a5ddc4' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#a5ddc4' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      series: [
        {
          name: 'Periodo',
          type: 'bar',
          barWidth: '38%',
          data: [
            {
              value: this.totalIngresos(),
              itemStyle: { color: '#34d399', borderRadius: [8, 8, 0, 0] },
            },
            {
              value: this.totalGastos(),
              itemStyle: { color: '#f87171', borderRadius: [8, 8, 0, 0] },
            },
            {
              value: balance,
              itemStyle: { color: balance >= 0 ? '#38bdf8' : '#f87171', borderRadius: [8, 8, 0, 0] },
            },
          ],
          label: {
            show: true,
            position: 'top',
            color: '#d6f0e4',
            fontWeight: 600,
            formatter: (p: { value: unknown }) => this.formatoMoneda(Number(p.value)),
          },
        },
      ],
    };
  });

  /** Gastos por cuenta: barras horizontales ordenadas de mayor a menor. */
  readonly cuentaOption = computed<EChartsCoreOption>(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v: unknown) => this.formatoMoneda(Number(v)),
    },
    grid: { left: '3%', right: '6%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#a5ddc4' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    yAxis: {
      type: 'category',
      data: this.gastosPorCuenta().map((d) => d.name),
      inverse: true,
      axisLabel: { color: '#a5ddc4' },
    },
    series: [
      {
        name: 'Gastos por cuenta',
        type: 'bar',
        data: this.gastosPorCuenta().map((d) => d.value),
        itemStyle: { color: '#34d399', borderRadius: [0, 6, 6, 0] },
      },
    ],
  }));

  ngOnInit(): void {
    this.cargar();
  }

  onPeriodoChange(p: string): void {
    this.periodo.set(p);
    this.cargar();
  }

  /** Acceso directo: alta de gasto. */
  abrirGasto(): void {
    const ref = this.dialog.open(RegistroDialog, { width: '480px', data: {} });
    ref.afterClosed().subscribe((res?: Registro) => {
      if (!res) {
        return;
      }
      this.registroService.insert(res).subscribe({
        next: () => {
          this.snackbar.open('Gasto creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el gasto', 'Cerrar'),
      });
    });
  }

  /** Acceso directo: alta de ingreso. */
  abrirIngreso(): void {
    const ref = this.dialog.open(IngresoDialog, { width: '440px', data: {} });
    ref.afterClosed().subscribe((res?: Ingreso) => {
      if (!res) {
        return;
      }
      this.ingresoService.insert(res).subscribe({
        next: () => {
          this.snackbar.open('Ingreso creado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el ingreso', 'Cerrar'),
      });
    });
  }

  /** Edición de un gasto desde la grilla de cards. */
  editarGasto(item: Registro): void {
    const ref = this.dialog.open(RegistroDialog, { width: '480px', data: { item } });
    ref.afterClosed().subscribe((res?: Registro) => {
      if (!res) {
        return;
      }
      this.registroService.update(res).subscribe({
        next: () => {
          this.snackbar.open('Gasto actualizado', 'Cerrar');
          this.cargar();
        },
        error: () => this.snackbar.open('No se pudo guardar el gasto', 'Cerrar'),
      });
    });
  }

  /** Marca el gasto como pagado (o viceversa). */
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
    this.registroService.update(payload).subscribe({
      next: () => {
        this.snackbar.open(pagado ? 'Gasto marcado como pagado' : 'Gasto marcado como pendiente', 'Cerrar');
        this.cargar();
      },
      error: () => this.snackbar.open('No se pudo actualizar el estado', 'Cerrar'),
    });
  }

  /** Click sobre el donut de gastos por categoría: abre el detalle. */
  onGastosCategoriaClick(event: ECElementEvent): void {
    const nombre = String(event.name ?? '');
    const registros = this.registros().filter((r) => (r.categoriaGastoNombre ?? 'Otros') === nombre);
    this.abrirDetalleGastos(`Gastos de ${nombre}`, registros);
  }

  /** Click sobre las barras de gastos por cuenta: abre el detalle. */
  onGastosCuentaClick(event: ECElementEvent): void {
    const nombre = String(event.name ?? '');
    const registros = this.registros().filter((r) => (r.cuenta?.nombre ?? 'Sin cuenta') === nombre);
    this.abrirDetalleGastos(`Gastos de ${nombre}`, registros);
  }

  /** Click sobre la barra de "Gastos" del chart comparativo: abre el detalle. */
  onComparativaClick(event: ECElementEvent): void {
    if (String(event.name ?? '') !== 'Gastos') {
      return;
    }
    this.abrirDetalleGastos('Gastos del periodo', this.registros());
  }

  private abrirDetalleGastos(titulo: string, registros: Registro[]): void {
    const ref = this.dialog.open(DetalleDialog, {
      width: '640px',
      data: { titulo, periodo: this.periodo(), tipo: 'gastos', registros },
    });
    ref.componentInstance.editarGasto.subscribe((item) => this.editarGasto(item));
    ref.componentInstance.togglePagado.subscribe((item) => this.togglePagado(item));
  }

  private cargar(): void {
    this.loading.set(true);
    const p = this.periodo();
    forkJoin([
      this.registroService.getAllByUsuario(p),
      this.ingresoService.getAllByUsuario(p),
      this.ahorroService.getAllByUsuario(p),
    ]).subscribe({
      next: ([registros, ingresos, ahorros]) => {
        this.registros.set(registros);
        this.ingresos.set(ingresos);
        this.ahorros.set(ahorros);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private formatoMoneda(valor: number): string {
    return this.moneda.format(valor);
  }

  private currentPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
