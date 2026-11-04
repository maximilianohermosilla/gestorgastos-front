import { esRolAdministrador, ROL_ADMINISTRADOR } from './role';

describe('esRolAdministrador', () => {
  it('reconoce el rol Administrador', () => {
    expect(esRolAdministrador('Administrador')).toBe(true);
  });

  it('ignora mayúsculas y espacios', () => {
    expect(esRolAdministrador('administrador')).toBe(true);
    expect(esRolAdministrador('  ADMINISTRADOR  ')).toBe(true);
  });

  it('rechaza otros roles', () => {
    expect(esRolAdministrador('Usuario')).toBe(false);
    expect(esRolAdministrador('Super Administrador')).toBe(false);
    expect(esRolAdministrador('Admin')).toBe(false);
  });

  it('rechaza roles vacíos o nulos', () => {
    expect(esRolAdministrador('')).toBe(false);
    expect(esRolAdministrador(null)).toBe(false);
    expect(esRolAdministrador(undefined)).toBe(false);
  });

  it('expone el rol de administrador', () => {
    expect(ROL_ADMINISTRADOR).toBe('administrador');
  });
});
