/** Fecha de hoy en formato yyyy-MM-dd (sin hora, sin zona horaria). */
export function todayDateOnly(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Periodo actual en formato yyyy-MM. */
export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Recorta una fecha ISO a la parte de fecha (yyyy-MM-dd). */
export function toDateOnly(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.substring(0, 10);
}
