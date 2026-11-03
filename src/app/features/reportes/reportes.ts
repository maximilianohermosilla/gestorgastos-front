import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
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
import { MoneyPipe } from '../../shared/pipes/money.pipe';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface DatoGrafico {
  name: string;
  value: number;
}

@Component({
  selector: 'app-reportes',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    NgxEchartsDirective,
    EmptyState,
    MoneyPipe,
  ],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  private readonly registroService = inject(RegistroService);
  private readonly ingresoService = inject(IngresoService);
  private readonly ahorroService = inject(RegistroAhorroService);
  private readonly excel = inject(ExcelService);

  readonly currentYear = new Date().getFullYear();
  readonly anios = Array.from({ length: 6 }, (_, i) => this.currentYear - i);
  readonly anio = new FormControl<number>(this.currentYear, { nonNullable: true });

  readonly loading = signal(true);
  private readonly registros = signal<Registro[]>([]);
  private readonly ingresos = signal<Ingreso[]>([]);
  private readonly ahorros = signal<RegistroAhorro[]>([]);

  readonly totalIngresos = computed(() => this.ingresos().reduce((s, i) => s + i.valor, 0));
  readonly totalGastos = computed(() => this.registros().reduce((s, r) => s + r.valor, 0));
  readonly totalAhorros = computed(() => this.ahorros().reduce((s, a) => s + a.valor, 0));
  readonly balance = computed(() => this.totalIngresos() - this.totalGastos());

  readonly gastosCategoriaData = computed(() => this.groupBy(this.registros(), (r) => r.categoriaGastoNombre ?? 'Otros'));
  readonly gastosCuentaData = computed(() => this.groupBy(this.registros(), (r) => r.cuenta?.nombre ?? 'Sin cuenta'));
  readonly ingresosCategoriaData = computed(() => this.groupBy(this.ingresos(), (i) => i.categoriaIngresoNombre ?? 'Otros'));

  readonly gastosCategoriaOption = computed(() => this.donutOption(this.gastosCategoriaData(), 'Gastos por categoría'));
  readonly ingresosCategoriaOption = computed(() => this.donutOption(this.ingresosCategoriaData(), 'Ingresos por categoría'));
  readonly gastosCuentaOption = computed(() => this.barOption(this.gastosCuentaData(), 'Gastos por cuenta'));

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
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Ingresos', 'Gastos', 'Ahorros'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '14%', top: '3%', containLabel: true },
      xAxis: { type: 'category', data: MESES, boundaryGap: false },
      yAxis: { type: 'value' },
      series: [
        { name: 'Ingresos', type: 'line', smooth: true, data: ingresos, itemStyle: { color: '#2e7d32' }, areaStyle: { opacity: 0.08 } },
        { name: 'Gastos', type: 'line', smooth: true, data: gastos, itemStyle: { color: '#c62828' }, areaStyle: { opacity: 0.08 } },
        { name: 'Ahorros', type: 'line', smooth: true, data: ahorros, itemStyle: { color: '#1565c0' }, areaStyle: { opacity: 0.08 } },
      ],
    };
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    const periodo = String(this.anio.value);
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
    this.excel.export({ Gastos: gastos, Ingresos: ingresos, Ahorros: ahorros }, `reporte-${this.anio.value}.xlsx`);
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

  private mesDe(fecha?: string): number {
    const m = Number(fecha?.substring(5, 7));
    return Number.isNaN(m) || m < 1 || m > 12 ? -1 : m - 1;
  }

  private donutOption(data: DatoGrafico[], nombre: string): EChartsCoreOption {
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, left: 'center', type: 'scroll' },
      series: [
        {
          name: nombre,
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
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
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: data.map((d) => d.name), inverse: true },
      series: [{ name: nombre, type: 'bar', data: data.map((d) => d.value), itemStyle: { borderRadius: [0, 6, 6, 0] } }],
    };
  }
}
