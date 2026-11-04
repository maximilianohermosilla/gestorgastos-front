import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { forkJoin } from 'rxjs';
import { Ingreso } from '../../core/models/ingreso';
import { Registro } from '../../core/models/registro';
import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { ExcelService } from '../../core/services/excel.service';
import { IngresoService } from '../../core/services/ingreso.service';
import { RegistroAhorroService } from '../../core/services/registro-ahorro.service';
import { RegistroService } from '../../core/services/registro.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FormPeriodo } from '../../shared/components/form-periodo/form-periodo';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface DatoGrafico {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

@Component({
  selector: 'app-reportes',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxEchartsDirective,
    EmptyState,
    MoneyPipe,
    FormPeriodo,
  ],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  private readonly registroService = inject(RegistroService);
  private readonly ingresoService = inject(IngresoService);
  private readonly ahorroService = inject(RegistroAhorroService);
  private readonly excel = inject(ExcelService);

  readonly periodo = signal(String(new Date().getFullYear()));

  readonly loading = signal(true);
  private readonly registros = signal<Registro[]>([]);
  private readonly ingresos = signal<Ingreso[]>([]);
  private readonly ahorros = signal<RegistroAhorro[]>([]);

  readonly totalIngresos = computed(() => this.ingresos().reduce((s, i) => s + i.valor, 0));
  readonly totalGastos = computed(() => this.registros().reduce((s, r) => s + r.valor, 0));
  readonly totalAhorros = computed(() => this.ahorros().reduce((s, a) => s + a.valor, 0));
  readonly balance = computed(() => this.totalIngresos() - this.totalGastos());

  readonly gastosCategoriaData = computed(() =>
    this.groupByCategoria(this.registros(), (r) => r.categoriaGastoNombre ?? 'Otros', (r) => r.categoriaGasto?.color),
  );
  readonly gastosCuentaData = computed(() => this.groupBy(this.registros(), (r) => r.cuenta?.nombre ?? 'Sin cuenta'));
  readonly ingresosCategoriaData = computed(() =>
    this.groupByCategoria(this.ingresos(), (i) => i.categoriaIngresoNombre ?? 'Otros', (i) => i.categoriaIngreso?.color),
  );

  readonly gastosCategoriaOption = computed(() => this.donutOption(this.gastosCategoriaData(), 'Gastos por categoría'));
  readonly ingresosCategoriaOption = computed(() => this.donutOption(this.ingresosCategoriaData(), 'Ingresos por categoría'));
  readonly gastosCuentaOption = computed(() => this.barOption(this.gastosCuentaData(), 'Gastos por cuenta'));

  /** El periodo puede ser un año ("2026") o un mes ("2026-08"). */
  readonly esMes = computed(() => this.periodo().length === 7);

  readonly tituloEvolucion = computed(() => (this.esMes() ? 'Detalle del mes' : 'Evolución mensual'));

  /** Meses incluidos en el gráfico de evolución según el periodo elegido. */
  private indicesEvolucion(): number[] {
    if (this.esMes()) {
      const m = Number(this.periodo().substring(5, 7)) - 1;
      return m >= 0 && m < 12 ? [m] : [0];
    }
    return Array.from({ length: 12 }, (_, i) => i);
  }

  readonly evolucionOption = computed<EChartsCoreOption>(() => {
    const ingresos = new Array<number>(12).fill(0);
    const gastos = new Array<number>(12).fill(0);
    const ahorros = new Array<number>(12).fill(0);
    for (const i of this.ingresos()) {
      const m = this.mesDe(i.fecha);
      if (m >= 0) ingresos[m] += i.valor;
    }
    for (const r of this.registros()) {
      const m = this.mesDe(r.fecha);
      if (m >= 0) gastos[m] += r.valor;
    }
    for (const a of this.ahorros()) {
      const m = this.mesDe(a.fecha);
      if (m >= 0) ahorros[m] += a.valor;
    }
    const indices = this.indicesEvolucion();
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Ingresos', 'Gastos', 'Ahorros'], bottom: 0, textStyle: { color: '#a5ddc4' } },
      grid: { left: '3%', right: '4%', bottom: '14%', top: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: indices.map((i) => MESES[i]),
        boundaryGap: false,
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
          name: 'Ingresos',
          type: 'line',
          smooth: true,
          data: indices.map((i) => ingresos[i]),
          itemStyle: { color: '#34d399' },
          areaStyle: { opacity: 0.08 },
        },
        {
          name: 'Gastos',
          type: 'line',
          smooth: true,
          data: indices.map((i) => gastos[i]),
          itemStyle: { color: '#f87171' },
          areaStyle: { opacity: 0.08 },
        },
        {
          name: 'Ahorros',
          type: 'line',
          smooth: true,
          data: indices.map((i) => ahorros[i]),
          itemStyle: { color: '#38bdf8' },
          areaStyle: { opacity: 0.08 },
        },
      ],
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  onPeriodoChange(p: string): void {
    this.periodo.set(p);
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const periodo = this.periodo();
    forkJoin([
      this.registroService.getAllByUsuario(periodo),
      this.ingresoService.getAllByUsuario(periodo),
      this.ahorroService.getAllByUsuario(periodo),
    ]).subscribe({
      next: ([r, i, a]) => {
        this.registros.set(r);
        this.ingresos.set(i);
        this.ahorros.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  exportar(): void {
    const gastos = this.registros().map((r) => ({
      Fecha: r.fecha?.substring(0, 10) ?? '',
      Descripcion: r.descripcion ?? '',
      Categoria: r.categoriaGastoNombre ?? '',
      Cuenta: r.cuenta?.nombre ?? '',
      Valor: r.valor,
      Pagado: r.pagado ? 'Sí' : 'No',
    }));
    const ingresos = this.ingresos().map((i) => ({
      Fecha: i.fecha?.substring(0, 10) ?? '',
      Descripcion: i.descripcion ?? '',
      Categoria: i.categoriaIngresoNombre ?? '',
      Valor: i.valor,
    }));
    const ahorros = this.ahorros().map((a) => ({
      Fecha: a.fecha?.substring(0, 10) ?? '',
      Descripcion: a.descripcion ?? '',
      Cuenta: a.cuentaNombre ?? '',
      Monto: a.valor,
      Diferencia: a.diferencia,
    }));
    this.excel.export({ Gastos: gastos, Ingresos: ingresos, Ahorros: ahorros }, `reporte-${this.periodo()}.xlsx`);
  }

  private groupBy<T extends { valor: number }>(items: T[], key: (item: T) => string): DatoGrafico[] {
    const map = new Map<string, number>();
    for (const item of items) {
      const k = key(item);
      map.set(k, (map.get(k) ?? 0) + item.valor);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }

  private groupByCategoria<T extends { valor: number }>(
    items: T[],
    nameKey: (item: T) => string,
    colorKey: (item: T) => string | undefined,
  ): DatoGrafico[] {
    const map = new Map<string, { value: number; color?: string }>();
    for (const item of items) {
      const name = nameKey(item);
      const entry = map.get(name) ?? { value: 0, color: colorKey(item) };
      entry.value += item.valor;
      map.set(name, entry);
    }
    return [...map.entries()]
      .map(([name, { value, color }]) => ({
        name,
        value: Number(value.toFixed(2)),
        itemStyle: color ? { color } : undefined,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private mesDe(fecha?: string): number {
    const m = Number(fecha?.substring(5, 7));
    return Number.isNaN(m) || m < 1 || m > 12 ? -1 : m - 1;
  }

  private donutOption(data: DatoGrafico[], nombre: string): EChartsCoreOption {
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, left: 'center', type: 'scroll', textStyle: { color: '#a5ddc4' } },
      color: ['#34d399', '#2dd4bf', '#6ee7b7', '#5eead4', '#4ade80', '#a7f3d0', '#22d3ee', '#86efac'],
      series: [
        {
          name: nombre,
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          itemStyle: { borderRadius: 6, borderColor: '#0a1e18', borderWidth: 2 },
          label: { show: false },
          data,
        },
      ],
    };
  }

  private barOption(data: DatoGrafico[], nombre: string): EChartsCoreOption {
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '6%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#a5ddc4' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      yAxis: { type: 'category', data: data.map((d) => d.name), inverse: true, axisLabel: { color: '#a5ddc4' } },
      series: [
        { name: nombre, type: 'bar', data: data.map((d) => d.value), itemStyle: { color: '#34d399', borderRadius: [0, 6, 6, 0] } },
      ],
    };
  }
}
