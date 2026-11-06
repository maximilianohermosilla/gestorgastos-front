import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleDialog, type DetalleDialogData } from './detalle-dialog';

describe('DetalleDialog', () => {
  function crear(data: DetalleDialogData) {
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: () => {} } },
      ],
    });
    return TestBed.runInInjectionContext(() => new DetalleDialog());
  }

  const items = [
    { fecha: '2026-11-01', descripcion: 'Compra', categoria: 'Electrónica', cuenta: 'Visa', valor: 1000 },
    { fecha: '2026-11-05', descripcion: 'Reparación', categoria: 'Electrónica', cuenta: 'Visa', valor: 500 },
  ];

  it('suma los valores mostrados', () => {
    const dialog = crear({ titulo: 'Gastos de Electrónica', periodo: '2026-11', items });
    expect(dialog.total()).toBe(1500);
  });

  it('total es 0 sin registros', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026-11', items: [] });
    expect(dialog.total()).toBe(0);
  });

  it('describe el periodo mensual en texto', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026-11', items });
    expect(dialog.periodoTexto()).toBe('noviembre 2026');
  });

  it('mantiene el año cuando el periodo es anual', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026', items });
    expect(dialog.periodoTexto()).toBe('2026');
  });
});
