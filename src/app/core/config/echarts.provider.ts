import { Provider } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';

/**
 * Provee ECharts de forma lazy: el bundle de ECharts solo se descarga al
 * renderizar el primer gráfico, evitando que engorde el bundle inicial.
 */
export const provideCharts = (): Provider =>
  provideEchartsCore({
    echarts: () => import('./echarts-setup'),
  });
