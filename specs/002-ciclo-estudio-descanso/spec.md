# Especificación 002: Ciclo de estudio y descanso

**Estado: aprobada, con enmienda de integración aprobada el 2026-10-20.**

## Trazabilidad

- Historia de usuario: `docs/historias/HU-002.md`.
- Título de la historia: HU-002, Ciclos de estudio y descanso.
- Requisitos originales: cuatro requisitos comunicados por el responsable del proyecto el 2026-10-19.
- Dependencia aprobada: `specs/001-temporizador/spec.md`.
- Decisiones: `specs/002-ciclo-estudio-descanso/decisiones.md`.
- Constitución: `docs/constitution.md`.

Esta especificación autoriza la planificación de HU-002. La implementación requiere además que `plan.md` y `tasks.md` reciban aprobación explícita.

## Objetivo

Especificar la alternancia entre fases de estudio, descanso corto y descanso largo a partir de la finalización del temporizador, dejando cada nueva fase preparada para que el usuario la inicie manualmente y mostrando el progreso del ciclo.

## Actor

- Estudiante de Academia Cotopaxi que realiza ciclos Pomodoro desde un dispositivo Android.

## Contexto existente

- HU-001 proporciona un temporizador detenido, en ejecución o pausado, con inicio, pausa, reanudación y reinicio confirmado.
- El temporizador existente finaliza una fase al llegar a cero y la deja fuera de ejecución.
- La duración actual se representa en milisegundos y la interfaz presenta el tiempo en formato `MM:SS`.
- La pantalla principal contiene el componente del temporizador y actualmente presenta una sesión de estudio.
- HU-002 debe reutilizar este comportamiento sin cambiar la semántica aprobada de los controles de HU-001.

Estas observaciones delimitan la compatibilidad requerida, pero no constituyen un diseño técnico ni seleccionan una implementación.

## Alcance

- Reconocer tres tipos de fase: estudio, descanso corto y descanso largo.
- Contabilizar los Pomodoros de estudio completados dentro del ciclo vigente.
- Usar cuatro Pomodoros como cantidad predeterminada; HU-005 permite configurar otro entero positivo.
- Aplicar un cambio de cantidad desde el siguiente ciclo completo, sin alterar el ciclo en curso.
- Después de completar un estudio que todavía no alcanza la cantidad requerida, preparar un descanso corto.
- Después de completar el estudio que alcanza la cantidad requerida, preparar un descanso largo y mostrar el ciclo completado como `N de N`.
- Después de completar un descanso corto, preparar una fase de estudio y conservar el progreso.
- Después de completar un descanso largo, preparar una fase de estudio y reiniciar el progreso a `0 de N`, usando para el ciclo nuevo la cantidad que corresponda.
- Usar provisionalmente 25 minutos para estudio, 5 minutos para descanso corto y 15 minutos para descanso largo hasta integrar HU-005.
- Dejar cada nueva fase detenida y con su duración completa hasta que el usuario seleccione `Iniciar`.
- Mostrar en la pantalla principal los nombres `Estudio`, `Descanso corto` o `Descanso largo` según corresponda.
- Mostrar el progreso mediante el texto accesible `Pomodoros completados: C de N`.
- Iniciar en `Estudio` con el progreso `Pomodoros completados: 0 de N`, donde N es la cantidad configurada o cuatro si no hay una configuración utilizable.
- Impedir la omisión o selección manual de fases durante HU-002.
- Conservar en cada fase los controles aprobados en HU-001.
- Ejecutar la lógica del ciclo sin conexión a Internet.

## Fuera de alcance

- La interfaz, validación y persistencia para configurar la cantidad de Pomodoros requerida, que se incorporarán posteriormente en HU-005.
- La edición, validación y persistencia de las duraciones, cubierta por HU-005.
- La recuperación del ciclo después de bloqueo, cierre o reinicio del proceso, cubierta por HU-003.
- Las notificaciones, sonidos y vibraciones al finalizar una fase, cubiertos por HU-004.
- La selección u omisión manual de fases.
- Cuentas, servicios remotos, publicidad y telemetría.
- Diseño visual definitivo y recursos institucionales.

## Términos

| Término | Definición para esta especificación |
| --- | --- |
| Fase de estudio | Fase cuyo término válido completa un Pomodoro y modifica el progreso del ciclo |
| Descanso corto | Fase preparada después de un estudio que no alcanza la cantidad requerida del ciclo |
| Descanso largo | Fase preparada después del estudio que alcanza la cantidad requerida del ciclo |
| Fase actual | Fase preparada, en ejecución o pausada que controla el temporizador |
| Fase completada | Fase que estaba en ejecución y cuyo tiempo restante alcanzó cero |
| Pomodoro completado | Fase de estudio completada; una pausa o un reinicio no la completan |
| Contador del ciclo | Cantidad de Pomodoros de estudio completados contabilizados en el ciclo vigente; conserva el valor requerido durante el descanso largo y vuelve a cero cuando este termina |
| Cantidad requerida | Número de Pomodoros de estudio necesarios para preparar el descanso largo; el valor predeterminado es cuatro y HU-005 permite configurarlo |
| Fase preparada | Nueva fase detenida, con su duración completa y pendiente de inicio manual |

## Reglas de transición confirmadas

Sea `N` la cantidad requerida vigente y `C` el contador antes de terminar una fase de estudio:

| Fase completada | Condición | Fase preparada | Efecto en el contador |
| --- | --- | --- | --- |
| Estudio | `C + 1 < N` | Descanso corto | Aumenta una unidad |
| Estudio | `C + 1 = N` | Descanso largo | Alcanza `N` y se conserva durante el descanso largo |
| Descanso corto | Siempre | Estudio | Se conserva |
| Descanso largo | Siempre | Estudio | Se reinicia a cero para el siguiente ciclo |

- Una transición prepara la siguiente fase, pero no inicia su cuenta regresiva.
- Cada finalización de estudio modifica el contador exactamente una vez.
- El valor predeterminado es `N = 4`. Cuando HU-005 cambie `N`, el ciclo vigente conserva su cantidad y el nuevo valor se aplicará al siguiente ciclo.
- Pausar, reanudar, solicitar un reinicio, cancelar un reinicio o confirmar un reinicio no seleccionan otra fase ni incrementan el contador.
- El usuario solo puede iniciar la fase preparada por el ciclo; no puede omitirla ni seleccionar otro tipo.

## Requisitos EARS

### Identificación y progreso

- **SPEC-002-R01 (ubícuo):** La aplicación deberá identificar la fase actual con uno de los nombres exactos `Estudio`, `Descanso corto` o `Descanso largo`.
- **SPEC-002-R02 (ubícuo):** La pantalla principal deberá mostrar la fase actual sin depender únicamente del color.
- **SPEC-002-R03 (ubícuo):** La pantalla principal deberá mostrar el progreso mediante el texto accesible `Pomodoros completados: C de N`, sustituyendo `C` y `N` por los valores vigentes.
- **SPEC-002-R04 (ubícuo):** Cuando no haya una cantidad de ciclo configurada y utilizable, la aplicación deberá usar cuatro Pomodoros para determinar el descanso largo.
- **SPEC-002-R19 (dirigido por evento):** Cuando la aplicación establezca el ciclo inicial sin progreso recuperado, deberá preparar `Estudio` con cero Pomodoros completados de la cantidad configurada o de cuatro si no hay una cantidad utilizable.
- **SPEC-002-R20 (dirigido por evento):** Cuando HU-005 permita cambiar la cantidad requerida durante un ciclo, la aplicación deberá conservar la cantidad vigente hasta terminar el descanso largo y aplicar la nueva cantidad al ciclo siguiente.

### Finalización de estudio

- **SPEC-002-R05 (dirigido por evento):** Cuando una fase de estudio en ejecución llegue a cero, la aplicación deberá registrar exactamente un Pomodoro completado.
- **SPEC-002-R06 (dirigido por evento):** Cuando el Pomodoro completado no alcance la cantidad requerida del ciclo, la aplicación deberá preparar un descanso corto como fase actual.
- **SPEC-002-R07 (dirigido por evento):** Cuando el Pomodoro completado alcance la cantidad requerida del ciclo, la aplicación deberá preparar un descanso largo como fase actual y conservar el contador en la cantidad requerida durante ese descanso.
- **SPEC-002-R08 (comportamiento no deseado):** Si una fase de estudio no ha llegado a cero, la aplicación no deberá incrementar el contador ni cambiar la fase como consecuencia de una pausa, reanudación o reinicio de HU-001.

### Finalización de descanso

- **SPEC-002-R09 (dirigido por evento):** Cuando un descanso corto en ejecución llegue a cero, la aplicación deberá preparar una fase de estudio y conservar el progreso del ciclo.
- **SPEC-002-R10 (dirigido por evento):** Cuando un descanso largo en ejecución llegue a cero, la aplicación deberá reiniciar el contador a cero y preparar una fase de estudio perteneciente al siguiente ciclo.
- **SPEC-002-R11 (comportamiento no deseado):** Cuando termine un descanso corto o largo, la aplicación no deberá incrementar el contador de Pomodoros completados.

### Preparación y control de fases

- **SPEC-002-R12 (dirigido por evento):** Cuando la aplicación prepare una nueva fase antes de integrar HU-005, deberá asignar 25 minutos a `Estudio`, 5 minutos a `Descanso corto` o 15 minutos a `Descanso largo`, y dejar el temporizador detenido.
- **SPEC-002-R13 (dependiente de estado):** Mientras una fase preparada no haya sido iniciada por el usuario, la aplicación no deberá descontar su tiempo restante.
- **SPEC-002-R14 (dirigido por evento):** Cuando el usuario seleccione `Iniciar` sobre una fase preparada, la aplicación deberá iniciar esa fase mediante el comportamiento aprobado en HU-001.
- **SPEC-002-R15 (ubícuo):** La aplicación deberá conservar para estudio, descanso corto y descanso largo las reglas aprobadas de pausa, reanudación y reinicio de HU-001.
- **SPEC-002-R16 (dirigido por evento):** Cuando el temporizador procese repetidamente el estado cero de una fase ya completada, la aplicación no deberá volver a cambiar la fase ni modificar el contador.
- **SPEC-002-R21 (comportamiento no deseado):** Mientras HU-002 esté vigente sin una ampliación aprobada, la aplicación no deberá ofrecer acciones para omitir la fase preparada ni seleccionar manualmente otro tipo de fase.

### Operación local y accesibilidad

- **SPEC-002-R17 (dependiente de estado):** Mientras el dispositivo no tenga conexión a Internet, la aplicación deberá determinar y preparar las fases con el mismo comportamiento funcional.
- **SPEC-002-R18 (ubícuo):** La fase actual y el progreso del ciclo deberán tener nombres y valores accesibles para tecnologías de asistencia.

## Criterios de aceptación

### SPEC-002-CA01: Descanso corto antes del límite

**Dado** que una fase de estudio está en ejecución y su finalización deja el contador por debajo de la cantidad requerida,
**Cuando** su tiempo llega a cero,
**Entonces** el contador aumenta exactamente una vez y queda preparado un descanso corto detenido con su duración completa.

### SPEC-002-CA02: Descanso largo al alcanzar el límite

**Dado** que una fase de estudio está en ejecución y su finalización alcanza la cantidad requerida,
**Cuando** su tiempo llega a cero,
**Entonces** queda preparado un descanso largo detenido con su duración completa y el progreso muestra `Pomodoros completados: N de N` (por defecto, `4 de 4`).

### SPEC-002-CA03: Cantidad predeterminada

**Dado** que no existe una cantidad de ciclo configurada y utilizable,
**Cuando** la aplicación determina si corresponde un descanso corto o largo,
**Entonces** utiliza cuatro Pomodoros como cantidad requerida.

### SPEC-002-CA04: Estudio después de descanso corto

**Dado** que un descanso corto está en ejecución y existe progreso en el ciclo,
**Cuando** su tiempo llega a cero,
**Entonces** queda preparada una fase de estudio detenida y el contador conserva su valor.

### SPEC-002-CA05: Estudio después de descanso largo

**Dado** que un descanso largo está en ejecución y el progreso muestra N Pomodoros completados de N,
**Cuando** su tiempo llega a cero,
**Entonces** queda preparada una fase de estudio detenida y el progreso cambia a `Pomodoros completados: 0 de N`, donde N es la cantidad que rige el ciclo nuevo.

### SPEC-002-CA06: Inicio manual entre fases

**Dado** que una fase terminó y la siguiente quedó preparada,
**Cuando** el usuario todavía no ha seleccionado `Iniciar`,
**Entonces** el temporizador conserva la duración completa de la nueva fase y no descuenta tiempo.

### SPEC-002-CA07: Inicio de la fase preparada

**Dado** que una fase de estudio o descanso está preparada y detenida,
**Cuando** el usuario selecciona `Iniciar`,
**Entonces** esa misma fase comienza la cuenta regresiva desde su duración completa.

### SPEC-002-CA08: Pausa sin avance del ciclo

**Dado** que una fase de estudio o descanso tiene tiempo restante y está en ejecución,
**Cuando** el usuario la pausa,
**Entonces** se conserva la fase y el contador sin registrar una finalización.

### SPEC-002-CA09: Reinicio sin avance del ciclo

**Dado** que una fase de estudio o descanso tiene tiempo restante,
**Cuando** el usuario confirma su reinicio,
**Entonces** se conserva la fase y el contador, y el temporizador vuelve a la duración completa según HU-001.

### SPEC-002-CA10: Finalización procesada una sola vez

**Dado** que una fase ya llegó a cero y produjo su transición,
**Cuando** la aplicación vuelve a evaluar el tiempo sin iniciar otra fase,
**Entonces** no incrementa nuevamente el contador ni vuelve a seleccionar una fase.

### SPEC-002-CA11: Información del ciclo en la pantalla principal

**Dado** que existe una fase actual y un contador del ciclo,
**Cuando** el usuario consulta la pantalla principal,
**Entonces** identifica `Estudio`, `Descanso corto` o `Descanso largo` y el texto accesible `Pomodoros completados: C de N`, sin depender únicamente del color.

### SPEC-002-CA12: Ciclo sin conexión

**Dado** que el dispositivo no tiene conexión a Internet,
**Cuando** una fase termina o el usuario inicia, pausa, reanuda o reinicia la fase preparada,
**Entonces** el ciclo y el temporizador producen el mismo resultado funcional que con conexión.

### SPEC-002-CA13: Conservación de HU-001

**Dado** que la fase actual está detenida, en ejecución, pausada o en confirmación de reinicio,
**Cuando** el usuario utiliza un control definido por HU-001,
**Entonces** se mantienen sus reglas aprobadas de tiempo, controles, confirmación y cancelación, salvo la transición de fase causada exclusivamente por llegar a cero.

### SPEC-002-CA14: Estado inicial

**Dado** que la aplicación establece el ciclo inicial sin progreso recuperado,
**Cuando** presenta la pantalla principal,
**Entonces** prepara `Estudio`, muestra `Pomodoros completados: 0 de N` (N configurada o cuatro por defecto) y espera que el usuario seleccione `Iniciar`.

### SPEC-002-CA15: Duraciones provisionales

**Dado** que HU-005 todavía no proporciona duraciones configuradas,
**Cuando** la aplicación prepara una fase,
**Entonces** usa 25 minutos para `Estudio`, 5 minutos para `Descanso corto` y 15 minutos para `Descanso largo`.

### SPEC-002-CA16: Cambio futuro de cantidad

**Dado** que HU-005 cambia la cantidad requerida mientras existe un ciclo en curso,
**Cuando** el ciclo actual continúa hasta terminar su descanso largo,
**Entonces** conserva la cantidad anterior durante ese ciclo y aplica la nueva cantidad al preparar el ciclo siguiente.

### SPEC-002-CA17: Sin omisión ni selección manual

**Dado** que el ciclo ha preparado una fase,
**Cuando** el usuario consulta las acciones disponibles,
**Entonces** puede controlar esa fase mediante HU-001, pero no puede omitirla ni seleccionar manualmente otro tipo de fase.

## Matriz de trazabilidad

| Requisito de especificación | Origen | Criterios |
| --- | --- | --- |
| SPEC-002-R01-R03 | Requisito original 4; decisiones 6 y 7; HU-002-R01-R02 | CA11 |
| SPEC-002-R04 | Requisito original 2 | CA02, CA03 |
| SPEC-002-R05-R08 | Requisitos originales 1 y 2; HU-002-R03-R04, R07 | CA01-CA03, CA08-CA10 |
| SPEC-002-R09-R11 | Requisito original 3; HU-002-R05, R08 | CA04, CA05 |
| SPEC-002-R12-R15 | Requisitos originales 1 y 3; HU-001 aprobada; HU-002-R06 | CA01, CA02, CA04-CA09, CA13 |
| SPEC-002-R16 | Constitución, principio de pruebas deterministas | CA10 |
| SPEC-002-R17 | Constitución, operación offline | CA12 |
| SPEC-002-R18 | Requisito original 4; Constitución, accesibilidad | CA11 |
| SPEC-002-R19 | Decisión 3 del responsable | CA14 |
| SPEC-002-R20 | Decisiones 1 y 2 del responsable | CA16 |
| SPEC-002-R21 | Decisión 8 del responsable | CA17 |

## Estrategia de verificación preliminar

- Probar las reglas del ciclo con una fuente de tiempo controlada y duraciones breves.
- Verificar los límites anterior, igual y posterior a la cantidad requerida.
- Verificar el estado inicial `Estudio` y `0 de N`, con N igual a cuatro por defecto.
- Confirmar que cada estudio completado se contabiliza una sola vez.
- Confirmar que los descansos no aumentan el contador.
- Confirmar que el progreso permanece en `N de N` durante el descanso largo y cambia a `0 de N` al preparar el ciclo siguiente; verificar el caso predeterminado `4 de 4`.
- Verificar las duraciones provisionales de 25, 5 y 15 minutos.
- Verificar que un cambio futuro de cantidad no altera el ciclo en curso.
- Verificar que cada transición deja la nueva fase detenida con la duración completa.
- Verificar que no existen acciones para omitir o seleccionar manualmente fases.
- Repetir pausa, reanudación, reinicio confirmado y cancelado en cada tipo de fase para detectar regresiones de HU-001.
- Verificar fase y progreso mediante consultas accesibles, sin depender del estilo visual.
- Repetir el ciclo esencial sin conectividad.

Esta estrategia no selecciona herramientas ni autoriza implementación.

## Resultado de la revisión

- Las ocho preguntas de especificación fueron respondidas por el responsable del proyecto el 2026-10-19.
- HU-002 usa cuatro Pomodoros como valor predeterminado y duraciones provisionales de 25, 5 y 15 minutos hasta integrar HU-005.
- El progreso alcanza y conserva `N de N` durante el descanso largo; al terminarlo se inicia el ciclo siguiente con la cantidad entonces configurada.
- No quedan preguntas funcionales abiertas para el alcance actual.
- Cualquier nueva ambigüedad, contradicción o decisión funcional relevante deberá consultarse antes de avanzar.

## Aprobación

- Contraste con los requisitos originales: Completado.
- Revisión de arquitectura existente: Completada.
- Preguntas funcionales: Resueltas.
- Aprobación del responsable: Aprobada explícitamente el 2026-10-19.
- Enmienda de configuración del tamaño del ciclo: Aprobada explícitamente por el responsable el 2026-10-20; cuatro sigue siendo el valor predeterminado y una cantidad modificada se aplica al siguiente ciclo completo.
- Planificación: Autorizada.
- Implementación: No autorizada hasta aprobar `plan.md` y `tasks.md`.
