import { MoneyPipe } from './money.pipe';

describe('MoneyPipe', () => {
  const pipe = new MoneyPipe();

  it('formatea un número como cadena', () => {
    const result = pipe.transform(1234.5);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('devuelve valor para null y undefined', () => {
    expect(pipe.transform(null)).toBeTruthy();
    expect(pipe.transform(undefined)).toBeTruthy();
  });
});
