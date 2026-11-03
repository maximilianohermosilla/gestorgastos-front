import { DateShortPipe } from './date-short.pipe';

describe('DateShortPipe', () => {
  const pipe = new DateShortPipe();

  it('formatea yyyy-MM-dd a dd/MM/yyyy', () => {
    expect(pipe.transform('2024-11-15')).toBe('15/11/2024');
  });

  it('formatea ISO con hora', () => {
    expect(pipe.transform('2024-01-05T12:00:00')).toBe('05/01/2024');
  });

  it('devuelve guion para vacío', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });
});
