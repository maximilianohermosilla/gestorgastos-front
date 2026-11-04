import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Restringe el acceso a los catálogos a los administradores.
 * Si el usuario no tiene el rol, se redirige al dashboard.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.esAdministrador() ? true : router.createUrlTree(['/dashboard']);
};
