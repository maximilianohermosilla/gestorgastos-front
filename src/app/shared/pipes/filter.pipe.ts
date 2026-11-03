import { Pipe, PipeTransform } from '@angular/core';

/** Filtra una lista por un texto comparado contra una o varias claves. */
@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[] | null | undefined, searchText: string | null, keys: (keyof T)[]): T[] {
    if (!items) {
      return [];
    }
    const term = searchText?.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) =>
      keys.some((k) => String(item[k] ?? '').toLowerCase().includes(term)),
    );
  }
}
