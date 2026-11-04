import { TestBed } from '@angular/core/testing';
import { FormPeriodo } from './form-periodo';

describe('FormPeriodo', () => {
  async function crear(periodo: string, hiddenMonth = false) {
    const fixture = TestBed.createComponent(FormPeriodo);
    fixture.componentRef.setInput('periodo', periodo);
    fixture.componentRef.setInput('hiddenMonth', hiddenMonth);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('deriva el modo "mes" a partir de un periodo YYYY-MM', async () => {
    const fixture = await crear('2026-11');
    expect(fixture.componentInstance.modo()).toBe('mes');
    expect(fixture.componentInstance.selectedIndex()).toBe(0);
  });

  it('deriva el modo "anio" a partir de un periodo YYYY', async () => {
    const fixture = await crear('2026');
    expect(fixture.componentInstance.modo()).toBe('anio');
    expect(fixture.componentInstance.selectedIndex()).toBe(1);
  });

  it('fuerza el modo "anio" cuando hiddenMonth es true', async () => {
    const fixture = await crear('2026', true);
    expect(fixture.componentInstance.modo()).toBe('anio');
    expect(fixture.componentInstance.selectedIndex()).toBe(0);
  });

  it('emite el mes anterior', async () => {
    const fixture = await crear('2026-11');
    let emitido: string | undefined;
    fixture.componentInstance.cambio.subscribe((p) => (emitido = p));
    fixture.componentInstance.anterior();
    expect(emitido).toBe('2026-10');
  });

  it('emite el mes siguiente cruzando el año', async () => {
    const fixture = await crear('2026-12');
    let emitido: string | undefined;
    fixture.componentInstance.cambio.subscribe((p) => (emitido = p));
    fixture.componentInstance.siguiente();
    expect(emitido).toBe('2027-01');
  });

  it('emite el año anterior y el siguiente en modo año', async () => {
    const fixture = await crear('2026', true);
    let emitido: string | undefined;
    fixture.componentInstance.cambio.subscribe((p) => (emitido = p));
    fixture.componentInstance.anterior();
    expect(emitido).toBe('2025');
    fixture.componentInstance.siguiente();
    expect(emitido).toBe('2027');
  });

  it('al cambiar a la pestaña de mes propone el mes del año actual', async () => {
    const fixture = await crear('2026');
    let emitido: string | undefined;
    fixture.componentInstance.cambio.subscribe((p) => (emitido = p));
    fixture.componentInstance.cambiarModo(0);
    expect(emitido).toMatch(/^\d{4}-\d{2}$/);
  });
});
