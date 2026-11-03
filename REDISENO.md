# Rediseño — Glassmorphism «Dark Green Mist»

Rediseño visual del frontend manteniendo toda la funcionalidad. Estética: **dark mode +
glassmorphism** con paleta **«dark green mist»** (niebla verde oscura).

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `mist-950` | `#071410` | fondo base |
| `mist-900` | `#0a1e18` | fondo elevado |
| `mist-800` | `#0e2a21` | sidenav/paneles |
| `mist-700` | `#143a2d` | hover |
| `mist-600` | `#1b4f3c` | — |
| `mist-500` | `#2a6b52` | acento secundario |
| `mist-400` | `#3f9a76` | — |
| `mist-300` | `#6cc49e` | acento (íconos/links) |
| `mist-200` | `#a5ddc4` | texto atenuado |
| `mist-100` | `#d6f0e4` | texto principal |
| `mist-50` | `#eefaf4` | títulos |
| `accent` | `#34d399` | primario interactivo |
| `income` | `#34d399` | ingresos/éxito |
| `expense` | `#f87171` | gastos/error |
| `savings` | `#38bdf8` | ahorros |

## Receta de vidrio

```
background: rgba(255,255,255,0.04);
backdrop-filter: blur(16px) saturate(140%);
border: 1px solid rgba(255,255,255,0.08);
```

## Fondo «niebla»

```css
background:
  radial-gradient(1200px 800px at 15% -10%, rgba(52,211,153,.14), transparent 60%),
  radial-gradient(1000px 700px at 100% 10%,  rgba(45,212,191,.10), transparent 55%),
  radial-gradient(900px 900px  at 50% 110%,  rgba(20,90,60,.28),   transparent 60%),
  #071410;
```

## Enfoque técnico

1. Tema Material `theme-type: dark` + primario `$green-palette` + terciario `$cyan-palette`.
2. Sobrescribir tokens de superficie (`--mat-sys-surface*`) a valores translúcidos (vidrio).
3. Reglas globales de `backdrop-filter` + borde en cards, diálogos, toolbar, sidenav, menú.
4. `mat-sidenav-content` transparente para que la «niebla» se vea a través.
5. Tokens de color `mist-*` + utilidad `glass` en Tailwind v4 (`@theme` / `@utility`).
6. Colores ECharts actualizados a la paleta (series + labels claros + fondo transparente).

## Fases

- **A — Fundaciones:** tema oscuro, tokens, fondo niebla, vidrio en superficies Material.
- **B — Núcleo:** shell, login, dashboard, componentes compartidos.
- **C — Gráficos:** colores ECharts (dashboard y reportes).
- **D — Vistas de datos:** tablas y diálogos ABM.
- **E — Pulido:** contraste AA, responsive, verificación y build/tests.

## Riesgos

- Contraste de texto sobre superficies translúcidas.
- `backdrop-filter` y `mat-dialog` (blur sobre el contenedor, no el overlay).
- Tablas Material (heredar el vidrio).
- Rendimiento de `backdrop-blur` (solo en cards/diálogos, no en celdas).
- Fondo transparente del canvas ECharts.
