import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { ultimoPeriodoAhorro, valorAhorroActual } from './ahorro';

function ahorro(id: number, periodo: string, valor: number, fecha = `${periodo}-10`): RegistroAhorro {
  return { id, periodo, fecha, valor, diferencia: 0 };
}

describe('ultimoPeriodoAhorro', () => {
  it('devuelve undefined sin registros', () => {
    expect(ultimoPeriodoAhorro([])).toBeUndefined();
  });

  it('devuelve el periodo más reciente', () => {
    const registros = [
      ahorro(1, '2026-10', 300),
      ahorro(2, '2026-11', 1000),
      ahorro(3, '2026-07', 180),
    ];
    expect(ultimoPeriodoAhorro(registros)).toBe('2026-11');
  });

  it('deriva el periodo de la fecha si no viene informado', () => {
    const registros: RegistroAhorro[] = [{ id: 1, fecha: '2026-09-15', valor: 100, diferencia: 0 }];
    expect(ultimoPeriodoAhorro(registros)).toBe('2026-09');
  });
});

describe('valorAhorroActual', () => {
  it('devuelve 0 sin registros', () => {
    expect(valorAhorroActual([])).toBe(0);
  });

  it('suma los registros del último periodo', () => {
    const registros = [
      ahorro(1, '2026-10', 300),
      ahorro(2, '2026-11', 1000),
      ahorro(3, '2026-11', 500),
    ];
    expect(valorAhorroActual(registros)).toBe(1500);
  });

  it('no suma los registros de periodos anteriores', () => {
    const registros = [ahorro(1, '2026-10', 300), ahorro(2, '2026-11', 1000)];
    expect(valorAhorroActual(registros)).toBe(1000);
  });

  it('suma todos los registros cuando están en el mismo periodo', () => {
    const registros = [ahorro(1, '2026-11', 1000), ahorro(2, '2026-11', 500)];
    expect(valorAhorroActual(registros)).toBe(1500);
  });

  it('usa la fecha cuando el registro no tiene periodo', () => {
    const registros: RegistroAhorro[] = [
      { id: 1, fecha: '2026-08-01', valor: 400, diferencia: 0 },
      { id: 2, fecha: '2026-11-02', valor: 700, diferencia: 0 },
    ];
    expect(valorAhorroActual(registros)).toBe(700);
  });
});
