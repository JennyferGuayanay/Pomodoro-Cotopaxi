# Decisiones: HU-005, configuración de tiempos y ciclo

## Estado

**Decisiones funcionales y puerta SDD aprobadas.** El responsable del producto aprobó explícitamente HU-005, la enmienda de HU-002 y la especificación, el plan y las tareas el 2026-10-20. Autorizó la implementación secuencial desde HU005-T01, sujeta al alcance y las dependencias aprobados.

- Historia: `docs/historias/HU-005.md`.
- Historias relacionadas: HU-001, HU-002 y HU-003; HU-004 se conserva sin cambios.
- Fecha de revisión: 2026-10-20.
- Responsable: responsable del producto.

## Contexto observado

- El temporizador y el ciclo implementan actualmente las duraciones 25/5/15 minutos y cuatro Pomodoros por ciclo.
- El almacenamiento de sesión existente incluye el objetivo del ciclo.
- AsyncStorage ya está declarado en el proyecto y actualmente no existe una ruta de configuración.

Estos son hallazgos técnicos de referencia, no requisitos adicionales ni autorización para modificar código. La implementación de HU-004 debe conservarse.

## Decisiones

### DEC-005-01: Validación de entradas

- **Estado:** Aprobada el 2026-10-20.
- **Contexto y requisitos:** HU-005-R04 y HU-005-R05; los campos deben validarse antes de guardar.
- **Opciones consideradas:** permitir fracciones/unidades menores o enteros positivos; establecer o no límites máximos.
- **Decisión:** Las tres duraciones se expresan en minutos y el tamaño del ciclo en Pomodoros. Los cuatro valores deben ser enteros positivos. No se inventan límites máximos.
- **Consecuencias:** Cero, negativos, decimales, campos vacíos y otros valores no enteros se rechazan. La validación se realiza sobre el conjunto completo y reporta los campos que requieren corrección. Un conjunto inválido o incompleto no reemplaza una configuración válida.
- **Documentos afectados:** historia HU-005, `spec.md`, `plan.md` y `tasks.md`.

### DEC-005-02: Cantidad configurable de Pomodoros

- **Estado:** Aprobada el 2026-10-20; resuelve HU005-PRE-01.
- **Contexto y requisitos:** El enunciado original de HU-005 y la especificación de HU-002 describían grupos fijos de cuatro, mientras la instrucción actual permite configurar otro tamaño.
- **Opciones consideradas:** mantener cuatro como valor fijo; permitir configurar un entero positivo con cuatro como valor inicial.
- **Decisión:** HU-005 permite configurar cualquier entero positivo como cantidad de Pomodoros por ciclo. El valor predeterminado y restaurado es cuatro.
- **Aplicación temporal:** La cantidad vigente no cambia durante un ciclo ya iniciado. Una cantidad guardada se aplica al siguiente ciclo, una vez completado el descanso largo del ciclo en curso.
- **Consecuencias:** Se actualizan la historia y la especificación de HU-002 para parametrizar el tamaño del ciclo y conservar cuatro como predeterminado. La conducta implementada con el tamaño predeterminado de cuatro permanece igual. La edición del objetivo corresponde a HU-005, no añade controles manuales de fase a HU-002.
- **Documentos afectados:** `docs/historias/HU-002.md`, `specs/002-ciclo-estudio-descanso/spec.md`, esta historia, `spec.md`, `plan.md` y `tasks.md`.

### DEC-005-03: Fase preparada y nuevas duraciones

- **Estado:** Sustituida el 2026-10-20 por DEC-005-07.
- **Decisión anterior:** La fase siguiente ya preparada adoptaba inmediatamente la nueva duración.
- **Motivo de sustitución:** Contradecía la instrucción posterior del responsable de conservar la duración de una fase ya preparada.
- **Registro:** No usar la decisión anterior para requisitos, plan, tareas o implementación de HU-005.

### DEC-005-04: Ausencia, corrupción y errores de lectura/escritura

- **Estado:** Aprobada el 2026-10-20; resuelve HU005-PRE-02.
- **Contexto y requisitos:** HU-005-R03, R06–R10 y R15; distinguir configuración ausente/inválida de errores de almacenamiento y evitar reemplazos parciales.
- **Opciones consideradas:** tratar datos inválidos como ausencia o bloquear; ante errores de almacenamiento, continuar con aviso o bloquear la aplicación.
- **Decisión:** Si el registro está ausente, dañado, incompleto o es incompatible, se usan los valores predeterminados 25/5/15 minutos y cuatro Pomodoros. Si falla la lectura, se informa claramente, se usan los predeterminados y la aplicación sigue disponible. No se sobrescribe automáticamente el registro como consecuencia de una lectura fallida.
- **Decisión de escritura:** Si falla el guardado, se informa claramente, la configuración válida anterior sigue siendo la vigente y persistida, y no se comunica éxito. La configuración se valida y guarda como conjunto completo; datos incompletos no reemplazan una configuración válida.
- **Consecuencias:** No se bloquea la aplicación por errores de configuración. La recuperación por valores predeterminados no implica guardar automáticamente esos valores. Una persistencia posterior requiere una acción válida de guardado o restauración.
- **Documentos afectados:** historia HU-005, `spec.md`, `plan.md` y `tasks.md`.

### DEC-005-05: Confirmación para restaurar

- **Estado:** Aprobada el 2026-10-20.
- **Contexto y requisitos:** HU-005-R14; restaurar reemplaza valores personalizados.
- **Opciones consideradas:** restauración inmediata o confirmación previa.
- **Decisión:** El usuario inicia la restauración mediante un control y debe confirmarla antes de guardar los valores predeterminados: 25/5/15 minutos y cuatro Pomodoros.
- **Consecuencias:** Cancelar conserva la configuración personalizada. Un error de escritura sigue DEC-005-04. La confirmación debe ser accesible.
- **Documentos afectados:** historia HU-005, `spec.md`, `plan.md` y `tasks.md`.

### DEC-005-06: Valores predeterminados

- **Estado:** Aprobada el 2026-10-20.
- **Contexto y requisitos:** HU-005-R03, R08 y R14.
- **Decisión:** Estudio: 25 minutos; descanso corto: 5 minutos; descanso largo: 15 minutos; tamaño de ciclo: 4 Pomodoros.
- **Consecuencias:** Los valores rigen tanto ante ausencia de configuración utilizable como después de una restauración confirmada. El tamaño 4 es predeterminado, no un límite fijo.
- **Documentos afectados:** historia HU-005, historia y especificación HU-002, `spec.md`, `plan.md` y `tasks.md`.

### DEC-005-07: Frontera de aplicación de duraciones

- **Estado:** Aprobada el 2026-10-20; sustituye DEC-005-03.
- **Contexto y requisitos:** HU-005-R10 y R11; resolver qué ocurre si se guarda una duración nueva cuando la fase actual ya está preparada.
- **Opciones consideradas:** actualizar la duración de la fase ya preparada; conservarla y aplicar el cambio a la fase posterior.
- **Decisión:** La fase actual conserva su duración y tiempo restante, esté preparada, en ejecución o pausada. Si ya estaba preparada al guardar, mantiene esa duración hasta que termine. Las duraciones nuevas se aplican al preparar la fase posterior, que sigue requiriendo inicio manual.
- **Consecuencias:** Guardar o restaurar no modifica la duración de una fase ya preparada. La nueva duración se observa desde la siguiente transición de fase.
- **Documentos afectados:** historia HU-005, `spec.md`, `plan.md` y `tasks.md`.

## Contradicciones con el enunciado original

1. **Tamaño del ciclo:** El enunciado original menciona cuatro Pomodoros como frecuencia fija del descanso largo y HU-002 estaba especificada para cuatro. La instrucción del responsable del 2026-10-20 autoriza expresamente configurar otro entero positivo, con cuatro como predeterminado y aplicación desde el ciclo posterior. DEC-005-02 resuelve la contradicción y obliga a armonizar HU-002 documentalmente.
2. **Fase preparada:** La regla previa DEC-005-03 disponía que una fase siguiente ya preparada recibiera la duración nueva. La instrucción del responsable y su aclaración del 2026-10-20 establecen que esa fase conserva su duración. DEC-005-07 sustituye la regla anterior.
3. **Recuperación de configuración:** Los documentos previos no resolvían registros dañados/incompletos ni errores de lectura. DEC-005-04 establece valores predeterminados, aviso no bloqueante y ausencia de sobrescritura automática tras fallo de lectura.

## Resolución de tareas habilitantes

| Tarea | Resultado | Evidencia |
| --- | --- | --- |
| HU005-PRE-01 | Completada y revisada | DEC-005-02 y actualización documental de HU-002, su especificación y trazabilidad |
| HU005-PRE-02 | Completada y revisada | DEC-005-04 y criterios de fallback, aviso y conservación en `spec.md` |

## Puerta SDD

- Decisiones funcionales pendientes: Ninguna dentro del alcance descrito.
- HU-005 y la enmienda de HU-002: Aprobadas explícitamente por el responsable el 2026-10-20.
- Especificación HU-005: Aprobada explícitamente por el responsable el 2026-10-20.
- Plan HU-005 y tareas: Aprobados explícitamente por el responsable el 2026-10-20.
- Implementación: Autorizada secuencialmente; HU005-T01 es la primera tarea y queda autorizada para comenzar.
- No se ha iniciado implementación en esta actualización documental.
