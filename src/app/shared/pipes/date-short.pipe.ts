import { Pipe, PipeTransform } from '@angular/core';

/** Formatea una fecha (yyyy-MM-dd o ISO) a dd/MM/yyyy. */
@Pipe({ name: 'dateShort' })
export class DateShortPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) {
      return value.substring(0, 10);
    }
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
}
