# Gestor de Gastos (frontend)

Aplicación Angular para la gestión de gastos personales: **ingresos, gastos, gastos en cuotas,
suscripciones, cuentas, tarjetas, ahorros, balance y reportes**.

Consume el backend **`amh-web-api`** (`.NET Core`) sin modificarlo, usando únicamente sus endpoints
existentes. El detalle de endpoints y decisiones está en [`Plan.md`](./Plan.md).

## Stack

- **Angular 22** (standalone components + signals)
- **Angular Material 3** (theming por tokens)
- **Apache ECharts** vía `ngx-echarts`
- **date-fns**, **xlsx** (export Excel), **@auth0/angular-jwt**
- State: servicios RxJS + signals

## Requisitos

- Node.js 20+
- npm 10+

## Puesta en marcha

```bash
npm install
npm start          # ng serve -> http://localhost:4200
```

La URL de la API se configura en `src/environments/environment.ts` (producción) y
`environment.development.ts` (desarrollo). Por defecto apunta a `https://api.mayidev.com/`.
Para trabajar contra un backend local, descomentar `https://localhost:7011/` en el environment
de desarrollo.

## Scripts

| Comando          | Descripción                            |
| ---------------- | -------------------------------------- |
| `npm start`      | Servidor de desarrollo                 |
| `npm run build`  | Build de producción (`dist/`)          |
| `npm run watch`  | Build de desarrollo en modo watch      |
| `npm test`       | Tests unitarios (Vitest, sin watch)    |

## Estructura

```
src/app/
  core/        auth, http, layout (shell), models, services, config
  shared/      componentes y pipes reutilizables
  features/    auth (login/perfil), dashboard, (gastos, ingresos, ahorros, ...)
```

## Estado

Funcionalidad completa (auth, dashboard, gastos, suscripciones, cuotas, ingresos, ahorros,
cuentas, tarjetas, catálogos y reportes con export Excel). ECharts se carga de forma lazy
para mantener el bundle inicial dentro del presupuesto.
