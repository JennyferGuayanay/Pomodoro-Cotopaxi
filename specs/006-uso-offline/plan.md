# Plan — HU-006, uso offline, sin inicio de sesión ni publicidad

## Estado y puerta SDD

**Borrador en revisión, no aprobado.** El responsable autorizó expresamente solo la eliminación de «Explore» y sus enlaces externos y la verificación de los requisitos. Este documento no autoriza ampliar el alcance ni modificar las funciones de HU-001 a HU-005. La aprobación completa de HU-006 está pendiente.

## Requisitos y objetivo

Preparar evidencia para HU-006-R01–R07 y HU-006-CA01–CA08: operación de las funciones existentes sin Internet, sin registro/inicio de sesión ni publicidad, con persistencia local y sin la pantalla/enlaces externos de ejemplo.

## Observaciones del estado actual

- `src/features/persistence/pomodoro-state-storage.ts` y `src/features/persistence/pomodoro-configuration-storage.ts` usan AsyncStorage para estado y configuración local.
- Las notificaciones de fase se programan mediante `expo-notifications`; la configuración declara `enableRemoteNotifications: false` en `app.json`.
- El análisis estático previo no encontró llamadas de aplicación a `fetch`, XMLHttpRequest, WebSocket, APIs de autenticación, SDK de publicidad ni analítica.
- Antes del cambio, `src/app/explore.tsx` y `src/components/app-tabs.web.tsx` presentaban enlaces externos, y existían accesos de Explore en ambas implementaciones de pestañas.
- El paquete `expo-web-browser` permanece en el manifiesto como dependencia sin uso después de retirar el componente. No se elimina en este alcance para evitar cambios de dependencias no necesarios.
- El criterio aprobado exige independencia funcional de Internet, no ausencia del permiso `INTERNET`; no hay carpetas Android/iOS generadas para inspeccionar en este proyecto CNG.

## Diseño mínimo dentro del alcance autorizado

1. Eliminar la ruta de ejemplo Explore y sus enlaces externos.
2. Eliminar solo los accesos de Explore y conservar Home/temporizador y Configuración en las pestañas nativas y web.
3. No tocar almacenamiento, ciclo, temporizador, notificaciones ni configuración.
4. Verificar con búsqueda estática que no quedan rutas/enlaces externos de interfaz ni referencias a publicidad, autenticación o red en el código de la aplicación.

Se revisaron las referencias de Expo SDK 58 para [NativeTabs](https://docs.expo.dev/versions/v58.0.0/sdk/router/native-tabs.md) y [expo-router/ui](https://docs.expo.dev/versions/v58.0.0/sdk/router/ui.md). Los cambios solo retiran disparadores existentes; no agregan API, permisos, plugins ni dependencias.

## Estrategia de verificación

| Requisito/criterio | Verificación | Evidencia |
| --- | --- | --- |
| R01, R02, CA06–CA07 | Inspección de rutas, interfaz, dependencias directas y configuración para login/ads | Búsqueda repetible; revisión de package.json y app.json |
| R03–R05, CA01–CA05 | Inspección del almacenamiento local y avisos; Jest/TypeScript; prueba manual Android en modo avión | Resultados automatizados y registro manual de dispositivo/escenarios |
| R07, CA08 | Prueba de navegación y exportación Android; búsqueda de Explore y URLs en el código de aplicación | Rutas resultantes, prueba y búsqueda sin coincidencias |
| No regresión HU-001–HU-005 | Suites existentes de temporizador/ciclo/persistencia/avisos/configuración | Resultados por comando, incluyendo fallos preexistentes o del worktree |

## Riesgos y límites

- La prueba automatizada de mocks y el análisis estático no certifican por sí solos el primer inicio offline en un dispositivo Android.
- Las notificaciones locales dependen de permisos y restricciones de Android según HU-004.
- HU-001, HU-003 y HU-004 aún están en borrador; confirmar su baseline antes de aprobar la matriz completa de aceptación.
- No cambiar ni ajustar el canal de notificaciones en esta historia; su comportamiento está fuera de la autorización de eliminación de Explore.
- Las preguntas de alcance de esta revisión están resueltas en `decisiones.md`; la aprobación formal de la historia y la validación Android offline siguen pendientes.

## Trazabilidad

| Requisito | Cambio/prueba prevista |
| --- | --- |
| R01–R02 | Revisión estática de rutas/manifiesto/configuración; prueba manual de navegación |
| R03–R05 | Persistencia y notificaciones locales existentes; pruebas de regresión y modo avión en Android |
| R06 | Revisión frente a la constitución y búsqueda de SDK/código de analítica o transferencia |
| R07 | Eliminación de `explore.tsx`, sus accesos y enlaces externos; exportación y búsqueda de referencias |

## Aprobación

- Especificación completa aprobada: pendiente.
- Plan aprobado: pendiente.
- Alcance de código autorizado: únicamente DEC-006-01.
