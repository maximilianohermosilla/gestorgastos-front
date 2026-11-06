import { RegistroAhorro } from '../../core/models/registro-ahorro';

/**
 * Período ("YYYY-MM") al que pertenece un registro de ahorro.
 * Si el backend no lo informa, se deriva de la fecha.
 */
function periodoDe(registro: RegistroAhorro): string {
  if (registro.periodo) {
    return registro.periodo;
  }
  return (registro.fecha ?? '').substring(0, 7);
}

/**
 * Suma de los registros de ahorro del último periodo con datos.
 *
 * Los ahorros no se acumulan entre periodos: cada periodo agrupa sus propios
 * registros (depósitos) y el valor vigente es la suma de los del período más
 * reciente, no la suma de todo el histórico.
 */
export function valorAhorroActual(registros: RegistroAhorro[]): number {
  if (!registros.length) {
    return 0;
  }
  const ultimoPeriodo = registros
    .map(periodoDe)
    .filter((p) => !!p)
    .sort()
    .pop();
  if (!ultimoPeriodo) {
    // Sin período identificable: se suman todos los registros.
    return registros.reduce((s, a) => s + a.valor, 0);
  }
  return registros.filter((a) => periodoDe(a) === ultimoPeriodo).reduce((s, a) => s + a.valor, 0);
}

/** Período más reciente con registros de ahorro ("YYYY-MM"), o undefined. */
export function ultimoPeriodoAhorro(registros: RegistroAhorro[]): string | undefined {
  return registros
    .map(periodoDe)
    .filter((p) => !!p)
    .sort()
    .pop();
}
