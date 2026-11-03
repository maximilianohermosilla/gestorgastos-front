# Plan de implementación — Gestor de Gastos (nuevo frontend)

> Backend objetivo: **`amh-web-api`** (arquitectura limpia, .NET Core, SQL Server).
> Regla de oro: **no modificar el backend**; usar únicamente los endpoints existentes.

---

## 1. Objetivo

Reescribir el frontend del Gestor de Gastos tomando como referencia funcional el proyecto anterior
(`GestorGastos-FrontEnd/GestorGastos`), modernizando stack, diseño y arquitectura, manteniendo
paridad funcional completa (todas las altas/modificaciones/eliminaciones y reportes).

---

## 2. Decisiones confirmadas

| Decisión | Elección |
|---|---|
| Framework | Angular **22** (standalone components + signals, nuevo control flow) |
| UI | Angular **Material 3** (theming por tokens) |
| Gráficos | **Apache ECharts** vía `ngx-echarts` (reemplaza ngx-charts) |
| Fechas | `date-fns` (reemplaza moment) |
| Export | `xlsx` (SheetJS) |
| JWT | `@auth0/angular-jwt` |
| Estado | Servicios RxJS + signals de UI (sin NgRx) |
| Home | **Dashboard** post-login (sin landing page) |
| Alcance | Paridad completa de funcionalidades |
| Ubicación | Nuevo repo `GestorGastos-FrontEnd-V2` |

---

## 3. Contrato de API (solo endpoints existentes)

Base URL: `https://api.mayidev.com/` (prod) · `https://localhost:7011/` (dev, vía proxy).

### 3.1 Autenticación / general

| Método | Ruta | Body / Query | Respuesta |
|---|---|---|---|
| POST | `/login` | `{ login, password, passwordNew?, idSistema }` | `{ token }` |
| PUT | `/login` | `{ login, password, passwordNew, idSistema }` | `{ message }` (cambio contraseña) |
| GET | `/Usuario` | — | `UsuarioResponse[]` |
| GET | `/Usuario/IdUsuario` | `?Id=` | `UsuarioResponse` |
| POST | `/Usuario` | `UsuarioRequest` | objeto creado |
| PUT | `/Usuario` | `UsuarioRequest` | `{ message }` |
| GET | `/Sistema` | — | sistemas |

- `IdSistema = 3` para Gestor de Gastos.
- Claims JWT: `unique_name` (usuario), `nameid` (idUsuario), `role` (autoridades).

### 3.2 GestorGastos — prefijo `/gestorGastos/[controller]` (JWT)

| Entidad | GET list | GET id | POST | PUT | DELETE |
|---|---|---|---|---|---|
| Registro (gasto) | ✅ `idUsuario,periodo,categoria?,descripcion?,pagado?` | — | ✅ | ✅ | ✅ |
| Ingreso | ✅ `idUsuario,periodo,categoria?` | — | ✅ | ✅ | ✅ |
| RegistroAhorro | ✅ `idUsuario,periodo,descripcion?` | — | ✅ | ✅ | ✅ |
| RegistroVinculado | ✅ `idUsuario,periodo` | — | ✅ | ✅ | ✅ |
| Suscripcion | ✅ `idUsuario,periodo` | — | ✅ | ✅ | ✅ |
| Cuenta | ✅ `IdUsuario` | — | ✅ | ✅ | ✅ |
| Tarjeta | ✅ `IdUsuario` | — | ✅ | ✅ | ✅ |
| Empresa | ✅ | ✅ `IdEmpresa` | ✅ | ✅ | ✅ |
| Banco | ✅ | ✅ `IdBanco` | ✅ | ✅ | ✅ |
| TipoCuenta | ✅ | ✅ `IdTipoCuenta` | ✅ | ✅ | ✅ |
| TipoTarjeta | ✅ | ✅ `IdTipoTarjeta` | ✅ | ✅ | ✅ |
| CategoriaGasto | ✅ | ✅ `IdCategoriaGasto` | ❌ solo lectura | ❌ | ❌ |
| CategoriaIngreso | ✅ | ✅ `IdCategoriaIngreso` | ❌ solo lectura | ❌ | ❌ |

### 3.3 Formato de respuestas

- `GET` → array/objeto directo.
- `POST` → `201` + objeto creado.
- `PUT` → `200 { Message, Response: { response, message, statusCode } }` (anidado).
- `DELETE` → `200 { Message, Response }` o `400/404 { message }`.
- Errores → `{ message }`.
- JSON en **camelCase** (los DTO C# serializan a camelCase).

---

## 4. Modelo de datos (resumen)

Véase `Application/DTO/GestorGastos`. Principales entidades (camelCase):

- **Registro (gasto):** `id, descripcion, idCategoriaGasto, idCuenta, idEmpresa?, idSuscripcion?, idRegistroVinculado?, numeroCuota?, fecha, valor, idUsuario, observaciones?, periodo?, pagado?, fechaPago?` + expandidos (`cuenta`, `categoriaGasto`, `suscripcion`, `registroVinculado`, `empresaNombre`, `categoriaGastoNombre`).
- **Ingreso:** `id, valor, descripcion, fecha, periodo?, idUsuario, idCategoriaIngreso` + `categoriaIngresoNombre`.
- **RegistroAhorro:** `id, descripcion?, idCuenta?, fecha, valor, diferencia, idUsuario?, observaciones?, periodo?` + `cuentaNombre`.
- **RegistroVinculado:** `id, descripcion?, cuotas, valorFinal, idUsuario, idEmpresa?, idCuenta, idCategoriaGasto, fecha, proximoMes`; full incluye `registros`.
- **Suscripcion:** `id, nombre, fechaDesde, fechaHasta, valorActual, idUsuario?, idEmpresa?, idCuenta, idCategoriaGasto, fechaUpdate?, proximoMes`; full incluye `registros`.
- **Cuenta:** `id, nombre, idTipoCuenta, idTarjeta?, tarjeta?, idUsuario, habilitado?` + `tipoCuentaNombre, tarjetaNumero`.
- **Tarjeta:** `id, numero?, vencimiento?, idBanco?, idTipoTarjeta?, idUsuario?, habilitado?` + `bancoNombre, tipoTarjetaNombre`.
- **Empresa / Banco / TipoCuenta / TipoTarjeta:** `id, nombre`.
- **CategoriaGasto / CategoriaIngreso:** `id, nombre, color, icono`.

---

## 5. Funcionalidades (paridad con el frontend anterior)

- **Auth:** login/logout, guard por token, perfil (datos + cambio de contraseña).
- **Dashboard (home):** resumen de saldo, gastos/ingresos/ahorros del mes, accesos rápidos.
- **Gastos:** ABM de registros (con categoría, cuenta, empresa, suscripción, financiación, pagado/fechaPago) + ABM de suscripciones + ABM de registros vinculados (cuotas).
- **Ingresos:** ABM con categoría.
- **Ahorros:** ABM con `diferencia`.
- **Cuentas / Tarjetas:** ABM (cuenta con tarjeta anidada; tarjeta con banco y tipo).
- **Catálogos:** ABM de Empresa, Banco, TipoCuenta, TipoTarjeta; categorías en solo lectura.
- **Reportes:** filtros por periodo/categoría/cuenta, gráficos ECharts y exportación a Excel.

---

## 6. Arquitectura del nuevo frontend

```
src/app/
  core/
    auth/        auth.service, token.service, auth.guard, auth.interceptor
    http/        error.interceptor, spinner.interceptor, spinner.service
    layout/      shell (toolbar + sidenav + footer)
    models/      interfaces de dominio (camelCase)
    config/      environments, constantes (IdSistema=3, prefijos)
  shared/
    components/  dialog, confirm-dialog, spinner, form-periodo, export-excel, empty-state
    pipes/       filter.pipe
  features/
    auth/        login, perfil
    dashboard/
    gastos/      registro, suscripcion, registro-vinculado
    ingresos/
    ahorros/
    cuentas-tarjetas/
    catalogos/
    reportes/
  services/      servicios por entidad + CrudService<T> base
```

---

## 7. Fases de implementación

- **Fase 0 — Setup:** scaffold Angular 22, deps, theming M3, environments, proxy dev, layout base. ✅
- **Fase 1 — Infraestructura:** models, servicios (CrudService base), interceptores, guard, componentes compartidos.
- **Fase 2 — Auth y perfil:** login (IdSistema=3), logout, guard, perfil + cambio de contraseña.
- **Fase 3 — Catálogos y cuentas/tarjetas:** ABM Empresa/Banco/TipoCuenta/TipoTarjeta/Cuenta/Tarjeta + categorías (read-only).
- **Fase 4 — Gastos:** Registro + Suscripcion + RegistroVinculado.
- **Fase 5 — Ingresos y Ahorros.**
- **Fase 6 — Dashboard, Balance y Reportes + export Excel.**
- **Fase 7 — Pulido, pruebas y despliegue.**

---

## 8. Riesgos y consideraciones

1. Dos backends (`amh-web-api` vs `amhweb-api`): confirmado usar **`amh-web-api`**.
2. `IdUsuario` (mayúscula) en query de Cuenta/Tarjeta; `idUsuario` en el resto.
3. Categorías son de solo lectura (sin botones de alta/edición/borrado).
4. Respuestas anidadas en PUT/DELETE (`{ Message, Response }`).
5. `idUsuario` debe salir del claim `nameid` del JWT (no hardcode).
6. `periodo` es string (`YYYY-MM` en balance, `YYYY` en reportes).
7. "isAdmin" del viejo en realidad es "autenticado" → renombrar a `isAuthenticated`.
