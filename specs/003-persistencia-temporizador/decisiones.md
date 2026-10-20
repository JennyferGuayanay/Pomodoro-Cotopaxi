# Decisiones de especificación: 003-persistencia-temporizador

## Estado

**Borrador. Contiene decisiones respaldadas por los requisitos originales y decisiones pendientes de aprobación.**

- Historia de origen: `docs/historias/HU-003.md`.
- Especificación: `specs/003-persistencia-temporizador/spec.md`.
- Dependencias funcionales: HU-001 y HU-002 aprobadas e implementadas.
- Constitución aplicable: `docs/constitution.md`.
- Fecha de registro: 2026-10-19.
- Responsable de aprobación: Pendiente.

Este documento no autoriza planificación, instalación de dependencias ni implementación.

## Contexto revisado

- El temporizador aprobado representa una ejecución mediante una marca absoluta `endsAtMs` y calcula el restante contra el reloj actual; el intervalo visual no es su fuente de verdad.
- Los estados actuales del temporizador son detenido, en ejecución, pausado y confirmación de reinicio.
- El ciclo mantiene la fase actual, los Pomodoros completados y la cantidad requerida, y prepara manualmente la siguiente fase después de una finalización.
- El estado del temporizador y del ciclo vive actualmente solo en memoria.
- `package.json` no contiene una dependencia directa de persistencia local. La selección de un mecanismo compatible con Expo SDK 58 corresponde a una planificación posterior y no se decide en esta especificación.

## Decisiones respaldadas por los requisitos originales

### DEC-001: Fuente del tiempo durante una ejecución

- **Estado:** Propuesta para aprobación.
- **Contexto:** Los requisitos originales exigen descontar el tiempo transcurrido durante un bloqueo o cierre.
- **Requisitos relacionados:** SPEC-003-R03, SPEC-003-R04 y SPEC-003-R08.
- **Opciones consideradas:** Persistir cada tick; persistir el tiempo restante al salir; conservar una marca temporal de finalización.
- **Decisión propuesta:** Una fase en ejecución se recuperará calculando `máximo(0, marca de finalización - hora actual)`. Los ticks o intervalos de pantalla no serán la fuente de verdad.
- **Consecuencias:** No es necesario ejecutar una cuenta regresiva continua con la aplicación inactiva; la exactitud depende de una referencia temporal válida.
- **Responsable y fecha de aprobación:** Pendientes.

### DEC-002: Estado mínimo que debe poder recuperarse

- **Estado:** Propuesta para aprobación.
- **Contexto:** Recuperar solo el tiempo perdería la fase o el progreso de HU-002.
- **Requisitos relacionados:** SPEC-003-R01, SPEC-003-R02 y SPEC-003-R07.
- **Opciones consideradas:** Conservar solo el tiempo; conservar temporizador y ciclo; conservar toda la interfaz.
- **Decisión propuesta:** Conservar localmente la información necesaria para reconstruir la fase actual, el progreso y límite del ciclo, la duración de la fase, el estado del temporizador y su referencia temporal aplicable. No se conservará estado visual derivable.
- **Consecuencias:** La recuperación preserva HU-001 y HU-002 sin acoplar la persistencia a detalles de presentación.
- **Responsable y fecha de aprobación:** Pendientes.

### DEC-003: Finalización durante la ausencia

- **Estado:** Propuesta para aprobación.
- **Contexto:** Un temporizador puede vencer mientras el dispositivo está bloqueado o la aplicación fue retirada de recientes.
- **Requisitos relacionados:** SPEC-003-R09, SPEC-003-R10 y SPEC-003-R11.
- **Opciones consideradas:** Mostrar la fase vencida en cero; aplicar la transición aprobada de HU-002; avanzar automáticamente por varias fases.
- **Decisión propuesta:** Al recuperar una fase en ejecución cuyo vencimiento ya ocurrió, registrar su finalización exactamente una vez y aplicar una sola transición de HU-002. La fase resultante quedará detenida con su duración completa y pendiente de inicio manual.
- **Consecuencias:** No se encadenan fases durante la ausencia y no se duplica el progreso al volver a evaluar el estado.
- **Responsable y fecha de aprobación:** Pendientes.

### DEC-004: Recuperación de una pausa

- **Estado:** Propuesta para aprobación.
- **Contexto:** El cuarto requisito original exige mantener una pausa sin descontar tiempo ni recibir avisos.
- **Requisitos relacionados:** SPEC-003-R05, SPEC-003-R06 y SPEC-003-R12.
- **Opciones consideradas:** Descontar la ausencia; reiniciar la fase; conservar el restante exacto de la pausa.
- **Decisión propuesta:** Una fase pausada conservará la misma fase, progreso y tiempo restante registrado al pausar, independientemente de la duración de la ausencia. No producirá una finalización ni solicitará avisos de fase terminada mientras siga pausada.
- **Consecuencias:** La reanudación posterior seguirá las reglas de HU-001 y los avisos efectivos continuarán perteneciendo a HU-004.
- **Responsable y fecha de aprobación:** Pendientes.

### DEC-005: Significado verificable de cerrar la aplicación

- **Estado:** Propuesta para aprobación.
- **Contexto:** El requisito original identifica expresamente el cierre desde las aplicaciones recientes.
- **Requisitos relacionados:** SPEC-003-R01, SPEC-003-R07 y SPEC-003-R08.
- **Opciones consideradas:** Solo navegación fuera de pantalla; retirar la aplicación de recientes; incluir además forzar detención, reinicio y reinstalación.
- **Decisión propuesta:** Para los criterios obligatorios de HU-003, cerrar significa retirar la aplicación desde la vista de aplicaciones recientes y abrirla nuevamente.
- **Consecuencias:** Otros tipos de terminación requieren la aclaración PEND-005 antes de incorporarse al alcance verificable.
- **Responsable y fecha de aprobación:** Pendientes.

### DEC-006: Operación local

- **Estado:** Propuesta para aprobación.
- **Contexto:** La recuperación es una función esencial y la constitución exige funcionamiento offline.
- **Requisitos relacionados:** SPEC-003-R13.
- **Opciones consideradas:** Persistencia local; servicio remoto; combinación de ambos.
- **Decisión propuesta:** La conservación, lectura y reconciliación del estado se realizarán localmente y producirán el mismo resultado sin conexión a Internet.
- **Consecuencias:** HU-003 no introduce cuentas, solicitudes de red, telemetría ni sincronización remota.
- **Responsable y fecha de aprobación:** Pendientes.

## Decisiones pendientes

### PEND-001: Tolerancia temporal de recuperación

- **Estado:** [NECESITA ACLARACIÓN].
- **Contexto:** La historia exige mostrar el tiempo correcto, pero no define una tolerancia medible para pruebas manuales.
- **Opciones consideradas:** Coincidencia exacta en milisegundos; diferencia máxima de un segundo visible; otra tolerancia indicada por el responsable.
- **Recomendación:** Aceptar como máximo un segundo de diferencia en el valor visible `MM:SS`, manteniendo el redondeo aprobado en HU-001.
- **Pregunta:** ¿Qué tolerancia se acepta entre el tiempo esperado y el tiempo mostrado al recuperar una ejecución?

### PEND-002: Cambios del reloj del dispositivo

- **Estado:** [NECESITA ACLARACIÓN].
- **Contexto:** Una marca de finalización comparada con el reloj del dispositivo puede alterarse si el usuario cambia manualmente la fecha u hora. Un cambio de zona horaria por sí solo no modifica una marca absoluta, pero un ajuste del reloj sí.
- **Opciones consideradas:** Aceptar el reloj del sistema como autoridad; detectar saltos y adoptar un estado seguro; usar una referencia adicional cuando la plataforma lo permita.
- **Recomendación:** Usar el reloj del sistema como autoridad para el alcance inicial y tratar los cambios manuales como una limitación documentada.
- **Pregunta:** ¿Debe HU-003 detectar o corregir cambios manuales de fecha u hora mientras la aplicación está ausente?

### PEND-003: Estado seguro ante datos ausentes o inválidos

- **Estado:** [NECESITA ACLARACIÓN].
- **Contexto:** La aplicación no debe bloquearse ni presentar tiempos negativos, pero el estado de recuperación no está definido.
- **Opciones consideradas:** Crear el estado inicial `Estudio`, `0 de 4`, detenido en `25:00`; mostrar un error y esperar acción; conservar parcialmente los campos válidos.
- **Recomendación:** Descartar el registro completo e iniciar en el estado inicial aprobado de HU-002, evitando combinar datos parciales incompatibles.
- **Pregunta:** ¿Qué estado debe adoptar la aplicación cuando no existe información persistida o esta es inválida, incompleta o incompatible?

### PEND-004: Cierre durante la confirmación de reinicio

- **Estado:** [NECESITA ACLARACIÓN].
- **Contexto:** HU-001 suspende el tiempo mientras el diálogo está abierto, pero HU-003 no indica qué recuperar si la aplicación se cierra en ese momento.
- **Opciones consideradas:** Restaurar la confirmación; recuperar como pausada; cancelar implícitamente y restaurar el estado anterior.
- **Recomendación:** Recuperar como pausada con el tiempo suspendido, sin mostrar automáticamente un diálogo obsoleto.
- **Pregunta:** ¿Qué estado debe recuperarse si la aplicación se cierra con la confirmación de reinicio abierta?

### PEND-005: Otras formas de terminación

- **Estado:** [NECESITA ACLARACIÓN].
- **Contexto:** El enunciado menciona retirar la aplicación de recientes, pero Android también puede terminar el proceso, el usuario puede forzar la detención o el dispositivo puede reiniciarse.
- **Opciones consideradas:** Limitarse a retirar de recientes; incluir terminación del proceso por Android; incluir además forzar detención y reinicio del dispositivo.
- **Recomendación:** Incluir la terminación del proceso por Android por ser indistinguible para la recuperación, y dejar forzar detención y reinicio del dispositivo fuera del criterio obligatorio inicial.
- **Pregunta:** ¿Qué formas adicionales de terminación deben formar parte del alcance y de las pruebas de aceptación?

## Asuntos delimitados

- El envío de notificación, sonido o vibración cuando una fase en ejecución vence durante la ausencia pertenece a HU-004.
- Desinstalar la aplicación o borrar sus datos elimina la persistencia local y queda fuera de HU-003.
- La selección de biblioteca, formato físico, clave de almacenamiento y estrategia de migración pertenece al plan posterior.
- HU-003 no cambia duraciones, cantidad objetivo, secuencia de fases, controles ni textos aprobados en HU-001 y HU-002.

## Condición para aprobación

- Resolver PEND-001 a PEND-005.
- Confirmar las decisiones DEC-001 a DEC-006.
- Actualizar `spec.md` con las resoluciones antes de cambiar su estado de borrador.

## Resolución de decisiones pendientes — HU-003

- PEND-001: Aprobada. Se permite una diferencia máxima de 1 segundo visible en formato MM:SS al recuperar el temporizador.
- PEND-002: Aprobada. Se utiliza el reloj del sistema; los cambios manuales de fecha u hora quedan documentados como limitación.
- PEND-003: Aprobada. Si no existen datos válidos, se restablece el estado inicial: Estudio, 0 de 4 Pomodoros, detenido y 25:00 (o duración configurada válida).
- PEND-004: Aprobada. Si la aplicación se cierra durante una confirmación de reinicio, se recupera pausada con el tiempo suspendido, sin reabrir el diálogo.
- PEND-005: Aprobada. Se incluye recuperar la sesión cuando Android termina el proceso. La detención forzada y el reinicio del dispositivo quedan fuera de las pruebas obligatorias.

Se aprueban DEC-001 a DEC-006 en los términos propuestos, siempre que respeten los requisitos originales de HU-003. Las resoluciones anteriores sustituyen las marcas [NECESITA ACLARACIÓN] correspondientes.
