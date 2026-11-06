import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ingreso } from '../../../core/models/ingreso';
import { Registro } from '../../../core/models/registro';
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

  const registro = (id: number, valor: number): Registro => ({
    id,
    descripcion: 'Gasto',
    idCategoriaGasto: 1,
    idCuenta: 1,
    fecha: '2026-11-01',
    valor,
  });

  const ingreso = (id: number, valor: number): Ingreso => ({
    id,
    descripcion: 'Ingreso',
    idCategoriaIngreso: 1,
    idUsuario: 5,
    fecha: '2026-11-01',
    valor,
  });

  it('suma los valores de los gastos', () => {
    const dialog = crear({
      titulo: 'Gastos de Electrónica',
      periodo: '2026-11',
      tipo: 'gastos',
      registros: [registro(1, 1000), registro(2, 500)],
    });
    expect(dialog.total()).toBe(1500);
  });

  it('suma los valores de los ingresos', () => {
    const dialog = crear({
      titulo: 'Ingresos de Sueldo',
      periodo: '2026-11',
      tipo: 'ingresos',
      ingresos: [ingreso(1, 2000)],
    });
    expect(dialog.total()).toBe(2000);
  });

  it('total es 0 sin registros', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026-11', tipo: 'gastos', registros: [] });
    expect(dialog.total()).toBe(0);
  });

  it('describe el periodo mensual en texto', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026-11', tipo: 'gastos', registros: [] });
    expect(dialog.periodoTexto()).toBe('noviembre 2026');
  });

  it('mantiene el año cuando el periodo es anual', () => {
    const dialog = crear({ titulo: 'Detalle', periodo: '2026', tipo: 'gastos', registros: [] });
    expect(dialog.periodoTexto()).toBe('2026');
  });
});
