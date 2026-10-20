# Decisiones de especificación: 002-ciclo-estudio-descanso

## Estado

**Aprobadas como parte de la especificación 002.**

- Historia de origen: `docs/historias/HU-002.md`.
- Especificación: `specs/002-ciclo-estudio-descanso/spec.md`.
- Constitución aplicable: `docs/constitution.md`.
- Fecha de registro: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.
- Fecha de aprobación: 2026-10-19.

Este documento registra los comportamientos confirmados por los requisitos originales y las ocho aclaraciones aprobadas por el responsable del proyecto. Autoriza la planificación junto con `spec.md`, no la implementación.

## Contexto

HU-002 incorpora un ciclo sobre el temporizador aprobado en HU-001. El temporizador existente controla una sola duración y, al llegar a cero, queda detenido en `00:00`; todavía no identifica tipos de fase, no selecciona la siguiente duración y no mantiene un contador de Pomodoros.

La especificación debe añadir esos conceptos sin cambiar el funcionamiento aprobado de inicio, pausa, reanudación y reinicio.

## Decisiones respaldadas por el enunciado

### DEC-001: Reutilización del temporizador de HU-001

- **Estado:** Aprobada.
- **Contexto:** HU-001 ya está implementada, probada y aprobada.
- **Requisitos relacionados:** SPEC-002-R12-R15.
- **Decisión:** Cada fase del ciclo utilizará el temporizador y las reglas de control aprobadas en HU-001.
- **Consecuencias:** HU-002 solo agrega la identidad de fase, el progreso del ciclo y las transiciones causadas por una finalización; no redefine inicio, pausa, reanudación ni reinicio.

### DEC-002: Inicio manual de cada fase

- **Estado:** Aprobada.
- **Contexto:** Al terminar una fase, el usuario debe poder iniciar la siguiente.
- **Requisitos relacionados:** SPEC-002-R12-R14.
- **Decisión:** Toda transición deja la siguiente fase detenida, con su duración completa y pendiente de que el usuario seleccione `Iniciar`.
- **Consecuencias:** Ningún descanso ni estudio comienza automáticamente.

### DEC-003: Selección del descanso

- **Estado:** Aprobada.
- **Contexto:** El tipo de descanso depende del progreso del ciclo.
- **Requisitos relacionados:** SPEC-002-R04-R07.
- **Decisión:** Un estudio completado prepara un descanso corto si todavía no alcanza la cantidad requerida; si la alcanza, prepara un descanso largo. La cantidad predeterminada es cuatro Pomodoros y HU-005 permite configurar otro entero positivo.
- **Consecuencias:** La selección depende del número de estudios completados, no del número de descansos ni de las acciones de control del temporizador. HU-002 no incorpora una interfaz para cambiar la cantidad.

### DEC-004: Reinicio del contador del ciclo

- **Estado:** Aprobada.
- **Contexto:** El requisito original ordena reiniciar el contador al completar la cantidad requerida y la aclaración define el momento observable del reinicio.
- **Requisitos relacionados:** SPEC-002-R07 y SPEC-002-R10.
- **Decisión:** Al preparar el descanso largo, conservar el contador en `N de N` durante todo ese descanso. Cuando el descanso largo termine, reiniciar el contador a `0 de N` y preparar el estudio del siguiente ciclo.
- **Consecuencias:** Con el valor predeterminado, la pantalla muestra `Pomodoros completados: 4 de 4` durante el descanso largo y `Pomodoros completados: 0 de 4` al preparar el siguiente estudio. Con otra cantidad vigente muestra `N de N` y comienza el nuevo ciclo con la cantidad entonces configurada.

### DEC-005: Estudio después de cualquier descanso

- **Estado:** Aprobada.
- **Contexto:** Tanto el descanso corto como el largo deben conducir de nuevo al estudio.
- **Requisitos relacionados:** SPEC-002-R09-R11.
- **Decisión:** Completar cualquier descanso prepara una fase de estudio sin contabilizar un Pomodoro adicional.
- **Consecuencias:** El progreso solo cambia por la finalización de una fase de estudio.

### DEC-006: Finalización única y conservación de HU-001

- **Estado:** Aprobada.
- **Contexto:** El temporizador puede evaluar el estado cero en más de una actualización y las acciones de HU-001 no equivalen a completar una fase.
- **Requisitos relacionados:** SPEC-002-R05, SPEC-002-R08, SPEC-002-R11 y SPEC-002-R16.
- **Opciones consideradas:** Procesar cada observación de cero; procesar una sola transición por fase completada.
- **Decisión:** Procesar la finalización de cada fase exactamente una vez. Pausar, reanudar o reiniciar una fase con tiempo restante conserva su tipo y el contador.
- **Consecuencias:** Se evita duplicar Pomodoros o saltar fases y se mantiene la semántica aprobada de HU-001.

### DEC-007: Información mínima en la pantalla principal

- **Estado:** Aprobada.
- **Contexto:** El requisito original exige mostrar la fase y los Pomodoros completados.
- **Requisitos relacionados:** SPEC-002-R01-R03 y SPEC-002-R18.
- **Decisión:** La pantalla principal mostrará uno de los nombres exactos `Estudio`, `Descanso corto` o `Descanso largo`, junto con el texto accesible `Pomodoros completados: C de N`.
- **Consecuencias:** La fase y el progreso son verificables mediante texto y tecnología de asistencia, sin depender únicamente del color ni de indicadores gráficos.

### DEC-008: Operación local

- **Estado:** Aprobada.
- **Contexto:** Los ciclos son una función esencial y no pueden depender de servicios remotos.
- **Requisitos relacionados:** SPEC-002-R17.
- **Decisión:** La selección de fases y el contador funcionarán sin conexión a Internet.
- **Consecuencias:** HU-002 no introduce cuentas, solicitudes de red ni servicios remotos.

## Decisiones derivadas de las aclaraciones

### DEC-009: Aplicación futura de una nueva cantidad

- **Estado:** Aprobada.
- **Contexto:** HU-005 permitirá configurar la cantidad requerida después de implementar HU-002.
- **Opciones consideradas:** Aplicar el cambio inmediatamente; aplicarlo al ciclo siguiente.
- **Decisión:** Una cantidad modificada durante un ciclo se aplicará al ciclo siguiente, después de terminar el descanso largo actual. El ciclo en curso conserva la cantidad que tenía al comenzar.
- **Consecuencias:** El límite del ciclo en curso permanece estable y no se generan estados donde el progreso supere inesperadamente una cantidad nueva.

### DEC-010: Estado inicial

- **Estado:** Aprobada.
- **Contexto:** La aplicación necesita una primera fase observable cuando no existe progreso recuperado por HU-003.
- **Opciones consideradas:** Estudio con cero; descanso; otro estado inicial.
- **Decisión:** Preparar `Estudio` con `Pomodoros completados: 0 de N`, donde N es la cantidad recuperada/configurada o cuatro si no existe una cantidad utilizable, y esperar el inicio manual.
- **Consecuencias:** El primer uso comienza con una fase coherente con el temporizador de estudio aprobado en HU-001.

### DEC-011: Duraciones provisionales

- **Estado:** Aprobada.
- **Contexto:** HU-002 necesita una duración completa para cada fase antes de integrar la configuración de HU-005.
- **Opciones consideradas:** Posponer HU-002; usar valores provisionales; incorporar anticipadamente HU-005.
- **Decisión:** Usar provisionalmente 25 minutos para `Estudio`, 5 minutos para `Descanso corto` y 15 minutos para `Descanso largo`.
- **Consecuencias:** HU-002 puede verificarse sin implementar configuración. HU-005 reemplazará estos valores según sus propias reglas aprobadas.

### DEC-012: Sin omisión ni selección manual

- **Estado:** Aprobada.
- **Contexto:** Permitir elegir fases agregaría transiciones y reglas de conteo ausentes en el enunciado original.
- **Opciones consideradas:** Permitir omisión o selección; permitir únicamente iniciar la fase preparada.
- **Decisión:** Durante HU-002, el usuario no puede omitir una fase ni seleccionar manualmente otro tipo; solo puede controlar la fase preparada mediante HU-001.
- **Consecuencias:** El ciclo conserva una única siguiente fase determinista y no requiere reglas adicionales de conteo.

## Resolución de las preguntas

| Pregunta | Resolución | Decisión relacionada |
| --- | --- | --- |
| PEND-001 | Usar cuatro como predeterminado; permitir configurar otro entero positivo en HU-005 | DEC-003, DEC-009 |
| PEND-002 | Aplicar un cambio al siguiente ciclo | DEC-009 |
| PEND-003 | Iniciar en `Estudio` con cero Pomodoros | DEC-010 |
| PEND-004 | Usar provisionalmente 25, 5 y 15 minutos | DEC-011 |
| PEND-005 | Mostrar `4 de 4` durante el descanso largo y reiniciar al terminarlo | DEC-004 |
| PEND-006 | Usar `Estudio`, `Descanso corto` y `Descanso largo` | DEC-007 |
| PEND-007 | Mostrar `Pomodoros completados: C de N` | DEC-007 |
| PEND-008 | No permitir omisión ni selección manual durante HU-002 | DEC-012 |

## Cierre

- PEND-001 a PEND-008 están resueltas y trazadas a decisiones. La integración configurable con valor predeterminado cuatro se confirmó explícitamente el 2026-10-20.
- Los requisitos y criterios de `spec.md` incorporan las ocho respuestas.
- No quedan decisiones funcionales abiertas en el alcance actual.
- La especificación y estas decisiones fueron aprobadas explícitamente el 2026-10-19.
- La planificación está autorizada.
- La implementación requiere aprobación separada de `plan.md` y `tasks.md`.

## Enmienda de tamaño configurable

- **Estado:** Aprobada explícitamente por el responsable el 2026-10-20.
- **Decisión:** HU-005 puede cambiar el tamaño del ciclo a cualquier entero positivo; cuatro permanece como valor predeterminado. El ciclo en curso conserva su tamaño y el nuevo valor se aplica tras finalizar su descanso largo.
- **Alcance:** Se actualiza la especificación y la historia HU-002. No se alteran su transición, el inicio manual ni el comportamiento predeterminado implementado.
