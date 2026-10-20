# Especificación 005: Configuración de tiempos y tamaño del ciclo

## Estado

**Aprobada explícitamente el 2026-10-20 por el responsable del producto.** HU005-PRE-01 y HU005-PRE-02 están resueltas. La implementación se autoriza en el orden de `tasks.md`, comenzando por HU005-T01.

- Historia: `docs/historias/HU-005.md`.
- Historias relacionadas: `docs/historias/HU-001.md`, `HU-002.md` y `HU-003.md`.
- Enunciado y decisiones del responsable: 2026-10-20.
- Decisiones: `decisiones.md`.
- Constitución: `docs/constitution.md`.

## Objetivo y actor

Como estudiante de Academia Cotopaxi, el usuario configura y conserva localmente las duraciones de las fases y el tamaño del ciclo Pomodoro. La configuración se valida como conjunto, se recupera localmente y se aplica sin alterar una fase ya preparada ni el ciclo que está en curso.

## Trazabilidad y alcance

- HU-005 configura estudio, descanso corto, descanso largo y cantidad de Pomodoros por ciclo.
- Valores predeterminados: 25 minutos, 5 minutos, 15 minutos y 4 Pomodoros.
- Los cuatro valores configurables son enteros positivos; no se inventan límites máximos.
- La fase actual conserva su duración; las nuevas duraciones se usan cuando se prepara una fase posterior.
- El tamaño del ciclo actual se conserva hasta terminar su descanso largo; el tamaño más reciente se usa en el siguiente ciclo.
- La persistencia es local. Configuración ausente, dañada, incompleta o incompatible usa valores predeterminados. Los errores de lectura/escritura se notifican sin bloquear la aplicación.
- HU-002 mantiene sus transiciones e inicio manual, parametriza la cantidad del ciclo y conserva cuatro como predeterminado.
- Se conservan HU-001 y HU-003 y la implementación existente de HU-004. Esta especificación no autoriza cambios de código a esas historias.

## Contradicciones y resolución aprobada

- **Enunciado original:** describe el descanso largo cada cuatro Pomodoros y HU-002 establece grupos fijos de cuatro. **Regla confirmada el 2026-10-20:** HU-005 permite otro entero positivo; cuatro es el valor predeterminado y el cambio se aplica desde el siguiente ciclo completo. HU-002 y su especificación se actualizan para reflejar esta regla. El comportamiento con valor 4 permanece igual.
- **Decisión anterior DEC-005-03:** una fase siguiente ya preparada adoptaría inmediatamente una duración nueva. **Regla confirmada el 2026-10-20:** la fase ya preparada conserva su duración hasta terminar; la duración nueva se aplica al preparar la fase posterior. DEC-005-07 sustituye la regla anterior.
- **Comportamiento de almacenamiento no definido previamente:** el responsable confirmó el uso de valores predeterminados ante registro ausente/dañado/incompleto/incompatible y aviso no bloqueante ante error de lectura/escritura. Un error de lectura no ocasiona sobrescritura automática.

## Requisitos EARS

### Modelo y validación

- **HU-005-R01 (ubícuo):** La aplicación deberá permitir configurar por separado las duraciones de estudio, descanso corto y descanso largo, expresadas en minutos.
- **HU-005-R02 (ubícuo):** La aplicación deberá permitir configurar la cantidad de Pomodoros de estudio que forma un ciclo.
- **HU-005-R03 (ubícuo):** Cuando no exista una configuración utilizable, la aplicación deberá usar 25 minutos de estudio, 5 minutos de descanso corto, 15 minutos de descanso largo y 4 Pomodoros por ciclo.
- **HU-005-R04 (dirigido por evento):** Cuando el usuario intente guardar la configuración, la aplicación deberá validar todos los campos como enteros positivos antes de persistir cualquier cambio.
- **HU-005-R05 (comportamiento no deseado):** Si un campo es inválido o falta, la aplicación no deberá guardar el conjunto incompleto ni reemplazar una configuración válida y deberá identificar los campos que requieren corrección de forma accesible.

### Persistencia y recuperación

- **HU-005-R06 (dirigido por evento):** Cuando el usuario guarde una configuración válida y completa, la aplicación deberá conservarla localmente como un solo conjunto.
- **HU-005-R07 (dirigido por evento):** Cuando la aplicación se abra y encuentre una configuración guardada válida y completa, deberá recuperarla y utilizarla.
- **HU-005-R08 (comportamiento no deseado):** Si la configuración guardada está ausente, dañada, incompleta o es incompatible, la aplicación deberá usar los valores predeterminados.
- **HU-005-R09 (comportamiento no deseado):** Si ocurre un error al leer la configuración, la aplicación deberá mostrar un mensaje claro, usar los valores predeterminados y continuar disponible sin sobrescribir automáticamente los datos guardados.
- **HU-005-R15 (comportamiento no deseado):** Si falla el guardado, la aplicación deberá mostrar un mensaje claro, conservar la configuración válida anterior como vigente y persistida, y no comunicar éxito.
- **HU-005-R16 (dependiente de estado):** Mientras el dispositivo no tenga conexión a Internet, la consulta, validación, persistencia, recuperación y restauración de la configuración deberán funcionar localmente.

### Aplicación en fases y ciclos

- **HU-005-R10 (dependiente de estado):** Mientras una fase esté preparada, en ejecución o pausada, guardar otra configuración no deberá modificar su duración ni su tiempo restante.
- **HU-005-R11 (dirigido por evento):** Cuando se prepare una fase posterior después de guardar duraciones válidas, la aplicación deberá asignarle la duración configurada para su tipo y conservar el inicio manual de HU-002.
- **HU-005-R12 (dependiente de estado):** Mientras un ciclo esté en curso, la aplicación deberá conservar la cantidad requerida vigente aunque se guarde una cantidad diferente.
- **HU-005-R13 (dirigido por evento):** Cuando termine el descanso largo del ciclo vigente, la aplicación deberá aplicar la cantidad configurada más recientemente al ciclo siguiente.
- **HU-005-R14 (dirigido por evento):** Cuando el usuario solicite restaurar los valores predeterminados, la aplicación deberá pedir confirmación y, si se confirma, guardar 25/5/15 minutos y 4 Pomodoros.

## Criterios de aceptación

### HU-005-CA01: Valores predeterminados

**Dado** que la configuración guardada está ausente, dañada, incompleta o es incompatible,
**Cuando** la aplicación obtiene la configuración,
**Entonces** usa 25 minutos para estudio, 5 minutos para descanso corto, 15 minutos para descanso largo y 4 Pomodoros por ciclo.

### HU-005-CA02: Guardado y recuperación válidos

**Dado** que los cuatro campos contienen enteros positivos,
**Cuando** el usuario guarda la configuración y vuelve a abrir la aplicación,
**Entonces** la aplicación persiste y recupera el conjunto completo localmente.

### HU-005-CA03: Rechazo de conjunto inválido

**Dado** que al menos un campo falta o contiene cero, un número negativo, un decimal o un valor no entero,
**Cuando** el usuario intenta guardar,
**Entonces** no se persiste el conjunto, no se reemplaza una configuración válida y se identifican de forma accesible los campos que deben corregirse.

### HU-005-CA04: Fase actual inmutable

**Dado** que una fase está preparada, en ejecución o pausada y se guarda una duración nueva,
**Cuando** la fase actual continúa o comienza,
**Entonces** conserva la duración y el tiempo restante que tenía antes del cambio.

### HU-005-CA05: Duración aplicada a fase posterior

**Dado** que una duración nueva se guarda durante una fase ya preparada o en curso,
**Cuando** esa fase termina y se prepara la siguiente,
**Entonces** la fase siguiente usa la duración nueva de su tipo y permanece detenida hasta el inicio manual.

### HU-005-CA06: Nuevo tamaño desde el siguiente ciclo

**Dado** que se guarda un tamaño distinto durante un ciclo,
**Cuando** el ciclo completa su tamaño vigente y termina el descanso largo,
**Entonces** el ciclo vigente conserva su tamaño anterior y el siguiente comienza con el nuevo tamaño.

### HU-005-CA07: Restauración confirmada o cancelada

**Dado** que existe una configuración personalizada,
**Cuando** el usuario solicita restaurar los valores predeterminados,
**Entonces** la aplicación solicita confirmación; si se confirma, guarda 25/5/15 y 4, y si se cancela, conserva los valores personalizados.

### HU-005-CA08: Registro almacenado no utilizable

**Dado** que existe un registro ausente, dañado, incompleto o incompatible,
**Cuando** la aplicación obtiene la configuración,
**Entonces** utiliza los cuatro valores predeterminados y no interpreta campos parciales como una configuración válida.

### HU-005-CA09: Falla de lectura

**Dado** que falla la lectura del almacenamiento local,
**Cuando** la aplicación intenta recuperar la configuración,
**Entonces** muestra un mensaje claro, usa los valores predeterminados, continúa disponible y no sobrescribe automáticamente el registro.

### HU-005-CA10: Falla de escritura

**Dado** que existe una configuración válida y falla el guardado de un cambio,
**Cuando** la aplicación intenta persistirlo,
**Entonces** muestra un mensaje claro, conserva vigente y persistida la configuración válida anterior y no comunica éxito.

### HU-005-CA11: Operación offline

**Dado** que el dispositivo no tiene conexión a Internet,
**Cuando** el usuario consulta, valida, guarda o restaura la configuración,
**Entonces** el comportamiento funcional es el mismo que con conexión.

## Dependencias y fuera de alcance

- HU-001 determina controles y estados de temporizador; sus reglas no se redefinen.
- HU-002 determina transiciones e inicio manual; solo se parametriza el tamaño del ciclo conforme a DEC-005-02.
- HU-003 determina la conservación del estado de sesión; la configuración no debe reemplazar ni invalidar esos datos.
- HU-004 y su implementación de notificaciones/alarmas se conservan.
- No se introducen cuentas, servicios remotos, permisos, dependencias ni cambios de identidad visual.
- La selección manual u omisión de fases continúa fuera de alcance.

## Estrategia de verificación aprobada

- Probar cada valor predeterminado, incluida la cantidad 4, ante configuración ausente, dañada, incompleta e incompatible.
- Verificar enteros positivos y rechazar cero, negativos, decimales, vacíos y valores no enteros en cualquier campo.
- Verificar que el conjunto completo y válido persiste y se recupera después de reabrir.
- Simular errores de lectura y escritura; comprobar aviso claro, continuidad, ausencia de sobrescritura por lectura fallida y conservación del último valor válido ante escritura fallida.
- Con reloj controlado, guardar una duración durante una fase preparada, en ejecución y pausada; verificar que la fase actual conserva duración y tiempo restante, y que la posterior recibe el valor nuevo sin inicio automático.
- Guardar otra cantidad durante el ciclo; verificar el tamaño vigente hasta terminar el descanso largo y el tamaño nuevo en el ciclo posterior.
- Verificar confirmación y cancelación de restauración.
- Repetir las verificaciones sin conexión.
- Ejecutar regresión de HU-001 a HU-004; comprobar que el comportamiento predeterminado de HU-002 sigue siendo cuatro y que la implementación existente de HU-004 no cambia.

## Matriz de trazabilidad

| Requisito | Origen/decisión | Criterios |
| --- | --- | --- |
| R01–R02 | Enunciado HU-005; DEC-005-02 | CA02–CA03 |
| R03, R08 | DEC-005-04 y DEC-005-06 | CA01, CA08 |
| R04–R05 | DEC-005-01 | CA03 |
| R06–R07 | Persistencia local aprobada | CA02 |
| R09, R15 | DEC-005-04 | CA09–CA10 |
| R10–R11 | DEC-005-07 | CA04–CA05 |
| R12–R13 | DEC-005-02; DEC-009 de HU-002 | CA06 |
| R14 | DEC-005-05 y DEC-005-06 | CA07 |
| R16 | Constitución, operación local | CA11 |

## Resultado de revisión y aprobación

- HU005-PRE-01: resuelta mediante DEC-005-02; la historia y especificación HU-002 se armonizan.
- HU005-PRE-02: resuelta mediante DEC-005-04.
- Contradicciones con el enunciado original: descritas explícitamente arriba y en `decisiones.md`.
- Requisitos funcionales abiertos: ninguno identificado en el alcance de esta revisión.
- HU-005 y su enmienda relacionada con HU-002: Revisadas y aprobadas explícitamente el 2026-10-20.
- Especificación: Revisada y aprobada explícitamente por el responsable el 2026-10-20.
- Plan y tareas: Aprobados explícitamente por el responsable el 2026-10-20.
- Implementación: Autorizada secuencialmente según `tasks.md`; HU005-T01 es la primera tarea autorizada.
- Estado de implementación: No iniciada.
