import { cifrarPassword } from './cryptography';

describe('cifrarPassword', () => {
  it('genera el mismo valor que el backend (AES-256-CBC + PBKDF2)', async () => {
    // Hash almacenado por el backend para el usuario "Demo" (password "CLAve123**").
    await expect(cifrarPassword('CLAve123**')).resolves.toBe('vRmLXPzbgpwt2WRMvgyW/g==');
  });

  it('es determinista', async () => {
    const [a, b] = await Promise.all([cifrarPassword('secreta123'), cifrarPassword('secreta123')]);
    expect(a).toBe(b);
  });

  it('no devuelve el texto plano', async () => {
    const cifrado = await cifrarPassword('secreta123');
    expect(cifrado).not.toContain('secreta123');
    expect(cifrado.length).toBeGreaterThan(0);
  });

  it('cifra de forma distinta contraseñas distintas', async () => {
    const [a, b] = await Promise.all([cifrarPassword('unaClave'), cifrarPassword('otraClave')]);
    expect(a).not.toBe(b);
  });
});
