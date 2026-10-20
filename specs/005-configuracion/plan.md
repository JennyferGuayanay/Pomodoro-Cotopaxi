# Plan técnico: HU-005, configuración de tiempos y ciclo

## Estado y autorización

**Aprobado explícitamente el 2026-10-20 por el responsable del producto.** HU-005, la enmienda de HU-002, la especificación y las tareas están aprobadas. La implementación está autorizada secuencialmente desde HU005-T01, conforme a este plan.

- Historia: `docs/historias/HU-005.md` (aprobada el 2026-10-20).
- Especificación: `spec.md` (aprobada el 2026-10-20).
- Decisiones: `decisiones.md` (decisiones funcionales resueltas).
- Fecha de actualización: 2026-10-20.
- Decisiones funcionales pendientes: Ninguna identificada.
- Revisión/aprobación de HU-002 actualizada: Completada el 2026-10-20.
- Aprobación del plan: Aprobado explícitamente el 2026-10-20.
- Autorización de ejecución: Secuencial, comenzando por HU005-T01.

## Propósito

Definir la ruta aprobada para modelar, validar, persistir y aplicar cuatro valores configurables: minutos de estudio, descanso corto, descanso largo y Pomodoros por ciclo. Los valores predeterminados son 25/5/15 minutos y 4 Pomodoros. El plan conserva las fases ya preparadas y el ciclo vigente, y no cambia el comportamiento aprobado de HU-001 a HU-003 ni la implementación existente de HU-004 fuera de la integración descrita.

## Fuentes y hallazgos

- Constitución, historia HU-005, historia/especificación HU-002 y decisiones aprobadas en `decisiones.md`.
- El temporizador y las transiciones de ciclo actuales usan las duraciones 25/5/15 y cuatro Pomodoros.
- El estado de sesión existente conserva `targetPomodoros`; la coordinación de sesión usa actualmente las duraciones constantes.
- AsyncStorage ya está declarado y la aplicación no dispone actualmente de una ruta de configuración.

Son observaciones para orientar la implementación, no decisiones de diseño. No se cambiará el esquema de sesión ni el almacenamiento de HU-003 sin necesidad aprobada y compatibilidad verificada.

## Puertas y precondiciones verificadas

1. HU005-PRE-01 está resuelta: DEC-005-02 define tamaño configurable positivo, predeterminado 4, aplicado al siguiente ciclo, y se actualizan HU-002 y su especificación.
2. HU005-PRE-02 está resuelta: DEC-005-04 define valores predeterminados ante registro no utilizable, aviso no bloqueante ante errores y ausencia de sobrescritura automática por fallo de lectura.
3. HU-005 y la versión actualizada de `docs/historias/HU-002.md` fueron revisadas y aprobadas explícitamente el 2026-10-20.
4. La especificación, este plan y las tareas fueron aprobados explícitamente el 2026-10-20.
5. HU005-T01 está autorizada para comenzar; las tareas posteriores se ejecutarán solo al completarse y verificarse sus dependencias.
6. Antes de implementar API de Expo/React Native o modificar almacenamiento, verificar las versiones instaladas y consultar la documentación de Expo SDK 58 correspondiente. No se requiere instalar paquetes para esta fase documental.

## Alcance del plan

- Modelo tipado de configuración completa: tres duraciones en minutos y cantidad de Pomodoros por ciclo, todos enteros positivos.
- Valores predeterminados 25/5/15 y 4.
- Validación de todo el conjunto antes de persistirlo; errores identifican campos sin reemplazar una configuración válida.
- Persistencia y recuperación local; valores predeterminados ante registro ausente, dañado, incompleto o incompatible.
- Avisos claros y continuidad de la aplicación ante errores de lectura/escritura. Una lectura fallida no sobrescribe datos; una escritura fallida conserva la última configuración válida vigente y persistida y no informa éxito.
- Controles de configuración y restauración con confirmación.
- Cambios de duración solo al preparar la fase posterior; la fase actual preparada, en ejecución o pausada conserva duración y tiempo restante.
- Cambio del tamaño del ciclo solo tras completar el descanso largo vigente.
- Verificación offline y regresión de HU-001 a HU-004.

## Diseño técnico aprobado

1. **Modelo y valores iniciales:** representar los cuatro valores con tipos y unidades explícitos y un valor predeterminado completo. No imponer máximos no aprobados.
2. **Validación:** validar todos los campos antes de guardar; producir errores por campo y rechazar cualquier conjunto incompleto o no positivo. No activar parcialmente una configuración inválida.
3. **Persistencia:** reutilizar el mecanismo local existente (AsyncStorage está instalado), con validación de esquema y del conjunto entero al leer. Para datos inválidos se usan valores predeterminados; una excepción de lectura muestra un mensaje y usa valores predeterminados sin escribirlos automáticamente. Una excepción de escritura conserva la configuración válida previa como vigente y persistida.
4. **Aplicación:** no mutar la fase actual ni el tamaño requerido del ciclo actual al guardar. Leer las duraciones al preparar una fase posterior y el tamaño nuevo al iniciar el ciclo que sigue al descanso largo actual. Mantener el inicio manual de HU-002.
5. **Interfaz:** añadir acceso a configuración en la navegación existente; determinar ubicación y controles concretos después de aprobación. Exponer errores y confirmación a tecnologías de asistencia.
6. **Compatibilidad:** mantener sin cambios la semántica de HU-001, la recuperación de sesión HU-003 y el comportamiento implementado de HU-004. Cambios necesarios de integración se limitarán a los requisitos aprobados y tendrán pruebas de regresión.
7. **Dependencias:** no se prevé añadir dependencias; verificar compatibilidad antes de tocar cualquier API.

## Riesgos y tratamiento

| Riesgo | Tratamiento |
| --- | --- |
| Contradicción histórica entre ciclo fijo y tamaño configurable | Resuelta en DEC-005-02; actualizar HU-002 y verificar default 4 |
| Actualización indebida de una fase ya preparada | Resuelta en DEC-005-07; retener duración/tiempo restante hasta la siguiente transición |
| Registro incompleto o incompatible | Validar como conjunto; valores predeterminados, sin consumir campos parciales |
| Fallo de lectura | Aviso claro, valores predeterminados y continuidad; no sobrescribir automáticamente |
| Fallo de escritura | Aviso claro, conservar vigente y persistida la configuración válida anterior y no informar éxito |
| Cambio del tamaño dentro del ciclo | Mantener el objetivo anterior hasta finalizar su descanso largo |
| Regresión de HU-001 a HU-004 | Pruebas focalizadas y regresión, conservando implementación de HU-004 |

## Estrategia de verificación aprobada

| Verificación | Requisitos | Evidencia prevista |
| --- | --- | --- |
| Modelo y valores predeterminados | R01–R03 | Pruebas deterministas de 25/5/15 y 4 |
| Validación completa | R04–R05 | Válidos, cero, negativos, decimales, vacíos y no enteros; comprobar rechazo atómico |
| Persistencia/recuperación | R06–R08 | Guardado y reapertura; ausente, malformado, incompleto e incompatible |
| Errores de almacenamiento | R09, R15 | Simular fallos de lectura/escritura; mensajes, continuidad, no sobrescritura y conservación |
| Aplicación de duración | R10–R11 | Fase preparada/activa/pausada intacta; siguiente fase recibe valor, sin inicio automático |
| Aplicación del tamaño | R12–R13 | Cambio durante ciclo vigente y uso al ciclo posterior |
| Restauración | R14 | Confirmación, cancelación y persistencia de predeterminados |
| Offline y regresión | R16 y HU-001–HU-004 | Operaciones sin red; ciclo default 4, recuperación de sesión y notificaciones existentes |
| Accesibilidad/Android | Interfaz aprobada | Verificación de campos, errores, confirmación y navegación en Android |

No se han ejecutado pruebas; este plan autoriza la ejecución de pruebas requeridas por cada tarea, no afirma resultados de implementación.

## Áreas previstas para las tareas autorizadas

- Dominio: `src/features/timer/` y `src/features/pomodoro-cycle/`.
- Persistencia: `src/features/persistence/`.
- Coordinación de sesión: `src/hooks/use-pomodoro-session.ts`.
- Pantalla y navegación: estructura actual de `src/app/`.
- Pruebas de dominio, persistencia, interfaz y regresión.

Las ubicaciones exactas se confirman durante la tarea correspondiente. La autorización de este plan no permite ampliar el alcance ni omitir las dependencias.

## Trazabilidad con tareas

| Requisitos/criterios | Tarea | Evidencia |
| --- | --- | --- |
| R01–R05; CA01–CA03 | HU005-T01 | Modelo, valores iniciales y validador completo |
| R03, R06–R09, R15–R16; CA01–CA02, CA08–CA11 | HU005-T02 | Persistencia, recuperación, fallos y offline |
| R10–R13; CA04–CA06 | HU005-T03 | Duración y tamaño aplicados en los límites aprobados |
| R01, R04–R05, R14; CA03, CA07 | HU005-T04 | Edición, errores accesibles y restauración |
| R01–R16; CA01–CA11 | HU005-T05 | Regresión, Android y funcionamiento offline |

## Aprobación y autorización

- Decisiones previas funcionales: Resueltas.
- HU-005 y enmienda de HU-002: Aprobadas explícitamente el 2026-10-20.
- Especificación aprobada: Sí, explícitamente el 2026-10-20.
- Plan aprobado: Sí, explícitamente el 2026-10-20.
- Tareas aprobadas: Sí, explícitamente el 2026-10-20.
- HU005-T01 autorizada para comenzar: Sí.
- Implementación iniciada: No.
