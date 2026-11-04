import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { forkJoin } from 'rxjs';
import { TokenService } from '../../core/auth/token.service';
import { Ingreso } from '../../core/models/ingreso';
import { Registro } from '../../core/models/registro';
import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { IngresoService } from '../../core/services/ingreso.service';
import { RegistroAhorroService } from '../../core/services/registro-ahorro.service';
import { RegistroService } from '../../core/services/registro.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
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
    EmptyState,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly token = inject(TokenService);
  private readonly registroService = inject(RegistroService);
  private readonly ingresoService = inject(IngresoService);
  private readonly ahorroService = inject(RegistroAhorroService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);

  readonly userName = this.token.getUserName() ?? '';
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
  readonly totalAhorros = computed(() => this.ahorros().reduce((s, a) => s + a.valor, 0));
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
