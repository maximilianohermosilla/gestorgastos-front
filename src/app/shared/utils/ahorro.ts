import { RegistroAhorro } from '../../core/models/registro-ahorro';

/**
 * Devuelve el último registro de ahorro: el más reciente por fecha y, a igual
 * fecha, el de mayor id.
 *
 * Los ahorros no se suman entre sí (cada registro es una foto del saldo
 * acumulado y guarda la variación en `diferencia`), por lo que el valor
 * vigente es el del último registro.
 */
export function ultimoAhorro(registros: RegistroAhorro[]): RegistroAhorro | undefined {
  if (!registros.length) {
    return undefined;
  }
  return [...registros].sort((a, b) => {
    const fechaA = a.fecha ?? '';
    const fechaB = b.fecha ?? '';
    if (fechaA !== fechaB) {
      return fechaB.localeCompare(fechaA);
    }
    return (b.id ?? 0) - (a.id ?? 0);
  })[0];
}

/** Valor del ahorro vigente (el del último registro) o 0 si no hay registros. */
export function valorAhorroActual(registros: RegistroAhorro[]): number {
  return ultimoAhorro(registros)?.valor ?? 0;
}
