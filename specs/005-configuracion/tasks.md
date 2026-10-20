# Tareas aprobadas: HU-005, configuración de tiempos y ciclo

## Estado y puerta de ejecución

**Aprobadas explícitamente el 2026-10-20 por el responsable del producto.** HU005-PRE-01 y HU005-PRE-02 están completadas y revisadas. La implementación está autorizada secuencialmente según las dependencias; HU005-T01–T04 están implementadas y verificadas, y HU005-T05 no se ha iniciado.

- Historia: `docs/historias/HU-005.md` (aprobada el 2026-10-20).
- Especificación: `spec.md` (aprobada el 2026-10-20).
- Plan: `plan.md` (aprobado el 2026-10-20).
- Decisiones funcionales pendientes: Ninguna identificada.
- Tareas de implementación aprobadas: HU005-T01–T05, en el orden y con las dependencias definidos aquí.
- Autorización para ejecutar HU005-T04: Sí; tarea implementada y verificada tras completar HU005-T01–T03.
- Autorización de tareas posteriores: Secuencial, al completarse y verificarse sus dependencias.

## Precondiciones comunes

- Respetar el alcance aprobado de HU-005, la enmienda de HU-002 y `spec.md`.
- Respetar `plan.md` y el orden/dependencias de estas tareas.
- No cambiar requisitos ni incorporar dependencias no aprobadas.
- Preservar HU-001, HU-002, HU-003 y la implementación existente de HU-004, salvo la integración funcional autorizada en HU-005.
- Registrar pruebas y evidencia por requisito. No declarar validaciones que no se ejecutaron.

## Tareas habilitantes documentales

### HU005-PRE-01 — Reconciliar el tamaño del ciclo

- **Estado:** Completada y revisada el 2026-10-20.
- **Decisión:** DEC-005-02 aprobada: permitir entero positivo, predeterminado 4, y aplicar el cambio al siguiente ciclo completo.
- **Evidencia:** Actualizadas `docs/historias/HU-002.md`, `specs/002-ciclo-estudio-descanso/spec.md`, HU-005, `spec.md`, `plan.md` y esta lista de tareas.
- **Cierre:** La regla es coherente entre HU-002 y HU-005; no se modificó código.

### HU005-PRE-02 — Definir recuperación de configuración no utilizable

- **Estado:** Completada y revisada el 2026-10-20.
- **Decisión:** DEC-005-04 aprobada: usar valores predeterminados ante registro ausente/dañado/incompleto/incompatible; ante error de lectura, mostrar mensaje claro, continuar con valores predeterminados y no sobrescribir automáticamente; ante error de escritura, mostrar mensaje y conservar vigente y persistida la configuración válida anterior.
- **Evidencia:** Incorporados requisitos, criterios y pruebas en `spec.md`, `plan.md` y esta lista de tareas.
- **Cierre:** Los escenarios de datos y almacenamiento tienen respuestas observables; no se modificó código.

## Tareas de implementación

### HU005-T01 — Implementar modelo y validación de configuración

- **Estado:** Implementada y verificada el 2026-10-20.
- **Requisitos:** HU-005-R01–R05.
- **Criterios:** HU-005-CA01–CA03.
- **Áreas previstas:** dominio de `src/features/`; ubicaciones exactas por confirmar durante la tarea.
- **Depende de:** aprobación de HU-005, de la enmienda de HU-002, `spec.md`, `plan.md` y esta tarea, todas registradas el 2026-10-20. No depende de otra tarea de implementación.
- **Pasos:**
  1. Definir un modelo tipado para las tres duraciones enteras positivas en minutos y la cantidad entera positiva de Pomodoros por ciclo.
  2. Definir el conjunto predeterminado completo: 25/5/15 minutos y 4 Pomodoros.
  3. Implementar validación determinista del conjunto completo, sin máximos inventados ni aceptación parcial.
  4. Devolver información suficiente para identificar cada campo inválido sin reemplazar datos válidos.
- **Pruebas/evidencia:** predeterminados; campos positivos válidos; cero, negativos, decimales, vacíos y no enteros rechazados; validación atómica de todos los campos.
- **Hecho cuando:** modelo, valores predeterminados y validador cumplen R01–R05 y cada regla tiene prueba determinista.
- **Evidencia ejecutada:**

| Tarea | Requisitos | Entorno | Comando o procedimiento | Resultado | Evidencia pendiente |
| --- | --- | --- | --- | --- | --- |
| HU005-T01 | HU-005-R01–R05; HU-005-CA01–CA03 | Windows; Jest del proyecto | `npm test -- --runInBand` | Aprobado: 13 suites y 132 pruebas pasaron. | Ninguna para el modelo y la validación de T01. |
| HU005-T01 | HU-005-R01–R05 | Windows; TypeScript del proyecto | `npx tsc --noEmit` | Aprobado: sin errores de tipos. | Ninguna. |
| HU005-T01 | Verificación de calidad del proyecto | Windows; Expo lint | `npx expo lint` | Fallido por un error preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; archivo fuera del alcance y sin cambios. | Corregir el error preexistente en una tarea autorizada por separado. |

Las pruebas automatizadas cubren valores predeterminados, conjuntos positivos, todos los campos con valores cero/negativos/decimales/vacíos/no numéricos/ausentes, entrada no objeto, reporte acumulado de campos inválidos y ausencia de un máximo no aprobado. No se realizaron pruebas manuales porque T01 solo implementa lógica pura de dominio.

### HU005-T02 — Persistir y recuperar configuración local

- **Estado:** Implementada y verificada el 2026-10-20.
- **Requisitos:** HU-005-R03, R06–R09, R15–R16.
- **Criterios:** HU-005-CA01–CA02, CA08–CA11.
- **Áreas previstas:** `src/features/persistence/`; usar almacenamiento local ya existente sujeto a verificación.
- **Depende de:** HU005-T01 y aprobación/autorización común.
- **Pasos:**
  1. Guardar y recuperar localmente el conjunto completo validado.
  2. Usar los predeterminados cuando no hay registro utilizable; nunca combinar campos parciales con predeterminados para formar una configuración válida.
  3. Ante fallo de lectura, mostrar mensaje, continuar con predeterminados y no escribir automáticamente.
  4. Ante fallo de escritura, mostrar mensaje, no comunicar éxito y conservar vigente y persistida la configuración válida anterior.
  5. Evitar modificar o invalidar la persistencia de sesión HU-003.
- **Pruebas/evidencia:** ausencia de registro, lectura de configuración válida, registros dañados/incompletos/incompatibles, falla de lectura/escritura simulada, persistencia offline.
- **Hecho cuando:** CA01–CA02 y CA08–CA11 se verifican y los errores no bloquean ni producen reemplazo parcial.
- **Evidencia ejecutada:**

| Tarea | Requisitos | Entorno | Comando o procedimiento | Resultado | Evidencia pendiente |
| --- | --- | --- | --- | --- | --- |
| HU005-T02 | HU-005-R03, R06–R09, R15; HU-005-CA01–CA02, CA08–CA10 | Windows; Jest del proyecto | `npm test -- --runInBand` | Aprobado: 14 suites y 142 pruebas pasaron; incluye ausencia, registro válido/corrupto/incompleto/incompatible, fallos simulados y conservación del registro anterior. | Verificación Android en modo avión, prevista para HU005-T05. |
| HU005-T02 | HU-005-R03, R06–R09, R15 | Windows; TypeScript del proyecto | `npx tsc --noEmit` | Aprobado: sin errores de tipos. | Ninguna. |

La persistencia utiliza una clave AsyncStorage independiente del estado de sesión HU-003. Los errores se devuelven explícitamente y los fallos de lectura/escritura muestran un aviso no bloqueante; los controles de edición y los errores de validación por campo forman parte de HU005-T04. La operación es local y no invoca red; la prueba manual de modo avión queda para HU005-T05.

### HU005-T03 — Aplicar configuración a fases y ciclos

- **Estado:** Implementada y verificada el 2026-10-20.
- **Requisitos:** HU-005-R10–R13.
- **Criterios:** HU-005-CA04–CA06.
- **Áreas previstas:** `src/features/timer/`, `src/features/pomodoro-cycle/` y `src/hooks/use-pomodoro-session.ts`.
- **Depende de:** HU005-T01 y HU005-T02; aprobación/autorización común.
- **Pasos:**
  1. No alterar fase preparada, en ejecución o pausada ni su tiempo restante cuando se guarda una duración.
  2. Al preparar la fase posterior, usar la duración configurada, dejando la fase detenida hasta inicio manual.
  3. Mantener la cantidad del ciclo vigente hasta terminar su descanso largo; aplicar el nuevo objetivo al ciclo siguiente.
  4. Conservar el formato y recuperación de sesión HU-003 salvo cambio aprobado y probado.
- **Pruebas/evidencia:** reloj controlado para fase preparada/activa/pausada; transición con duración nueva; límite de ciclo durante cambio de objetivo; fase siguiente detenida y regresión HU-001/HU-002.
- **Hecho cuando:** CA04–CA06 pasan y el ciclo con valor predeterminado 4 conserva comportamiento previo.
- **Evidencia ejecutada:**

| Tarea | Requisitos | Entorno | Comando o procedimiento | Resultado | Evidencia pendiente |
| --- | --- | --- | --- | --- | --- |
| HU005-T03 | HU-005-R10–R13; HU-005-CA04–CA06 | Windows; Jest del proyecto | `npm test -- --runInBand` | Aprobado: 15 suites y 150 pruebas pasaron; incluye fase preparada/en ejecución/pausada, nuevas duraciones en la fase posterior y nuevo objetivo después del descanso largo. | Validación manual Android y modo avión, prevista para HU005-T05. |
| HU005-T03 | HU-005-R10–R13 | Windows; TypeScript del proyecto | `npx tsc --noEmit` | Aprobado: sin errores de tipos. | Ninguna. |
| HU005-T03 | Calidad de archivos modificados | Windows; ESLint focalizado | `npx eslint` sobre los archivos TS/TSX modificados | Aprobado: sin errores en los archivos de T02/T03. | Ninguna para archivos modificados. |
| HU005-T03 | Calidad general del proyecto | Windows; Expo lint | `npx expo lint` | Fallido por el error preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; fuera del alcance y sin cambios. | Resolver en una tarea separada autorizada. |

La configuración se comparte desde el proveedor de la aplicación y se persiste en una clave distinta a la sesión HU-003. Guardar no modifica el temporizador ni el objetivo del ciclo vigente; la configuración se consulta al preparar fases posteriores y al iniciar el ciclo siguiente al descanso largo. Se mantiene el inicio manual de cada fase. Los errores de lectura y escritura muestran avisos y no bloquean el temporizador.

### HU005-T04 — Añadir controles de configuración y restauración

- **Estado:** Implementada y verificada el 2026-10-20.
- **Requisitos:** HU-005-R01–R05, R09, R14 y R15.
- **Criterios:** HU-005-CA03, CA07, CA09 y CA10.
- **Áreas:** `src/app/settings.tsx`, acceso desde `src/app/index.tsx`, registro de navegación en `src/components/app-tabs.tsx` y `src/components/app-tabs.web.tsx`, pantalla en `src/features/configuration/pomodoro-configuration-screen.tsx` y pruebas asociadas. Reutiliza el proveedor y almacenamiento existentes sin modificarlos.
- **Depende de:** HU005-T01–T03 y aprobación/autorización común.
- **Pasos:**
  1. Permitir editar los cuatro valores incluidos en el alcance.
  2. Presentar errores de validación por campo y de manera accesible.
  3. Añadir restauración con confirmación; cancelar conserva la configuración.
  4. Presentar mensajes claros de error de lectura/escritura sin bloquear la aplicación y preservar el comportamiento de fallback/conservación aprobado.
- **Pruebas/evidencia:** entradas válidas/inválidas, accesibilidad de errores, confirmación/cancelación, guardado, errores de lectura/escritura y navegación.
- **Hecho cuando:** se pueden editar y restaurar los cuatro valores según la especificación, se presentan claramente los errores de almacenamiento y las pruebas de interacción pasan.
- **Evidencia ejecutada:**

| Tarea | Requisitos | Entorno | Comando o procedimiento | Resultado | Evidencia pendiente |
| --- | --- | --- | --- | --- | --- |
| HU005-T04 | HU-005-R01–R05, R09, R14–R15; HU-005-CA03, CA07, CA09–CA10 | Windows; Jest del proyecto | `npm test -- --runInBand` | Aprobado: 17 suites y 157 pruebas pasaron; incluye 7 pruebas nuevas para pantalla, validación, guardado, restauración, errores y acceso desde Inicio. | Validación manual de navegación y accesibilidad en Android, prevista para HU005-T05. |
| HU005-T04 | HU-005-R01–R05, R09, R14–R15 | Windows; TypeScript del proyecto | `npx tsc --noEmit` | Aprobado: sin errores de tipos. | Ninguna. |
| HU005-T04 | Calidad de los archivos modificados por T04 | Windows; ESLint focalizado | `npx eslint` sobre los archivos TS/TSX de la pantalla y navegación de T04 | Aprobado: sin errores ni advertencias en los archivos comprobados. | Ninguna para los archivos de T04. |
| HU005-T04 | Calidad general del proyecto | Windows; Expo lint | `npx expo lint` | Fallido por el error preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; fuera del alcance y sin cambios. | Resolver en una tarea separada autorizada. |

Las pruebas automatizadas verifican la representación de valores persistidos y predeterminados, el rechazo accesible de varios campos inválidos sin persistencia, el guardado válido, la confirmación de restauración, el aviso de error de lectura, el error de escritura y el acceso de Inicio a `/settings`. Las validaciones manuales Android/offline quedan para HU005-T05; T05 no se inició.

### HU005-T05 — Verificar regresión y operación móvil/offline

- **Estado:** Aprobada; autorizada para ejecución secuencial tras completar HU005-T01–T04; no iniciada.
- **Requisitos:** HU-005-R01–R16.
- **Criterios:** HU-005-CA01–CA11.
- **Áreas previstas:** pruebas de dominio, ciclo, persistencia, pantalla, temporizador y notificaciones.
- **Depende de:** HU005-T01–T04 y aprobación/autorización común.
- **Pasos:**
  1. Ejecutar pruebas focalizadas y regresión de HU-001, HU-002, HU-003 y HU-004.
  2. Verificar uso offline y errores de almacenamiento.
  3. Verificar controles, mensajes y accesibilidad en Android.
  4. Registrar comandos, resultados, limitaciones y evidencia manual pendiente.
- **Pruebas/evidencia:** resultados automatizados focalizados y validación manual Android/offline.
- **Hecho cuando:** pasan los criterios aprobados, no hay regresiones y toda limitación queda registrada.

## Orden de ejecución propuesto

HU005-T01 precede a HU005-T02; HU005-T03 depende de T01 y T02; HU005-T04 depende de T01–T03; HU005-T05 depende de T01–T04. HU005-PRE-01 y PRE-02 son tareas documentales completadas. La autorización secuencial no permite iniciar una tarea posterior antes de completar y verificar sus dependencias.

## Aprobación y autorización

- HU-005 y enmienda de HU-002 aprobadas: Sí, explícitamente el 2026-10-20.
- Especificación aprobada: Sí, explícitamente el 2026-10-20.
- Plan y tareas aprobados: Sí, explícitamente el 2026-10-20.
- Estado de implementación: HU005-T01–T04 implementadas y verificadas; HU005-T05 pendiente y no iniciada.
