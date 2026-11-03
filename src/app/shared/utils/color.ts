/** Devuelve un color de texto (#ffffff o #0a1e18) con contraste sobre el color dado. */
export function textoContraste(hex?: string | null): string {
  if (!hex) {
    return '#ffffff';
  }
  const limpio = hex.replace('#', '');
  const r = parseInt(limpio.substring(0, 2), 16) || 0;
  const g = parseInt(limpio.substring(2, 4), 16) || 0;
  const b = parseInt(limpio.substring(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0a1e18' : '#ffffff';
}
