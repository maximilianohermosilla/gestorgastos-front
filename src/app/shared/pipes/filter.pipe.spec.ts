import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  const pipe = new FilterPipe();
  const items = [
    { nombre: 'Netflix', valor: 10 },
    { nombre: 'Spotify', valor: 5 },
  ];

  it('filtra por texto (sin distinguir mayúsculas)', () => {
    expect(pipe.transform(items, 'net', ['nombre'])).toEqual([items[0]]);
  });

  it('devuelve todos si no hay texto', () => {
    expect(pipe.transform(items, '', ['nombre']).length).toBe(2);
    expect(pipe.transform(items, null, ['nombre']).length).toBe(2);
  });

  it('devuelve vacío si no hay items', () => {
    expect(pipe.transform(null, 'x', ['nombre'])).toEqual([]);
  });
});
