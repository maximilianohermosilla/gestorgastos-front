import { esAdministrador, ROL_ADMINISTRADOR } from './role';

describe('esAdministrador', () => {
  it('reconoce el rol Administrador', () => {
    expect(esAdministrador('Administrador')).toBe(true);
  });

  it('ignora mayúsculas y espacios', () => {
    expect(esAdministrador('administrador')).toBe(true);
    expect(esAdministrador('  ADMINISTRADOR  ')).toBe(true);
  });

  it('rechaza otros roles', () => {
    expect(esAdministrador('Usuario')).toBe(false);
    expect(esAdministrador('Super Administrador')).toBe(false);
    expect(esAdministrador('Admin')).toBe(false);
  });

  it('rechaza roles vacíos o nulos', () => {
    expect(esAdministrador('')).toBe(false);
    expect(esAdministrador(null)).toBe(false);
    expect(esAdministrador(undefined)).toBe(false);
  });

  it('expone el rol de administrador', () => {
    expect(ROL_ADMINISTRADOR).toBe('administrador');
  });
});
