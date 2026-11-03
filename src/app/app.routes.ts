import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'gastos',
        loadComponent: () => import('./features/gastos/gastos').then((m) => m.Gastos),
      },
      {
        path: 'suscripciones',
        loadComponent: () => import('./features/suscripciones/suscripciones').then((m) => m.Suscripciones),
      },
      {
        path: 'gastos-en-cuotas',
        loadComponent: () => import('./features/vinculados/vinculados').then((m) => m.Vinculados),
      },
      {
        path: 'ingresos',
        loadComponent: () => import('./features/ingresos/ingresos').then((m) => m.Ingresos),
      },
      {
        path: 'ahorros',
        loadComponent: () => import('./features/ahorros/ahorros').then((m) => m.Ahorros),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes').then((m) => m.Reportes),
      },
      {
        path: 'cuentas',
        loadComponent: () => import('./features/cuentas/cuentas').then((m) => m.Cuentas),
      },
      {
        path: 'tarjetas',
        loadComponent: () => import('./features/tarjetas/tarjetas').then((m) => m.Tarjetas),
      },
      {
        path: 'empresas',
        loadComponent: () => import('./features/catalogos/catalogo/catalogo').then((m) => m.Catalogo),
        data: { entity: 'empresa' },
      },
      {
        path: 'bancos',
        loadComponent: () => import('./features/catalogos/catalogo/catalogo').then((m) => m.Catalogo),
        data: { entity: 'banco' },
      },
      {
        path: 'tipos-cuenta',
        loadComponent: () => import('./features/catalogos/catalogo/catalogo').then((m) => m.Catalogo),
        data: { entity: 'tipoCuenta' },
      },
      {
        path: 'tipos-tarjeta',
        loadComponent: () => import('./features/catalogos/catalogo/catalogo').then((m) => m.Catalogo),
        data: { entity: 'tipoTarjeta' },
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/auth/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
