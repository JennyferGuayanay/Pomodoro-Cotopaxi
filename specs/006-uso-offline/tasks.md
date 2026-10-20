# Tareas — HU-006, uso offline

## Estado y autorización

Historia y criterios completos: en revisión, no aprobados. La instrucción del responsable del 2026-10-20 autoriza únicamente retirar «Explore» y sus enlaces externos, conservar temporizador/configuración y realizar las verificaciones solicitadas.

## HU006-T01 — Retirar la pantalla «Explore» y sus enlaces externos

- **Estado:** Completada el 2026-10-20. La exportación Android y la revisión estática confirmaron la eliminación de la ruta y los enlaces externos de interfaz.
- **Requisitos/criterios:** HU-006-R07; HU-006-CA08.
- **Áreas:** `src/app/explore.tsx`, `src/components/app-tabs.tsx`, `src/components/app-tabs.web.tsx`, `src/components/external-link.tsx`.
- **Dependencias:** DEC-006-01, autorizada explícitamente por el responsable el 2026-10-20.
- **Pasos:**
  1. Retirar el disparador Explore de las pestañas nativas y web.
  2. Retirar los enlaces externos de ejemplo de la barra web.
  3. Eliminar la ruta Explore y el componente de enlaces externos si deja de tener consumidores.
  4. Confirmar que Home/temporizador y Configuración continúan disponibles.
- **Pruebas/evidencia:** prueba de navegación disponible, suites Jest, TypeScript, exportación Android y búsqueda de Explore/URLs en `src`.
- **Hecho cuando:** no queda una ruta ni un acceso Explore, no quedan enlaces externos de interfaz y las rutas conservadas compilan.
- **Evidencia:** `npx expo export --platform android` y `npx expo export --platform web` aprobadas; `npx tsc --noEmit` aprobada; el manifiesto de rutas web contiene `/index` y `/settings`, no `/explore`; búsqueda estática sin coincidencias funcionales de Explore, ExternalLink, enlaces URL, autenticación, publicidad o APIs de red. No se modificó la lógica funcional de HU-001 a HU-005.

## HU006-T02 — Verificar offline, ausencia de cuenta/publicidad y regresión

- **Estado:** Parcial; inspección y builds realizadas; la suite automatizada tiene un fallo fuera de alcance y la validación Android manual está pendiente.
- **Requisitos/criterios:** HU-006-R01–R06; HU-006-CA01–CA07.
- **Áreas:** rutas de aplicación, dependencias/configuración, persistencia, avisos locales, pruebas de HU-001–HU-005.
- **Dependencias:** HU006-T01 para CA08; aprobación de los criterios completos para declarar aceptada HU-006.
- **Pasos:**
  1. Revisar el código y configuración buscando llamadas de red, login, anuncios, analítica y transferencia no aprobada.
  2. Ejecutar las pruebas automatizadas y registrar fallos exactos sin corregir comportamiento fuera del alcance.
  3. Ejecutar lint, TypeScript y exportación Android sin instalar dependencias.
  4. En Android real, activar modo avión y verificar primer inicio tras instalación, temporizador, ciclo, recuperación, aviso local (si el sistema lo permite) y configuración.
  5. Registrar plataforma, versión del sistema, permisos y resultado de cada escenario.
- **Pruebas/evidencia esperada:** comandos reproducibles; búsqueda estática; comprobación manual de Android desconectado; verificación visual de ausencia de login/anuncios.
- **Hecho cuando:** evidencia automatizada y manual está registrada y cada criterio aprobado tiene resultado. No declarar aceptación total mientras falte la verificación manual o la aprobación.

### Evidencia de HU006-T02

| Requisito/criterio | Entorno | Comando o procedimiento | Resultado | Evidencia pendiente |
| --- | --- | --- | --- | --- |
| R01–R07; CA06–CA08 | Windows; código/configuración del proyecto | Búsqueda estática de red, URLs, `Explore`, login, ads, analytics y telemetría | Aprobada para el alcance revisado: no se hallaron llamadas de red, rutas de autenticación, SDK de anuncios ni analítica. Las únicas coincidencias URL restantes son comentarios/documentación en `src`. | Ninguna para inspección del permiso; no es requisito de esta historia. |
| CA08; compilación de rutas | Windows; Expo SDK 58 | `npx expo export --platform android` | Aprobada; bundle Android exportado. | Prueba manual de navegación en dispositivo. |
| CA08; compilación de rutas web | Windows; Expo SDK 58 | `npx expo export --platform web` | Aprobada; los bundles generados incluyen Home y settings; no se generó ruta Explore. | Prueba manual de navegación web. |
| Regresión HU-001–HU-005 | Windows; Jest | `npm test -- --runInBand` | 156 de 157 pruebas aprobadas. Falló `src/features/notifications/__tests__/notification-channel-test.ts`: esperaba `sound: 'default'`, recibió `sound: null`. No se cambió porque está fuera de alcance y no se alteró HU-004. | Resolver con autorización separada y volver a ejecutar la suite. |
| Tipado | Windows; TypeScript | `npx tsc --noEmit` | Aprobada; sin errores de tipos. | Ninguna para tipado. |
| Calidad general | Windows; Expo lint | `npx expo lint` | Fallida por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; archivo sin cambios. | Corregir únicamente mediante autorización independiente. |
| Offline y criterios CA01–CA05 | Dispositivo Android real, modo avión | Primer inicio, temporizador, ciclo, recuperación, aviso local permitido y configuración | Pendiente; no se afirma validación offline manual. | Registrar dispositivo, versión Android, permisos y resultado por escenario. |

## Dependencias y límites

- HU006-T01 es la única tarea de código autorizada por esta instrucción.
- HU006-T02 es verificación, no autorización para reparar o ampliar funcionalidades HU-001–HU-005.
- No instalar ni añadir/eliminar dependencias.
- No modificar el comportamiento de notificaciones, temporizador, ciclo, recuperación o configuración.
- Las decisiones de conectividad, baseline de regresión y privacidad están registradas en `decisiones.md`; no marcar HU-006 aprobada sin aprobación explícita.
