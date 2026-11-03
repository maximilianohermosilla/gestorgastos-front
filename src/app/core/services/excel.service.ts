import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

/** Exporta uno o varios conjuntos de datos a un archivo .xlsx. */
@Injectable({ providedIn: 'root' })
export class ExcelService {
  export(sheets: Record<string, Record<string, unknown>[]>, filename: string): void {
    const wb = XLSX.utils.book_new();
    for (const [name, rows] of Object.entries(sheets)) {
      const ws = XLSX.utils.json_to_sheet(rows ?? []);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
    XLSX.writeFile(wb, filename);
  }
}
