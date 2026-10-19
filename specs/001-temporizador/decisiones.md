# Decisiones de especificación: 001-temporizador

## Estado

**Aprobadas como parte de la especificación 001.**

- Historia de origen: `docs/historias/HU-001.md`.
- Constitución aplicable: `docs/constitution.md`.
- Fecha de registro: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.
- Fecha de aprobación: 2026-10-19.

Estas decisiones fueron aprobadas explícitamente junto con `spec.md` y autorizan la planificación, no la implementación.

## Contexto

HU-001 requiere controlar una fase del temporizador mediante inicio, pausa, reanudación y reinicio con confirmación. Esta revisión contrastó la especificación con los cuatro escenarios originales indicados y sus decisiones fueron aprobadas explícitamente.

## Decisiones propuestas

### DEC-001: Duración usada al iniciar

- **Estado:** Aprobada.
- **Contexto:** El temporizador necesita un valor inicial verificable.
- **Requisitos relacionados:** HU-001-R02; SPEC-001-R02 y SPEC-001-R03.
- **Opciones consideradas:** Usar siempre 25 minutos; usar la duración configurada; solicitar una duración al iniciar.
- **Decisión:** Iniciar desde la duración configurada para la fase. Si no existe una configuración válida, usar el valor predeterminado de 25 minutos para estudio.
- **Consecuencias:** HU-001 consume la configuración definida por HU-005 y no permite editarla dentro de este alcance.
- **Aprobación:** 2026-10-19.

### DEC-002: Pausa

- **Estado:** Aprobada.
- **Contexto:** La pausa debe evitar pérdida de progreso.
- **Requisitos relacionados:** HU-001-R03 y HU-001-R08; SPEC-001-R04 y SPEC-001-R05.
- **Opciones consideradas:** Conservar el tiempo restante; volver a la duración completa.
- **Decisión:** Al pausar una fase en ejecución, detener el descuento y conservar el tiempo restante.
- **Consecuencias:** El tiempo restante debe permanecer estable mientras la fase continúe pausada.
- **Aprobación:** 2026-10-19.

### DEC-003: Reanudación

- **Estado:** Aprobada.
- **Contexto:** Reanudar debe continuar el trabajo ya realizado.
- **Requisitos relacionados:** HU-001-R04; SPEC-001-R06.
- **Opciones consideradas:** Continuar desde el tiempo restante; reiniciar desde la duración completa.
- **Decisión:** Reanudar desde el tiempo restante conservado, sin reiniciar la fase.
- **Consecuencias:** Reanudar no cambia la duración configurada ni restaura el valor inicial.
- **Aprobación:** 2026-10-19.

### DEC-004: Confirmación de reinicio

- **Estado:** Aprobada.
- **Contexto:** Reiniciar descarta el progreso temporal de la fase actual.
- **Requisitos relacionados:** HU-001-R05 y HU-001-R07; SPEC-001-R07 y SPEC-001-R09.
- **Opciones consideradas:** Reiniciar inmediatamente; solicitar confirmación antes de reiniciar.
- **Decisión:** Suspender la cuenta y mostrar el mensaje `¿Deseas reiniciar el temporizador?` con los botones `Cancelar` y `Reiniciar` antes de modificar la fase.
- **Consecuencias:** Solicitar reinicio no altera el tiempo restante ni el estado anterior mientras el usuario decide.
- **Aprobación:** 2026-10-19.

### DEC-005: Cancelación del reinicio

- **Estado:** Aprobada.
- **Contexto:** Cancelar debe abandonar la acción destructiva.
- **Requisitos relacionados:** HU-001-R06; SPEC-001-R08.
- **Opciones consideradas:** Conservar el estado previo; dejar la fase pausada; aplicar el reinicio de todas formas.
- **Decisión:** Al seleccionar `Cancelar`, conservar el tiempo restante y restaurar el estado anterior sin restaurar la duración completa.
- **Consecuencias:** La cancelación no debe equivaler a un reinicio. La cuenta permanece suspendida durante la confirmación y, al cancelar, recupera el estado anterior.
- **Aprobación:** 2026-10-19.

## Decisiones adicionales

### DEC-006: Estado después de confirmar el reinicio

- **Estado:** Aprobada.
- **Contexto:** El reinicio debe definir tanto el tiempo restaurado como el estado resultante.
- **Opciones consideradas:** Quedar detenido; quedar pausado; comenzar inmediatamente.
- **Decisión:** Restaurar la duración configurada completa y dejar el temporizador detenido.
- **Consecuencias:** El usuario debe seleccionar `Iniciar` para comenzar otra vez la fase reiniciada.
- **Aprobación:** 2026-10-19.

### DEC-007: Tiempo durante la confirmación

- **Estado:** Aprobada.
- **Contexto:** Una confirmación abierta no debe consumir tiempo sin una regla explícita.
- **Opciones consideradas:** Continuar descontando; suspender temporalmente; convertir la fase definitivamente a pausada.
- **Decisión:** Suspender la cuenta mientras la confirmación esté abierta. Si el usuario cancela, restaurar el estado anterior y reanudar desde el tiempo suspendido cuando antes estaba en ejecución.
- **Consecuencias:** La confirmación no descuenta tiempo y no convierte por sí sola el estado previo en una pausa permanente.
- **Aprobación:** 2026-10-19.

### DEC-008: Estados que permiten solicitar reinicio

- **Estado:** Aprobada.
- **Contexto:** La disponibilidad de reinicio determina las transiciones y controles válidos.
- **Opciones consideradas:** Detenido, ejecución y pausa; solo ejecución y pausa; otra combinación.
- **Decisión:** Permitir reiniciar únicamente mientras el temporizador esté en ejecución o pausado, siempre con confirmación.
- **Consecuencias:** `Reiniciar` no está visible cuando el temporizador está detenido.
- **Aprobación:** 2026-10-19.

### DEC-009: Formato y precisión del tiempo

- **Estado:** Aprobada.
- **Contexto:** El tiempo restante debe tener una representación estable y verificable.
- **Opciones consideradas:** Minutos enteros; `MM:SS`; segundos con decimales.
- **Decisión:** Mostrar `MM:SS`, sin decimales, redondeando hacia arriba cualquier fracción de segundo restante positiva y permitiendo que el campo de minutos supere 99.
- **Consecuencias:** Un tiempo positivo inferior o igual a un segundo se muestra como `00:01`; cero se muestra como `00:00`; una duración de 100 minutos se puede mostrar como `100:00` sin imponer un límite nuevo.
- **Aprobación:** 2026-10-19.

### DEC-010: Controles y diálogo de reinicio

- **Estado:** Aprobada.
- **Contexto:** Los controles visibles deben corresponder al estado del temporizador y el diálogo debe expresar la decisión de reinicio sin ambigüedad.
- **Opciones consideradas:** Mostrar todos los controles; mostrar únicamente las acciones válidas para cada estado.
- **Decisión:** Mostrar `Iniciar` cuando esté detenido; `Pausar` y `Reiniciar` cuando esté en ejecución; `Reanudar` y `Reiniciar` cuando esté pausado. Al solicitar reinicio, mostrar `¿Deseas reiniciar el temporizador?` con `Cancelar` y `Reiniciar`.
- **Consecuencias:** Los controles que no correspondan al estado no se muestran y las dos respuestas del diálogo tienen efectos verificables distintos.
- **Aprobación:** 2026-10-19.

## Resultado del contraste con HU-001

- **Iniciar:** Cubierto por DEC-001 y los requisitos SPEC-001-R02 y SPEC-001-R03.
- **Pausar y continuar:** Cubierto por DEC-002 y DEC-003, y por SPEC-001-R04 a SPEC-001-R06.
- **Reiniciar:** Cubierto por DEC-004, DEC-006 a DEC-008 y SPEC-001-R07, SPEC-001-R09 y SPEC-001-R10.
- **Cancelar el reinicio:** Cubierto por DEC-005 y DEC-007, y por SPEC-001-R08 y SPEC-001-R11.
- No quedan dudas funcionales abiertas en esta especificación a partir de las instrucciones recibidas.

## Cierre

- Todas las decisiones de HU-001 están aprobadas para planificación.
- Cualquier cambio funcional requiere volver a la fase de especificación.
