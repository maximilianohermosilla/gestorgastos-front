import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { esRolAdministrador } from '../../../shared/utils/role';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token.service';
import { Shell } from './shell';

describe('Shell', () => {
  function crear(role: string | undefined) {
    const currentUser = signal(role === undefined ? null : { unique_name: 'Demo', role });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUser.asReadonly(),
            esAdministrador: computed(() => esRolAdministrador(currentUser()?.role)),
            cargarPerfil: () => {},
            logout: () => {},
          },
        },
        {
          provide: TokenService,
          useValue: { getUserName: () => 'Demo', getAuthorities: () => role ?? '' },
        },
      ],
    });
    const shell = TestBed.runInInjectionContext(() => new Shell());
    return { shell, currentUser };
  }

  const titulos = (shell: Shell) => shell.navGroups().map((g) => g.titulo ?? '(sin título)');

  it('oculta el grupo Catálogos para un usuario normal', () => {
    const { shell } = crear('Usuario');
    expect(titulos(shell)).not.toContain('Catálogos');
  });

  it('muestra el grupo Catálogos para un administrador', () => {
    const { shell } = crear('Administrador');
    expect(titulos(shell)).toContain('Catálogos');
  });

  it('incluye Perfil dentro del grupo Gestión', () => {
    const { shell } = crear('Usuario');
    const gestion = shell.navGroups().find((g) => g.titulo === 'Gestión');
    expect(gestion?.items.map((i) => i.nombre)).toContain('Perfil');
    expect(shell.navGroups().at(-1)?.titulo).not.toBe('Catálogos');
  });

  it('reacciona a un cambio de rol en caliente', () => {
    const { shell, currentUser } = crear('Usuario');
    expect(titulos(shell)).not.toContain('Catálogos');
    currentUser.set({ unique_name: 'Demo', role: 'Administrador' });
    TestBed.tick();
    expect(titulos(shell)).toContain('Catálogos');
  });
});
