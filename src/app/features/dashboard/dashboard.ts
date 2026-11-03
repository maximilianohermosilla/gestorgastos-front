import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { MoneyPipe } from '../../shared/pipes/money.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgxEchartsDirective,
    EmptyState,
    MoneyPipe,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly token = inject(TokenService);
  private readonly registroService = inject(RegistroService);
  private readonly ingresoService = inject(IngresoService);
  private readonly ahorroService = inject(RegistroAhorroService);

  readonly userName = this.token.getUserName() ?? '';
  readonly periodo = signal(this.currentPeriod());
  readonly loading = signal(true);

  private readonly registros = signal<Registro[]>([]);
  private readonly ingresos = signal<Ingreso[]>([]);
  private readonly ahorros = signal<RegistroAhorro[]>([]);

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

  readonly donutOption = computed<EChartsCoreOption>(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center', textStyle: { color: '#a5ddc4' } },
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

  ngOnInit(): void {
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

  private currentPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}
