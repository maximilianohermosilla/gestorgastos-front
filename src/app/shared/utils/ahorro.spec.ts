import { RegistroAhorro } from '../../core/models/registro-ahorro';
import { ultimoAhorro, valorAhorroActual } from './ahorro';

function ahorro(id: number, fecha: string, valor: number): RegistroAhorro {
  return { id, fecha, valor, diferencia: 0 };
}

describe('ultimoAhorro', () => {
  it('devuelve undefined sin registros', () => {
    expect(ultimoAhorro([])).toBeUndefined();
  });

  it('devuelve el registro con la fecha más reciente', () => {
    const registros = [
      ahorro(1, '2026-03-10', 100),
      ahorro(2, '2026-11-05', 250),
      ahorro(3, '2026-07-01', 180),
    ];
    expect(ultimoAhorro(registros)?.id).toBe(2);
  });

  it('a igual fecha devuelve el de mayor id', () => {
    const registros = [ahorro(7, '2026-11-05', 250), ahorro(9, '2026-11-05', 300)];
    expect(ultimoAhorro(registros)?.id).toBe(9);
  });

  it('no modifica el array original', () => {
    const registros = [ahorro(1, '2026-01-01', 10), ahorro(2, '2026-12-01', 20)];
    ultimoAhorro(registros);
    expect(registros[0].id).toBe(1);
  });
});

describe('valorAhorroActual', () => {
  it('toma el valor del último registro y no la suma', () => {
    const registros = [ahorro(1, '2026-03-10', 100), ahorro(2, '2026-11-05', 250)];
    expect(valorAhorroActual(registros)).toBe(250);
  });

  it('devuelve 0 sin registros', () => {
    expect(valorAhorroActual([])).toBe(0);
  });
});
