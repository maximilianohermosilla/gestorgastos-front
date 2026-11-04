import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { adminGuard } from './admin.guard';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

describe('adminGuard', () => {
  function ejecutar(esAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { esAdministrador: () => esAdmin } },
        provideRouter([]),
      ],
    });
    return TestBed.runInInjectionContext(() => adminGuard(route, state));
  }

  it('permite el acceso a un administrador', () => {
    expect(ejecutar(true)).toBe(true);
  });

  it('redirige al dashboard a un usuario sin el rol', () => {
    const result = ejecutar(false);
    expect(result).not.toBe(true);
    const url = TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>);
    expect(url).toBe('/dashboard');
  });
});
