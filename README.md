# Gestor de Gastos (frontend)

Aplicación Angular para la gestión de gastos personales: **ingresos, gastos, gastos en cuotas,
suscripciones, cuentas, tarjetas, ahorros, balance y reportes**.

Consume el backend **`amh-web-api`** (`.NET Core`) sin modificarlo, usando únicamente sus endpoints
existentes. El detalle de endpoints y decisiones está en [`Plan.md`](./Plan.md) y el sistema visual
en [`REDISENO.md`](./REDISENO.md).

## Stack

- **Angular 22** (standalone components + signals)
- **Angular Material 3** (theming por tokens)
- **Tailwind CSS v4** (utilidades; el tema Material vive en `styles.scss`)
- **Apache ECharts** vía `ngx-echarts` (carga lazy)
- **Plus Jakarta Sans** + **Material Symbols Rounded**
- **xlsx** (export Excel), **date-fns**, **@auth0/angular-jwt**
- Tests: **Vitest** (runner nativo de Angular 22)

## Diseño

Sistema **glassmorphism «dark green mist»**:

- Fondo con gradientes radiales verdes difuminados (la «niebla») sobre un verde casi negro (`#071410`).
- Superficies translúcidas con `backdrop-filter: blur(16px)`, bordes sutiles y sombras suaves.
- Paleta `mist` (50–950) + semánticos `accent` / `income` / `expense` / `savings` (`@theme` de Tailwind).
- Iconos de categorías con el color y el ícono que provienen de la base de datos, con contraste automático.

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

| Comando          | Descripción                         |
| ---------------- | ----------------------------------- |
| `npm start`      | Servidor de desarrollo              |
| `npm run build`  | Build de producción (`dist/`)       |
| `npm run watch`  | Build de desarrollo en modo watch   |
| `npm test`       | Tests unitarios (Vitest, sin watch) |

## Estructura

```
src/app/
  core/        auth, http, layout (shell), models, services, config
  shared/      componentes, pipes y utilidades reutilizables
  features/    auth (login/perfil), dashboard, gastos, ingresos, ahorros,
               suscripciones, cuotas, cuentas, tarjetas, catalogos, reportes
```
