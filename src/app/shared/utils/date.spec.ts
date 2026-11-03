import { currentPeriod, todayDateOnly, toDateOnly } from './date';

describe('date utils', () => {
  it('todayDateOnly devuelve yyyy-MM-dd', () => {
    expect(todayDateOnly()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('currentPeriod devuelve yyyy-MM', () => {
    expect(currentPeriod()).toMatch(/^\d{4}-\d{2}$/);
  });

  it('toDateOnly recorta a la fecha', () => {
    expect(toDateOnly('2024-11-15T00:00:00')).toBe('2024-11-15');
    expect(toDateOnly('2024-11-15')).toBe('2024-11-15');
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly(undefined)).toBeNull();
    expect(toDateOnly('')).toBeNull();
  });
});
