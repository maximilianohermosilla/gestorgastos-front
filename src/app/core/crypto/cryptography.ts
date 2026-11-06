/**
 * Cifrado de contraseñas compatible con el backend (`CryptographyHelper.Encrypt`).
 *
 * El backend guarda las contraseñas cifradas y las vuelve a cifrar al
 * autenticar, por lo que el alta de usuarios desde el frontend debe cifrar
 * exactamente del mismo modo: AES-256-CBC con clave derivada por PBKDF2
 * (HMAC-SHA1, 1000 iteraciones) a partir de SHA-512 de una semilla fija.
 *
 * Equivalencia con el código .NET:
 *  - passwordBytes = SHA512(seed)
 *  - key = Rfc2898DeriveBytes(passwordBytes, salt, 1000).GetBytes(32)
 *  - iv  = Rfc2898DeriveBytes(passwordBytes, salt, 1000).GetBytes(16) (continuación)
 *  - AES 256 bits, modo CBC, padding PKCS#7
 */

/** Semilla usada por el backend para derivar la clave. */
const SEMILLA = 'P455W0rd';

/** Salt fijo del backend. */
const SALT = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

/** Iteraciones de PBKDF2. */
const ITERACIONES = 1000;

/** Longitud en bits de la clave derivada (32 bytes de clave + 16 bytes de IV). */
const BITS_DERIVADOS = 384;

/** Cifra una contraseña en texto plano y devuelve el resultado en Base64. */
export async function cifrarPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();

  const semilla = new Uint8Array(await crypto.subtle.digest('SHA-512', encoder.encode(SEMILLA)));
  const baseKey = await crypto.subtle.importKey('raw', semilla, 'PBKDF2', false, ['deriveBits']);
  const derivado = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: SALT, iterations: ITERACIONES, hash: 'SHA-1' },
      baseKey,
      BITS_DERIVADOS,
    ),
  );

  const aesKey = await crypto.subtle.importKey('raw', derivado.slice(0, 32), 'AES-CBC', false, ['encrypt']);
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: derivado.slice(32, 48) },
    aesKey,
    encoder.encode(plainText),
  );

  return bytesABase64(new Uint8Array(cifrado));
}

function bytesABase64(bytes: Uint8Array): string {
  let binario = '';
  for (const b of bytes) {
    binario += String.fromCharCode(b);
  }
  return btoa(binario);
}
