# Tareas de implementación: 001-temporizador

## Estado

**Aprobado para implementación secuencial.**

- Fecha de aprobación: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.

- Plan: `specs/001-temporizador/plan.md`.
- Especificación: `specs/001-temporizador/spec.md`, aprobada el 2026-10-19.
- Regla de ejecución: implementar una sola tarea aprobada a la vez.

## Orden de ejecución

`T-000` → `T-001` → `T-002` → `T-003` → `T-004` → `T-005` → `T-006`

## T-000: Restablecer la línea base de TypeScript

**Estado:** Completada.

**Objetivo:** Resolver aisladamente el error TypeScript preexistente en `src/components/app-tabs.web.tsx:38` para que la validación global pueda detectar regresiones de HU-001.

**Trazabilidad:** Constitución, principio de TypeScript y puerta de calidad; no añade funcionalidad a HU-001.

**Archivos previstos:**

- `src/components/app-tabs.web.tsx`.

**Pasos:**

1. Reproducir el error con `npx tsc --noEmit`.
2. Ajustar únicamente la incompatibilidad de tipos de `Pressable` y `TabTriggerSlotProps`.
3. Conservar el comportamiento visual y de navegación existente.
4. Ejecutar nuevamente la comprobación de TypeScript.

**Pruebas y evidencia:**

- Salida anterior y posterior de `npx tsc --noEmit`.
- Revisión del diff para confirmar que no cambió el comportamiento.

**Definición de terminado:**

- La línea base compila sin el error preexistente.
- No se modificó funcionalidad del temporizador ni navegación.

## T-001: Configurar infraestructura de pruebas

**Estado:** Completada.

**Objetivo:** Añadir el ejecutor y utilidades necesarias para probar HU-001 según la guía de Expo SDK 58.

**Trazabilidad:** Constitución, principio de pruebas; habilita cobertura de SPEC-001-R01 a R18.

**Archivos previstos:**

- `package.json`.
- `package-lock.json`.
- `tsconfig.json`.

**Dependencias:** T-000.

**Pasos:**

1. Instalar con `npx expo install jest-expo jest @types/jest @testing-library/react-native "--" --dev`.
2. Configurar el preset `jest-expo` y un script de prueba no interactivo.
3. Incluir tipos de Jest sin desactivar TypeScript estricto.
4. Añadir una prueba mínima de configuración y ejecutarla.
5. Ejecutar TypeScript y revisar cambios de dependencias.

**Pruebas y evidencia:**

- Resultado del script de prueba.
- Resultado de `npx tsc --noEmit`.
- Versiones instaladas compatibles con Expo SDK 58 y Jest 30.

**Definición de terminado:**

- Jest y React Native Testing Library ejecutan una prueba TypeScript.
- No se añadieron dependencias de producción ni configuración nativa.

## T-002: Implementar y probar el modelo del temporizador

**Estado:** Completada.

**Objetivo:** Crear el modelo puro de estados, transiciones, cálculo temporal y formato.

**Trazabilidad:** SPEC-001-R01 a R11 y R15; CA01 a CA14.

**Archivos previstos:**

- `src/features/timer/timer-state.ts`.
- `src/features/timer/__tests__/timer-state-test.ts`.

**Dependencias:** T-001.

**Pasos:**

1. Definir tipos discriminados para detenido, ejecución, pausa y confirmación.
2. Definir la duración predeterminada de estudio en milisegundos.
3. Implementar transiciones puras con tiempo actual explícito.
4. Implementar cálculo no negativo del tiempo restante.
5. Implementar `MM:SS` con redondeo hacia arriba y minutos sin límite de dos dígitos.
6. Cubrir todas las transiciones y límites con pruebas unitarias.

**Pruebas y evidencia:**

- Inicio con duración configurada y 25 minutos predeterminados.
- Pausa estable y reanudación sin reinicio.
- Solicitud de reinicio desde ejecución y pausa.
- Cancelación para ambos estados previos.
- Confirmación que restaura y detiene.
- Casos `00:00`, fracción positiva y `100:00`.

**Definición de terminado:**

- Las funciones son puras, tipadas y no importan React ni API nativas.
- Todas las pruebas de dominio pasan.
- No existe tiempo negativo ni transición fuera de la especificación.

## T-003: Implementar y probar el hook de ejecución

**Estado:** Completada.

**Objetivo:** Conectar el modelo con el reloj y el ciclo de vida de React sin usar ticks como fuente de verdad.

**Trazabilidad:** SPEC-001-R03 a R11 y R14; CA01 a CA11 y CA18.

**Archivos previstos:**

- `src/hooks/use-timer.ts`.
- `src/hooks/__tests__/use-timer-test.ts`.

**Dependencias:** T-002.

**Pasos:**

1. Inicializar el hook con duración configurable y reloj sustituible.
2. Actualizar la presentación solo durante ejecución.
3. Derivar el tiempo desde la marca de finalización.
4. Suspender y limpiar actualizaciones al pausar o abrir confirmación.
5. Reanudar correctamente al cancelar desde ejecución.
6. Detener y restaurar al confirmar el reinicio.
7. Limpiar recursos al desmontar y al llegar a cero.

**Pruebas y evidencia:**

- Temporizadores falsos y reloj controlado.
- Verificación de que pausa y confirmación congelan el tiempo.
- Verificación de reanudación sin deriva acumulada.
- Verificación de limpieza al desmontar.

**Definición de terminado:**

- El hook expone estado, texto visible y acciones tipadas.
- No quedan timers activos fuera de ejecución.
- Sus pruebas pasan de forma determinista.

## T-004: Implementar y probar la interfaz del temporizador

**Estado:** Completada.

**Objetivo:** Crear el componente móvil accesible con controles condicionales y diálogo exacto.

**Trazabilidad:** SPEC-001-R01, R07-R13 y R15-R18; CA06 a CA19.

**Archivos previstos:**

- `src/components/pomodoro-timer.tsx`.
- `src/components/__tests__/pomodoro-timer-test.tsx`.

**Dependencias:** T-003.

**Pasos:**

1. Mostrar estado y tiempo mediante componentes temáticos existentes.
2. Renderizar únicamente los controles válidos por estado.
3. Añadir áreas táctiles, roles, etiquetas y estados accesibles.
4. Abrir `Alert.alert` con mensaje y botones aprobados.
5. Configurar el diálogo no cancelable al tocar fuera en Android.
6. Conectar callbacks de cancelación y reinicio con el hook.
7. Usar tokens neutrales sin afirmar identidad institucional.

**Pruebas y evidencia:**

- Consultas por texto, rol y etiqueta accesible.
- Controles presentes y ausentes en cada estado.
- Captura de argumentos enviados a `Alert.alert`.
- Ejecución de callbacks `Cancelar` y `Reiniciar`.
- Verificación de tiempo y estado después de cada callback.

**Definición de terminado:**

- Los cuatro escenarios se pueden recorrer desde el componente.
- El diálogo contiene exactamente el mensaje y botones aprobados.
- Las pruebas del componente pasan sin snapshots frágiles.

## T-005: Integrar la pantalla principal

**Estado:** Completada.

**Objetivo:** Reemplazar el contenido inicial de Expo por la composición de HU-001 en la ruta principal.

**Trazabilidad:** SPEC-001-R01-R18; CA01-CA19.

**Archivos previstos:**

- `src/app/index.tsx`.

**Dependencias:** T-004.

**Pasos:**

1. Eliminar de la ruta principal el contenido de bienvenida de Expo.
2. Mantener área segura y estructura móvil existente.
3. Renderizar `PomodoroTimer` con 25 minutos como valor predeterminado.
4. Mantener lógica de dominio fuera de `src/app/`.
5. Comprobar temas claro y oscuro y escalado de texto.

**Pruebas y evidencia:**

- Pruebas automatizadas completas.
- Renderizado manual de la ruta `/` en Android.
- Revisión de que no se modificaron rutas ajenas.

**Definición de terminado:**

- La ruta principal presenta el temporizador y no el contenido inicial de Expo.
- No se añadió comportamiento de HU-002 a HU-006.
- TypeScript y pruebas pasan.

## T-006: Validar HU-001 y registrar evidencia

**Estado:** Completada. Los cuatro escenarios funcionales fueron aprobados manualmente en un dispositivo Android.

**Objetivo:** Ejecutar la validación completa y documentar la cobertura de aceptación antes de solicitar cierre.

**Trazabilidad:** SPEC-001-CA01 a CA19 y puertas de calidad de la constitución.

**Archivos previstos:**

- Solo el registro de evidencia que se acuerde al iniciar la tarea; no se prevén cambios funcionales.

**Dependencias:** T-005.

**Pasos:**

1. Ejecutar `npm test -- --runInBand`.
2. Ejecutar `npx expo lint`.
3. Ejecutar `npx tsc --noEmit`.
4. Recorrer iniciar, pausar y continuar, reiniciar, y cancelar el reinicio en Android.
5. Repetir el flujo esencial en modo avión.
6. Verificar TalkBack, escalado de texto y temas claro/oscuro.
7. Relacionar resultados con CA01 a CA19 y registrar pendientes reales.

**Pruebas y evidencia:**

- Comandos, versiones, resultado y salida relevante.
- Plataforma Android utilizada.
- Matriz de criterios aprobados, fallidos o no ejecutados.

**Definición de terminado:**

- Todas las comprobaciones automáticas pasan.
- Los cuatro escenarios originales están validados en Android.
- No hay criterios sin evidencia ni fallos ocultos.
- HU-001 queda lista para revisión de aceptación, no autoaceptada.

## Matriz tarea-requisito

| Tarea | Requisitos principales | Criterios principales |
| --- | --- | --- |
| T-000 | Puerta TypeScript | Línea base técnica |
| T-001 | Puerta de pruebas | Infraestructura para CA01-CA19 |
| T-002 | R01-R11, R15 | CA01-CA14 |
| T-003 | R03-R11, R14 | CA01-CA11, CA18 |
| T-004 | R01, R07-R13, R15-R18 | CA06-CA19 |
| T-005 | R01-R18 | CA01-CA19 |
| T-006 | R01-R18 | CA01-CA19 |

## Regla de aprobación

La aprobación de este archivo autoriza comenzar únicamente por T-000. Terminar una tarea no autoriza iniciar automáticamente la siguiente; cada cambio debe revisarse conforme al flujo SDD acordado.

## Evidencia de ejecución

### Estado por tarea

| Tarea | Resultado | Evidencia principal |
| --- | --- | --- |
| T-000 | Completada | `npx tsc --noEmit` sin errores después de la corrección aislada |
| T-001 | Completada | Jest 30, `jest-expo` 58.0.11 y Testing Library 14.1 configurados |
| T-002 | Completada | 17 pruebas del modelo aprobadas |
| T-003 | Completada | 6 pruebas del hook aprobadas |
| T-004 | Completada | 6 pruebas del componente y diálogo aprobadas |
| T-005 | Completada | Pantalla integrada; suite y TypeScript aprobados |
| T-006 | Completada | Automatización y bundle aprobados; validación funcional aprobada en dispositivo Android |

### Pruebas manuales Android

| Escenario | Resultado | Evidencia comunicada |
| --- | --- | --- |
| Iniciar | Aprobado | La cuenta regresiva inicia correctamente |
| Pausar | Aprobado | El temporizador se detiene conservando el tiempo restante |
| Reanudar | Aprobado | La cuenta continúa desde el tiempo conservado |
| Reiniciar | Aprobado | La confirmación restaura el tiempo inicial de la fase |
| Cancelar el reinicio | Aprobado | Se conserva el tiempo restante y se recupera el estado anterior |

- Plataforma: dispositivo Android físico.
- Fecha de registro: 2026-10-19.
- Resultado funcional de HU-001: Aprobado.

### Comandos finales

| Comando | Resultado |
| --- | --- |
| `npm test -- --runInBand` | 3 suites, 29 pruebas aprobadas |
| `npx tsc --noEmit` | Aprobado, sin errores |
| ESLint sobre archivos de HU-001 | Aprobado, sin errores ni advertencias |
| `npx eslint .` | Un error preexistente en `src/hooks/use-color-scheme.web.ts:11` |
| `npx expo lint` | Configuró ESLint, pero Expo CLI informó una incompatibilidad contradictoria con ESLint 9.39.5; se usó ESLint directo |
| `npx expo export --platform android` | Bundle Android generado correctamente fuera del workspace |
| Prueba manual externa en Android | Los cinco controles funcionales de HU-001 fueron aprobados |
| `npm audit --omit=dev` | 48 vulnerabilidades transitivas; las correcciones propuestas implican cambios incompatibles |

### Observaciones no bloqueantes de HU-001

- Resolver o aceptar separadamente el error lint preexistente de `use-color-scheme.web.ts`.
- Revisar las vulnerabilidades transitivas dentro de una tarea de mantenimiento de dependencias; no ejecutar `npm audit fix --force` porque propone degradar Expo y Jest.
