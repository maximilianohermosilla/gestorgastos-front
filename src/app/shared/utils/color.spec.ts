import { textoContraste } from './color';

describe('textoContraste', () => {
  it('devuelve texto oscuro para colores claros', () => {
    expect(textoContraste('#ffffff')).toBe('#0a1e18');
    expect(textoContraste('#f1f1f1')).toBe('#0a1e18');
  });

  it('devuelve texto claro para colores oscuros', () => {
    expect(textoContraste('#123456')).toBe('#ffffff');
    expect(textoContraste('#000000')).toBe('#ffffff');
  });

  it('devuelve blanco por defecto', () => {
    expect(textoContraste(null)).toBe('#ffffff');
    expect(textoContraste(undefined)).toBe('#ffffff');
  });
});
