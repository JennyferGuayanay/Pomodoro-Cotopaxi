# Especificación 003: Persistencia y recuperación del temporizador

**Estado: aprobada**

## Trazabilidad

- Historia de usuario: `docs/historias/HU-003.md`.
- Título de la historia: HU-003, Conservación y recuperación del temporizador.
- Requisitos originales: cuatro requisitos comunicados por el responsable del proyecto el 2026-10-19.
- Dependencias aprobadas: `specs/001-temporizador/spec.md` y `specs/002-ciclo-estudio-descanso/spec.md`.
- Decisiones: `specs/003-persistencia-temporizador/decisiones.md`.
- Constitución: `docs/constitution.md`.

Esta especificación tiene las decisiones funcionales resueltas y aprobadas. Autoriza la elaboración del plan y las tareas, pero no la implementación hasta revisar y aprobar dicho plan.

## Objetivo

Especificar la conservación local y la recuperación del temporizador y del ciclo para que el tiempo visible refleje el transcurso real durante un bloqueo o cierre, sin descontar una pausa ni alterar las reglas aprobadas de HU-001 y HU-002.

## Actor

- Estudiante de Academia Cotopaxi que usa el temporizador desde un dispositivo Android.

## Contexto existente

- HU-001 define los estados detenido, en ejecución, pausado y confirmación de reinicio, así como el formato `MM:SS` y sus controles.
- Una ejecución de HU-001 usa una marca temporal de finalización y deriva de ella el tiempo restante.
- HU-002 define la fase actual, el progreso del ciclo, la transición única al terminar y el inicio manual de cada fase nueva.
- El estado actual se mantiene solo en memoria; al desmontar o terminar el proceso se pierde.
- No existe en `package.json` una dependencia directa de persistencia local.

Estas observaciones delimitan el comportamiento que debe conservarse. No seleccionan una biblioteca ni constituyen un plan técnico.

## Alcance

- Conservar localmente el estado necesario del temporizador y del ciclo.
- Recuperar ese estado después de bloquear y desbloquear el dispositivo.
- Recuperar ese estado después de retirar la aplicación de recientes y abrirla nuevamente.
- Calcular mediante marcas de tiempo el restante de una fase que estaba en ejecución.
- Mantener sin descuento el restante de una fase que estaba pausada.
- Reconocer una finalización ocurrida durante la ausencia y aplicar exactamente una transición de HU-002.
- Dejar la fase siguiente detenida, con duración completa y pendiente de inicio manual.
- Evitar avisos de finalización para una fase pausada.
- Funcionar sin conexión a Internet.
- Mantener los comportamientos aprobados y las 53 pruebas existentes de HU-001 y HU-002.

## Fuera de alcance

- Implementación, selección o instalación de una biblioteca de persistencia.
- Notificación, sonido o vibración cuando una fase en ejecución vence durante la ausencia, cubiertos por HU-004.
- Configuración de duraciones o cantidad objetivo, cubierta por HU-005.
- Cuentas, servicios remotos, sincronización, publicidad o telemetría.
- Recuperación después de desinstalar la aplicación o borrar sus datos.
- Diseño visual nuevo o cambios a los controles aprobados.
- `plan.md`, `tasks.md` y cualquier cambio de código.

## Términos

| Término                          | Definición para esta especificación                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Ausencia                         | Periodo durante el cual la aplicación no está activa por bloqueo del dispositivo o por haber sido retirada de recientes |
| Estado persistido                | Información local necesaria para reconstruir el temporizador y el ciclo sin depender de memoria del proceso             |
| Marca de finalización            | Instante absoluto en el que debe terminar una fase en ejecución                                                         |
| Reconciliación                   | Comparación del estado persistido con la hora actual para obtener el estado funcional que corresponde al volver         |
| Fase pausada                     | Fase que conserva un tiempo restante fijo y no descuenta tiempo                                                         |
| Fase preparada                   | Fase detenida con su duración completa y pendiente de inicio manual según HU-002                                        |
| Finalización durante la ausencia | Vencimiento de la marca de finalización antes de que la aplicación vuelva a estar disponible para el usuario            |
| Aviso                            | Solicitud de notificación, sonido o vibración por finalización; su entrega efectiva pertenece a HU-004                  |

## Reglas de recuperación

| Estado conservado          | Condición al volver                                           | Resultado esperado                                                                                                   |
| -------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| En ejecución               | La marca de finalización es posterior a la hora actual        | Misma fase y progreso, en ejecución, con el restante recalculado                                                     |
| En ejecución               | La marca de finalización es igual o anterior a la hora actual | Finalización procesada una vez y siguiente fase de HU-002 preparada                                                  |
| Pausado                    | Cualquier duración de ausencia                                | Misma fase, progreso y restante pausado, sin finalización ni aviso                                                   |
| Detenido/preparado         | Cualquier duración de ausencia                                | Misma fase, progreso y restante, todavía detenido                                                                    |
| Confirmación de reinicio   | Cualquier duración de ausencia                                | Recuperar como pausada, con el tiempo suspendido y sin mostrar nuevamente la confirmación                            |
| Datos ausentes o inválidos | Al intentar recuperar                                         | Restablecer el estado inicial: Estudio, 0 de 4 Pomodoros, detenido y duración configurada válida o 25:00 por defecto |

- La reconciliación no inicia automáticamente una fase.
- Una ausencia no puede completar más de una fase porque cada fase nueva requiere inicio manual.
- Volver a reconciliar una finalización ya aplicada no puede incrementar nuevamente el contador ni saltar otra fase.

## Requisitos EARS

### Conservación local

- **SPEC-003-R01 (dirigido por evento):** Cuando cambien la fase, el progreso del ciclo o el estado funcional del temporizador, la aplicación deberá conservar localmente la información necesaria para reconstruir el resultado de ese cambio después del cierre desde aplicaciones recientes.
- **SPEC-003-R02 (ubícuo):** La aplicación deberá conservar como mínimo la fase actual, los Pomodoros completados, la cantidad requerida vigente, la duración de la fase y el estado del temporizador con su referencia temporal aplicable.
- **SPEC-003-R03 (dependiente de estado):** Mientras una fase esté en ejecución, la referencia temporal conservada deberá ser una marca de finalización que permita calcular el restante sin depender de ticks ejecutados durante la ausencia.

### Recuperación de una ejecución

- **SPEC-003-R04 (complejo):** Mientras una fase conservada esté en ejecución, cuando la aplicación vuelva a estar activa antes de su marca de finalización, la aplicación deberá calcular el tiempo restante como el máximo entre cero y la diferencia entre esa marca y la hora actual.
- **SPEC-003-R05 (dirigido por evento):** Cuando la aplicación recupere una fase en ejecución que todavía no venció, deberá restaurar la misma fase, el mismo progreso y el estado en ejecución con el tiempo restante calculado.
- **SPEC-003-R06 (comportamiento no deseado):** Si el cálculo temporal produce un valor inferior a cero, la aplicación no deberá mostrar ni conservar un tiempo negativo.
- **SPEC-003-R07 (dirigido por evento):** Cuando la aplicación se abra después de haber sido retirada de recientes, deberá completar la recuperación antes de presentar un estado interactivo del temporizador.
- **SPEC-003-R08 (dirigido por evento):** Cuando la aplicación vuelva desde un bloqueo del dispositivo, deberá reconciliar una fase en ejecución contra su marca de finalización antes de continuar su presentación y control.

### Finalización durante la ausencia

- **SPEC-003-R09 (complejo):** Mientras una fase conservada esté en ejecución, cuando la aplicación vuelva y su marca de finalización sea igual o anterior a la hora actual, la aplicación deberá reconocer esa fase como terminada.
- **SPEC-003-R10 (dirigido por evento):** Cuando la recuperación reconozca una fase terminada durante la ausencia, la aplicación deberá aplicar exactamente una vez la transición correspondiente de HU-002.
- **SPEC-003-R11 (dirigido por evento):** Cuando la recuperación aplique una transición de HU-002, la aplicación deberá dejar la fase resultante detenida, con su duración completa y pendiente de que el usuario seleccione `Iniciar`.
- **SPEC-003-R12 (comportamiento no deseado):** Si una finalización recuperada ya fue aplicada, la aplicación no deberá volver a modificar la fase ni el progreso al reconciliar nuevamente el mismo estado.

### Pausa y estados sin descuento

- **SPEC-003-R13 (dependiente de estado):** Mientras una fase conservada esté pausada, el tiempo transcurrido durante el bloqueo o cierre no deberá reducir su tiempo restante.
- **SPEC-003-R14 (dirigido por evento):** Cuando la aplicación recupere una fase pausada, deberá restaurar la misma fase, el mismo progreso, el estado pausado y el mismo tiempo restante conservado.
- **SPEC-003-R15 (comportamiento no deseado):** Mientras una fase recuperada permanezca pausada, la aplicación no deberá reconocer una finalización ni solicitar un aviso de fase terminada.
- **SPEC-003-R16 (dependiente de estado):** Mientras una fase conservada esté detenida o preparada, el tiempo transcurrido durante el bloqueo o cierre no deberá reducir su tiempo restante ni iniciarla automáticamente.

### Operación local y compatibilidad

- **SPEC-003-R17 (dependiente de estado):** Mientras el dispositivo no tenga conexión a Internet, la aplicación deberá conservar, recuperar y reconciliar el estado con el mismo resultado funcional que con conexión.
- **SPEC-003-R18 (ubícuo):** La recuperación deberá conservar las reglas aprobadas de controles, formato temporal, fase, progreso, transición única e inicio manual de HU-001 y HU-002.
- **SPEC-003-R19 (comportamiento no deseado):** Si el estado persistido falta, es inválido, está incompleto o es incompatible, la aplicación no deberá bloquearse ni presentar un tiempo negativo o una combinación imposible de fase, progreso y temporizador; deberá adoptar el estado inicial seguro: Estudio, 0 de 4 Pomodoros, detenido y duración configurada válida o 25:00 por defecto.

## Criterios de aceptación

### SPEC-003-CA01: Recuperación después de bloqueo antes del vencimiento

**Dado** que una fase está en ejecución y conserva una marca de finalización futura,  
**Cuando** el usuario bloquea el dispositivo, transcurre tiempo y vuelve antes del vencimiento,  
**Entonces** la aplicación muestra la misma fase y progreso en ejecución con el tiempo restante calculado al descontar la ausencia.

### SPEC-003-CA02: Recuperación después de cerrar antes del vencimiento

**Dado** que una fase está en ejecución y conserva una marca de finalización futura,  
**Cuando** el usuario retira la aplicación de recientes y la abre antes del vencimiento,  
**Entonces** la aplicación recupera la misma fase y progreso en ejecución con el tiempo restante calculado desde esa marca.

### SPEC-003-CA03: Cálculo sin ticks en segundo plano

**Dado** que una fase en ejecución tenía un tiempo restante conocido al comenzar la ausencia,  
**Cuando** la aplicación vuelve sin haber ejecutado ticks durante ese periodo,  
**Entonces** el restante se obtiene de la marca de finalización y la hora actual, no del número de actualizaciones ejecutadas.

### SPEC-003-CA04: Fase de estudio vencida durante la ausencia

**Dado** que una fase de estudio está en ejecución y vence durante el bloqueo o cierre,  
**Cuando** el usuario vuelve a la aplicación,  
**Entonces** se registra exactamente un Pomodoro y queda preparado el descanso corto o largo correspondiente según HU-002.

### SPEC-003-CA05: Descanso vencido durante la ausencia

**Dado** que un descanso corto o largo está en ejecución y vence durante el bloqueo o cierre,  
**Cuando** el usuario vuelve a la aplicación,  
**Entonces** queda preparada una fase de estudio y el progreso se conserva o reinicia según la regla aprobada para ese descanso.

### SPEC-003-CA06: Inicio manual después de una finalización ausente

**Dado** que la recuperación reconoció una fase terminada durante la ausencia,  
**Cuando** presenta la siguiente fase,  
**Entonces** esa fase está detenida con su duración completa y no descuenta tiempo hasta que el usuario seleccione `Iniciar`.

### SPEC-003-CA07: Finalización recuperada una sola vez

**Dado** que una finalización ocurrida durante la ausencia ya produjo la transición de fase,  
**Cuando** la aplicación vuelve a leer o reconciliar el estado sin iniciar otra fase,  
**Entonces** no incrementa nuevamente el progreso ni cambia otra vez de fase.

### SPEC-003-CA08: Pausa durante bloqueo

**Dado** que una fase está pausada con un tiempo restante conservado,  
**Cuando** el usuario bloquea y después desbloquea el dispositivo,  
**Entonces** la aplicación mantiene la misma fase, progreso y tiempo restante en estado pausado.

### SPEC-003-CA09: Pausa durante cierre

**Dado** que una fase está pausada con un tiempo restante conservado,  
**Cuando** el usuario retira la aplicación de recientes y vuelve a abrirla,  
**Entonces** la aplicación recupera la misma fase, progreso y tiempo restante en estado pausado.

### SPEC-003-CA10: Pausa sin avisos

**Dado** que una fase permaneció pausada durante un periodo mayor que su tiempo restante,  
**Cuando** el usuario vuelve a la aplicación,  
**Entonces** la fase continúa pausada con el mismo tiempo y no se reconoce una finalización ni se solicita un aviso.

### SPEC-003-CA11: Fase preparada durante la ausencia

**Dado** que una fase está detenida y pendiente de inicio manual,  
**Cuando** el usuario bloquea o cierra y después vuelve,  
**Entonces** la aplicación recupera esa fase con su duración completa sin haberla iniciado ni descontado tiempo.

### SPEC-003-CA12: Recuperación offline

**Dado** que el dispositivo no tiene conexión a Internet,  
**Cuando** el usuario bloquea o cierra la aplicación y después vuelve,  
**Entonces** el temporizador y el ciclo se recuperan localmente con el mismo resultado funcional.

### SPEC-003-CA13: Sin estado transitorio interactivo

**Dado** que existe un estado persistido válido,  
**Cuando** la aplicación se abre después de haber sido retirada de recientes,  
**Entonces** no permite controlar un estado inicial provisional antes de completar la recuperación.

### SPEC-003-CA14: Tiempo nunca negativo

**Dado** que la hora actual alcanzó o superó la marca de finalización conservada,  
**Cuando** la aplicación calcula el tiempo restante,  
**Entonces** no muestra un valor inferior a `00:00` y procesa la finalización conforme a HU-002.

### SPEC-003-CA15: Datos ausentes o inválidos

**Dado** que el estado persistido falta, está incompleto, es inválido o es incompatible,  
**Cuando** la aplicación intenta recuperarlo,  
**Entonces** no se bloquea ni muestra un tiempo negativo o una combinación imposible y adopta el estado inicial seguro: Estudio, 0 de 4 Pomodoros, detenido y duración configurada válida o 25:00 por defecto.

### SPEC-003-CA16: Tolerancia del tiempo visible

**Dado** que una fase en ejecución se recupera antes de vencer,  
**Cuando** se compara el restante mostrado con el calculado desde la marca de finalización,  
**Entonces** la diferencia no supera 1 segundo en el tiempo visible MM:SS.

### SPEC-003-CA17: Cierre durante confirmación de reinicio

**Dado** que la confirmación de reinicio está abierta y conserva un tiempo suspendido,  
**Cuando** el usuario cierra y vuelve a abrir la aplicación,  
**Entonces** la aplicación recupera el estado pausado con el mismo tiempo restante, sin reabrir el diálogo de confirmación.

## Matriz de trazabilidad

| Requisito de especificación | Origen                                            | Criterios                   |
| --------------------------- | ------------------------------------------------- | --------------------------- |
| SPEC-003-R01-R03            | Requisitos originales 1 y 2; HU-003-R01           | CA01-CA03, CA13             |
| SPEC-003-R04-R08            | Requisitos originales 1 y 2; HU-003-R02-R03       | CA01-CA03, CA13, CA14, CA16 |
| SPEC-003-R09-R12            | Requisito original 3; HU-003-R06; HU-002 aprobada | CA04-CA07, CA14             |
| SPEC-003-R13-R15            | Requisito original 4; HU-003-R04                  | CA08-CA10                   |
| SPEC-003-R16                | HU-003-R05; HU-002 aprobada                       | CA11                        |
| SPEC-003-R17                | Constitución; HU-003-R07                          | CA12                        |
| SPEC-003-R18                | Restricción de conservar HU-001 y HU-002          | CA04-CA11                   |
| SPEC-003-R19                | HU-003-R08; PEND-003                              | CA15                        |

## Estrategia de verificación preliminar

- Usar un reloj controlado para verificar el cálculo antes, exactamente en y después de la marca de finalización.
- Simular periodos sin ticks para comprobar que la marca temporal es la fuente de verdad.
- Probar recuperación de cada tipo de fase en ejecución, pausada y detenida.
- Probar una finalización ausente de estudio antes del límite, al alcanzar el cuarto Pomodoro, de descanso corto y de descanso largo.
- Verificar que cada finalización recuperada se procesa una sola vez.
- Verificar que la siguiente fase queda detenida y no comienza automáticamente.
- Probar estado local válido, ausente, incompleto, inválido e incompatible una vez resuelto PEND-003.
- Probar cierre desde aplicaciones recientes y bloqueo/desbloqueo en Android.
- Repetir los escenarios sin conexión a Internet.
- Ejecutar la suite completa de 53 pruebas de HU-001 y HU-002 cuando la implementación sea autorizada.
- Mantener inalterados los textos, controles, accesibilidad y transiciones aprobados en HU-001 y HU-002.

Esta estrategia no selecciona herramientas, dependencias ni diseño técnico, y no autoriza implementación.

## Decisiones resueltas

- **PEND-001:** Aprobada una tolerancia máxima de 1 segundo visible en MM:SS.
- **PEND-002:** Se utiliza el reloj del sistema. Los cambios manuales de fecha u hora se documentan como limitación.
- **PEND-003:** Ante datos ausentes o inválidos, se recupera el estado inicial seguro: Estudio, 0 de 4 Pomodoros, detenido y duración configurada válida o 25:00 por defecto.
- **PEND-004:** Si se cierra durante la confirmación de reinicio, se recupera pausado con el tiempo conservado.
- **PEND-005:** Se incluye la terminación del proceso por Android. Se excluyen de las pruebas obligatorias la detención forzada y el reinicio del dispositivo.

## Resultado de la revisión

- Los cuatro requisitos originales están trazados a requisitos EARS y criterios de aceptación.
- La recuperación se basa en marcas de tiempo y no en mantener ticks activos durante la ausencia.
- La persistencia incluye temporizador, fase y progreso para conservar HU-001 y HU-002.
- No se seleccionó ni instaló una dependencia de persistencia.
- Las cinco decisiones PEND-001 a PEND-005 fueron resueltas. La especificación está aprobada y puede pasar a planificación.

## Aprobación

- Contraste con los requisitos originales: Completado.
- Revisión de dependencias y estado actual: Completada.
- Preguntas funcionales: PEND-001 a PEND-005 resueltas.
- Aprobación del responsable: Aprobada.
- Planificación: Autorizada.
- Implementación: Pendiente de aprobar plan.md y tasks.md.
