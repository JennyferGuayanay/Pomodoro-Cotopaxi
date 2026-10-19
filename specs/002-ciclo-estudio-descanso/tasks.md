# Tareas de implementación: 002-ciclo-estudio-descanso

## Estado

**Aprobadas para implementación secuencial.**

- Fecha de aprobación: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.

- Plan: `specs/002-ciclo-estudio-descanso/plan.md`.
- Especificación: `specs/002-ciclo-estudio-descanso/spec.md`, aprobada el 2026-10-19.
- Decisiones: `specs/002-ciclo-estudio-descanso/decisiones.md`, aprobadas el 2026-10-19.
- Dependencia: HU-001 implementada, probada y aprobada.
- Regla de ejecución propuesta: implementar una sola tarea aprobada a la vez.

## Orden de ejecución

`T-000` → `T-001` → `T-002` → `T-003` → `T-004` → `T-005` → `T-006`

## T-000: Confirmar la línea base de HU-001

**Estado:** Completada.

**Objetivo:** Registrar una línea base verde antes de modificar la integración del temporizador.

**Trazabilidad:** Dependencia HU-001; puerta de no regresión de SPEC-002-CA13.

**Archivos previstos:**

- Ningún archivo funcional.
- `specs/002-ciclo-estudio-descanso/tasks.md` únicamente para evidencia después de autorizar ejecución.

**Pasos:**

1. Ejecutar las pruebas existentes con `npm test -- --runInBand`.
2. Ejecutar `npx tsc --noEmit`.
3. Ejecutar lint sobre los archivos existentes de HU-001 y registrar el estado del lint global conocido.
4. Confirmar que no se requieren dependencias nuevas.
5. Registrar resultados antes de comenzar T-001.

**Pruebas y evidencia:**

- Cantidad de suites y pruebas aprobadas.
- Resultado de TypeScript.
- Resultado de lint específico y cualquier fallo global preexistente.

**Definición de terminado:**

- La línea base de HU-001 está registrada y no contiene fallos nuevos.
- No se modificó código ni se instalaron dependencias.

**Evidencia de ejecución:**

- `npm test -- --runInBand`: 3 suites y 29 pruebas aprobadas.
- `npx tsc --noEmit`: aprobado sin errores.
- ESLint sobre los archivos de HU-001 y la ruta principal: aprobado sin errores ni advertencias.
- No se instalaron dependencias.

## T-001: Implementar el modelo puro del ciclo

**Estado:** Completada.

**Objetivo:** Modelar fases, progreso, duraciones y transiciones sin React ni API de plataforma.

**Trazabilidad:** SPEC-002-R04-R12, R16, R19-R21; CA01-CA05, CA10, CA14-CA17.

**Archivos previstos:**

- `src/features/pomodoro-cycle/pomodoro-cycle-state.ts`.
- `src/features/pomodoro-cycle/__tests__/pomodoro-cycle-state-test.ts`.

**Dependencias:** T-000.

**Pasos:**

1. Definir tipos cerrados para `study`, `shortBreak` y `longBreak`.
2. Definir cuatro como objetivo de HU-002 y duraciones de 25, 5 y 15 minutos.
3. Crear el estado inicial `study`, cero de cuatro.
4. Implementar una transición pura para completar la fase actual.
5. Conservar uno, dos o tres completados durante cada descanso corto.
6. Conservar cuatro de cuatro durante el descanso largo y reiniciar al terminarlo.
7. Mantener el objetivo vigente durante el ciclo y permitir que el siguiente objetivo entre solo al terminar el descanso largo.
8. No definir eventos de omisión ni selección manual.
9. Cubrir límites y transiciones con pruebas deterministas.

**Pruebas y evidencia:**

- Estado inicial y tres duraciones provisionales.
- Secuencia completa de cuatro estudios y sus descansos.
- Primer, segundo y tercer estudio hacia descanso corto.
- Cuarto estudio hacia descanso largo con cuatro de cuatro.
- Descanso largo hacia estudio con cero.
- Objetivo futuro aplicado solo al ciclo siguiente.
- Inspección de la API pública para confirmar ausencia de selección manual.

**Definición de terminado:**

- El módulo es puro, tipado y no importa React, Expo, red ni almacenamiento.
- Cada finalización produce exactamente una transición válida.
- Todas las pruebas del modelo pasan.

## T-002: Publicar una finalización única desde HU-001

**Estado:** Completada.

**Objetivo:** Permitir que el ciclo conozca una finalización natural sin cambiar los controles ni estados aprobados del temporizador.

**Trazabilidad:** SPEC-002-R05, R08, R13-R16; CA06-CA10, CA13.

**Archivos previstos:**

- `src/hooks/use-timer.ts`.
- `src/hooks/__tests__/use-timer-test.ts`.
- `src/components/pomodoro-timer.tsx`.
- `src/components/__tests__/pomodoro-timer-test.tsx`.

**Dependencias:** T-001.

**Pasos:**

1. Añadir un callback opcional de finalización al hook sin cambiar su uso actual.
2. Detectar la transición natural desde ejecución hasta cero.
3. Proteger el callback contra ticks y renderizados repetidos.
4. Comprobar que pausa, reanudación y diálogo de reinicio no generan finalizaciones.
5. Exponer el callback opcional desde `PomodoroTimer`.
6. Mantener texto, controles, diálogo, formato y accesibilidad de HU-001.
7. Ampliar las pruebas existentes sin reemplazar su cobertura.

**Pruebas y evidencia:**

- Una llamada al completar naturalmente.
- Cero llamadas al pausar, reiniciar, cancelar o desmontar.
- Ausencia de llamadas duplicadas después de llegar a cero.
- Suite completa de `useTimer` y `PomodoroTimer` aprobada.

**Definición de terminado:**

- El callback es opcional y no cambia el comportamiento cuando está ausente.
- HU-001 conserva todos sus escenarios aprobados.
- La finalización natural se comunica exactamente una vez.

## T-003: Implementar el controlador React del ciclo

**Estado:** Completada.

**Objetivo:** Conectar las transiciones puras con cada nueva instancia del temporizador sin duplicar la lógica temporal.

**Trazabilidad:** SPEC-002-R04-R16, R19-R21; CA01-CA10, CA14-CA17.

**Archivos previstos:**

- `src/hooks/use-pomodoro-cycle.ts`.
- `src/hooks/__tests__/use-pomodoro-cycle-test.ts`.

**Dependencias:** T-002.

**Pasos:**

1. Inicializar el modelo aprobado de ciclo.
2. Exponer fase, nombre, progreso, objetivo y duración actual.
3. Procesar una notificación de finalización mediante el modelo puro.
4. Proporcionar una identidad de fase que permita montar el siguiente temporizador detenido.
5. Mantener cuatro como objetivo en HU-002.
6. No incorporar persistencia, configuración ni controles de selección.
7. Probar las transiciones del controlador con React y eventos deterministas.

**Pruebas y evidencia:**

- Estado inicial exacto.
- Duración correspondiente a cada fase.
- Progreso después de estudios y descansos.
- Nueva fase preparada sin ejecución automática.
- Ausencia de API para omitir o elegir fases.

**Definición de terminado:**

- El hook delega las reglas al modelo puro.
- No administra ticks ni replica controles de HU-001.
- Sus pruebas pasan sin depender del reloj real.

## T-004: Implementar la composición accesible del ciclo

**Estado:** Completada.

**Objetivo:** Presentar fase y progreso y reutilizar `PomodoroTimer` para controlar cada fase.

**Trazabilidad:** SPEC-002-R01-R03, R12-R18, R21; CA06-CA13, CA15, CA17.

**Archivos previstos:**

- `src/components/pomodoro-cycle.tsx`.
- `src/components/__tests__/pomodoro-cycle-test.tsx`.

**Dependencias:** T-003.

**Pasos:**

1. Mostrar el nombre exacto de la fase.
2. Mostrar `Pomodoros completados: C de N` con etiqueta accesible equivalente.
3. Renderizar `PomodoroTimer` con la duración actual y callback de finalización.
4. Montar un temporizador nuevo y detenido en cada cambio de fase.
5. No añadir controles de omisión ni selección.
6. Reutilizar componentes temáticos y tokens neutrales existentes.
7. Añadir pruebas de componente para las transiciones y consultas accesibles.

**Pruebas y evidencia:**

- `Estudio`, `Descanso corto` y `Descanso largo` visibles en sus estados.
- Progreso de cero a cuatro y reinicio después del descanso largo.
- Duraciones `25:00`, `05:00` y `15:00` al preparar cada fase.
- Botón `Iniciar` visible en cada fase nueva.
- Ausencia de acciones de omisión o selección.
- Controles y diálogo de HU-001 operativos dentro de la composición.

**Definición de terminado:**

- La fase y el progreso pueden identificarse visualmente y con tecnología de asistencia.
- Cada fase reutiliza `PomodoroTimer` y comienza detenida.
- Las pruebas no usan snapshots como evidencia principal.

## T-005: Integrar HU-002 en la pantalla principal

**Estado:** Completada.

**Objetivo:** Sustituir el temporizador individual por la composición del ciclo sin introducir dominio en la ruta.

**Trazabilidad:** SPEC-002-R01-R21; CA01-CA17.

**Archivos previstos:**

- `src/app/index.tsx`.

**Dependencias:** T-004.

**Pasos:**

1. Renderizar `PomodoroCycle` en la tarjeta existente.
2. Retirar o adaptar únicamente el título fijo que contradiga fases de descanso.
3. Mantener área segura, tema, espaciado y diseño móvil existentes.
4. Mantener toda lógica de dominio fuera de `src/app/`.
5. No modificar otras rutas ni navegación.
6. Ejecutar la suite completa y TypeScript.

**Pruebas y evidencia:**

- Pruebas automatizadas completas aprobadas.
- Revisión de la ruta `/` en Android.
- Diff limitado a la composición prevista.

**Definición de terminado:**

- La pantalla principal muestra el ciclo y el temporizador reutilizado.
- No existe texto fijo que contradiga la fase actual.
- HU-001 sigue operativa y no se incorporó alcance de HU-003 a HU-006.

## T-006: Validar HU-002 y registrar evidencia

**Estado:** Parcialmente completada. Las validaciones automáticas y el bundle Android están aprobados; las pruebas manuales Android quedan pendientes por instrucción del responsable.

**Objetivo:** Validar los 17 criterios de aceptación y la regresión completa de HU-001 antes de solicitar aceptación.

**Trazabilidad:** SPEC-002-CA01 a CA17; SPEC-001-CA01 a CA19 como regresión.

**Archivos previstos:**

- `specs/002-ciclo-estudio-descanso/tasks.md` para registrar evidencia.
- Ningún cambio funcional previsto.

**Dependencias:** T-005.

**Pasos:**

1. Ejecutar `npm test -- --runInBand`.
2. Ejecutar `npx tsc --noEmit`.
3. Ejecutar lint sobre los archivos modificados e intentar `npx expo lint`.
4. Recorrer en Android el ciclo de cuatro estudios, tres descansos cortos y un descanso largo.
5. Verificar inicio manual, duraciones, nombres y progreso en cada transición.
6. Repetir inicio, pausa, reanudación, reinicio y cancelación en estudio y ambos descansos.
7. Confirmar `4 de 4` durante el descanso largo y `0 de 4` al terminarlo.
8. Confirmar ausencia de omisión, selección manual e inicio automático.
9. Repetir el flujo esencial en modo avión.
10. Verificar TalkBack, escalado de texto y temas claro/oscuro.
11. Registrar resultados, dispositivo y pendientes reales.

**Pruebas y evidencia:**

- Comandos y resultados automatizados.
- Matriz CA01-CA17 aprobada, fallida o pendiente.
- Resultado explícito de regresión de HU-001.
- Plataforma y versión Android utilizadas.
- Evidencia de accesibilidad y modo avión.

**Definición de terminado:**

- Todas las pruebas automatizadas y TypeScript pasan sin regresiones.
- Los criterios de HU-002 tienen evidencia registrada.
- Los escenarios aprobados de HU-001 siguen funcionando.
- Cualquier limitación del lint global o validación manual queda declarada, no ocultada.
- HU-002 queda lista para revisión de aceptación, no autoaceptada.

**Evidencia de ejecución:**

- `npm test -- --runInBand`: 6 suites, 53 pruebas aprobadas y 0 snapshots.
- `npx tsc --noEmit`: aprobado sin errores.
- ESLint sobre todos los archivos modificados por HU-002: aprobado sin errores ni advertencias.
- `npx expo lint`: bloqueado únicamente por el error preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`.
- `npx eslint .`: reproduce el mismo error preexistente y no informa errores de HU-002.
- `npx expo export --platform android`: bundle Android generado correctamente fuera del workspace.
- Pruebas manuales en dispositivo Android: pendientes por instrucción del responsable.
- No se instalaron dependencias ni se modificó configuración nativa.

## Matriz tarea-requisito

| Tarea | Requisitos principales | Criterios principales |
| --- | --- | --- |
| T-000 | Puerta de regresión HU-001 | CA13 y línea base |
| T-001 | R04-R12, R16, R19-R21 | CA01-CA05, CA10, CA14-CA17 |
| T-002 | R05, R08, R13-R16 | CA06-CA10, CA13 |
| T-003 | R04-R16, R19-R21 | CA01-CA10, CA14-CA17 |
| T-004 | R01-R03, R12-R18, R21 | CA06-CA13, CA15, CA17 |
| T-005 | R01-R21 | CA01-CA17 |
| T-006 | R01-R21 y regresión HU-001 | CA01-CA17 y SPEC-001-CA01-CA19 |

## Regla de aprobación

La aprobación explícita de `plan.md` y este archivo autorizará comenzar únicamente por T-000. Cada tarea se implementará secuencialmente y deberá registrar evidencia antes de avanzar. La aprobación no autoriza instalar dependencias ni ampliar HU-003 a HU-006.

## Estado de ejecución

| Tarea | Resultado | Evidencia principal |
| --- | --- | --- |
| T-000 | Completada | Línea base: 3 suites y 29 pruebas; TypeScript y lint específico aprobados |
| T-001 | Completada | 14 pruebas del modelo puro aprobadas |
| T-002 | Completada | Finalización única y regresión del temporizador aprobadas |
| T-003 | Completada | 3 pruebas del controlador React aprobadas |
| T-004 | Completada | 4 pruebas de composición y accesibilidad aprobadas |
| T-005 | Completada | Pantalla integrada; suite completa, TypeScript y bundle aprobados |
| T-006 | Parcial | Automatización aprobada; validación manual Android pendiente |
