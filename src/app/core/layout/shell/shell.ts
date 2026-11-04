import { Component, computed, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token.service';

interface NavItem {
  nombre: string;
  routerlink: string;
  icon: string;
}

interface NavGroup {
  titulo?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
  ],
  host: { class: 'flex h-screen flex-col' },
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly token = inject(TokenService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);

  /** Solo el administrador accede a los catálogos. */
  readonly esAdministrador = this.auth.esAdministrador;

  constructor() {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe((r) => this.isMobile.set(r.matches));
  }

  private readonly navGroupsBase: NavGroup[] = [
    {
      items: [
        { nombre: 'Inicio', routerlink: '/dashboard', icon: 'home' },
        { nombre: 'Reportes', routerlink: '/reportes', icon: 'bar_chart' },
      ],
    },
    {
      titulo: 'Gastos',
      items: [
        { nombre: 'Gastos', routerlink: '/gastos', icon: 'paid' },
        { nombre: 'Suscripciones', routerlink: '/suscripciones', icon: 'event_repeat' },
        { nombre: 'En cuotas', routerlink: '/gastos-en-cuotas', icon: 'receipt' },
      ],
    },
    {
      items: [
        { nombre: 'Ingresos', routerlink: '/ingresos', icon: 'trending_up' },
        { nombre: 'Ahorros', routerlink: '/ahorros', icon: 'savings' },
      ],
    },
    {
      titulo: 'Gestión',
      items: [
        { nombre: 'Cuentas', routerlink: '/cuentas', icon: 'account_balance_wallet' },
        { nombre: 'Tarjetas', routerlink: '/tarjetas', icon: 'credit_card' },
        { nombre: 'Perfil', routerlink: '/perfil', icon: 'person' },
      ],
    },
    {
      titulo: 'Catálogos',
      items: [
        { nombre: 'Empresas', routerlink: '/empresas', icon: 'business' },
        { nombre: 'Bancos', routerlink: '/bancos', icon: 'account_balance' },
        { nombre: 'Tipos de cuenta', routerlink: '/tipos-cuenta', icon: 'category' },
        { nombre: 'Tipos de tarjeta', routerlink: '/tipos-tarjeta', icon: 'style' },
      ],
    },
  ];

  /** Grupos del menú: «Catálogos» solo para administradores. */
  readonly navGroups = computed<NavGroup[]>(() =>
    this.esAdministrador() ? this.navGroupsBase : this.navGroupsBase.filter((g) => g.titulo !== 'Catálogos'),
  );

  get userName(): string {
    return this.token.getUserName() ?? '';
  }

  onNavClick(sidenav: MatSidenav): void {
    if (this.isMobile()) {
      void sidenav.close();
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
