import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenService } from '../auth/token.service';
import { RegistroService } from './registro.service';

describe('RegistroService', () => {
  let service: RegistroService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // El id de usuario viene del token: se simula para no depender del storage.
        { provide: TokenService, useValue: { getUserId: () => '7' } },
      ],
    });
    service = TestBed.inject(RegistroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('arma la URL con el usuario, el periodo y los filtros', () => {
    service.getAllByUsuario('2026-11', { categoria: 3, descripcion: 'cafe', pagado: false }).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('gestorGastos/Registro'));
    const url = req.request.url;
    expect(url).toContain('idUsuario=7');
    expect(url).toContain('periodo=2026-11');
    expect(url).toContain('categoria=3');
    expect(url).toContain('descripcion=cafe');
    expect(url).toContain('pagado=false');
    req.flush([]);
  });

  it('omite los filtros vacíos', () => {
    service.getAllByUsuario('2026-11').subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('gestorGastos/Registro'));
    const url = req.request.url;
    expect(url).not.toContain('categoria=');
    expect(url).not.toContain('descripcion=');
    expect(url).not.toContain('pagado=');
    req.flush([]);
  });
});
