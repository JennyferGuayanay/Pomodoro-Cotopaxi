# Especificación 004: Notificaciones y alarmas de fin de fase

## Estado

**Aprobación parcial.** Los requisitos definidos para la primera implementación reflejan decisiones autorizadas en esta revisión. El responsable autorizó la implementación de HU004-T01–T07 por separado y con pruebas, sin esperar a resolver SPEC-004-P01. El requisito original de alarma incluso con el celular en silencio, vibración y aviso en pantalla de bloqueo sigue pendiente de validación técnica. HU-004 no está completada ni aprobada globalmente.

- Historia de usuario: `docs/historias/HU-004.md` (continúa en borrador).
- Decisiones: `specs/004-notificaciones-alarmas/decisiones.md`.
- Dependencias funcionales: HU-001, HU-002 y HU-003.
- Constitución: `docs/constitution.md`.
- La planificación parcial está registrada en `plan.md` y `tasks.md`. La implementación parcial de HU004-T01–T07 está autorizada tarea por tarea, con solicitud explícita y pruebas; HU004-T08 no está autorizada para implementación. Esta autorización no modifica el estado global de aprobación de la especificación ni de HU-004.

## Objetivo y actor

Como estudiante de Academia Cotopaxi, quiero saber cuándo termina una fase de estudio o descanso aunque no esté mirando la aplicación, y abrir la aplicación para ver preparada la siguiente fase.

## Trazabilidad y alcance

- HU-001 rige la ejecución, pausa y reinicio del temporizador.
- HU-002 procesa una sola finalización y prepara la siguiente fase sin iniciarla automáticamente.
- HU-003 determina la recuperación durante bloqueo o cierre normal.
- La primera implementación aprobada parcialmente usa una notificación local por fase con `expo-notifications`, entrega Android `bestEffort`, un canal con sonido predeterminado y vibración, y permisos normales de notificación.
- Las notificaciones locales no dependen de conexión a Internet. La entrega puede retrasarse por Android o el fabricante.
- La primera implementación debe cubrir bloqueo y cierre normal desde recientes, pero no promete avisos tras detención forzada.

## Requisitos aprobados parcialmente para la primera implementación

### Programación y permisos

- **SPEC-004-R01 (dirigido por evento):** Cuando el usuario inicie una fase con permiso de notificaciones concedido, la aplicación deberá programar una única notificación local para el vencimiento de esa fase mediante `expo-notifications`.
- **SPEC-004-R02 (dirigido por evento):** Antes de iniciar el primer Pomodoro, la aplicación deberá explicar la finalidad de las notificaciones y solicitar el permiso que requiera la versión de Android.
- **SPEC-004-R03 (comportamiento no deseado):** Si el usuario deniega el permiso de notificaciones, la aplicación deberá permitir que el temporizador y el ciclo sigan funcionando sin presentar la notificación como entregada.
- **SPEC-004-R04 (dependiente de estado):** Mientras Android requiera permiso de notificaciones en tiempo de ejecución, la aplicación deberá solicitarlo de acuerdo con la versión de Android y no deberá confundirlo con el acceso especial a alarmas exactas.

### Aviso y transición de fase

- **SPEC-004-R05 (dirigido por evento):** Cuando se configure el canal Android de finalización, la aplicación deberá establecer sonido predeterminado y vibración.
- **SPEC-004-R06 (dependiente de estado):** Mientras se presente una notificación, la aplicación deberá respetar los ajustes del canal y las preferencias del usuario para sonido, vibración, importancia y visibilidad.
- **SPEC-004-R07 (dirigido por evento):** Cuando finalice una fase de estudio, la aplicación deberá usar el mensaje «Estudio terminado. Es momento de descansar».
- **SPEC-004-R08 (dirigido por evento):** Cuando finalice una fase de descanso, la aplicación deberá usar el mensaje «Descanso terminado. Es momento de estudiar».
- **SPEC-004-R09 (dirigido por evento):** Cuando el usuario toque una notificación de fin de fase, la aplicación deberá abrirse y mostrar la siguiente fase preparada, sin iniciarla automáticamente.
- **SPEC-004-R10 (dependiente de estado):** Mientras la aplicación esté visible cuando se procese una finalización, la aplicación deberá mostrar una indicación visual accesible sin generar una segunda notificación para la misma ejecución.

### Entrega y ciclo de vida

- **SPEC-004-R11 (dependiente de estado):** Mientras exista una fase en ejecución con permiso de notificaciones concedido, la aplicación deberá programar la notificación local con la modalidad Android `bestEffort` inicialmente.
- **SPEC-004-R12 (comportamiento no deseado):** Si Android, Doze, las políticas de batería o el fabricante retrasan una notificación `bestEffort`, la aplicación no deberá prometer una hora de entrega exacta.
- **SPEC-004-R13 (dirigido por evento):** Cuando el usuario pause una fase o solicite su reinicio, la aplicación deberá cancelar la notificación programada para esa ejecución.
- **SPEC-004-R14 (dirigido por evento):** Cuando el usuario reanude una fase o cancele un reinicio de una fase que estaba en ejecución, la aplicación deberá programar la notificación correspondiente a su vencimiento restaurado.
- **SPEC-004-R15 (dependiente de estado):** Mientras una fase pausada permanezca pausada o un reinicio sea confirmado, la aplicación no deberá mantener una notificación activa para la ejecución cancelada.
- **SPEC-004-R16 (comportamiento no deseado):** Si una notificación ya fue programada, cancelada, entregada o reconciliada para una ejecución, la aplicación no deberá crear un aviso duplicado para esa misma ejecución.
- **SPEC-004-R17 (dependiente de estado):** Mientras el dispositivo esté sin conexión a Internet, la aplicación deberá gestionar localmente las notificaciones permitidas sin solicitar un servicio remoto.
- **SPEC-004-R18 (dependiente de estado):** Mientras la fase siga en ejecución y exista una notificación local permitida, la aplicación deberá dejar la entrega a Android para que pueda ocurrir con la pantalla bloqueada o tras el cierre normal desde recientes, sin requerir JavaScript continuamente activo.
- **SPEC-004-R19 (comportamiento no deseado):** Si el usuario detiene forzosamente la aplicación, la aplicación no deberá prometer que la notificación programada se entregará.
- **SPEC-004-R20 (dependiente de estado):** Mientras la aplicación se ejecute en Android, la implementación deberá respetar la compatibilidad de Expo SDK 58 y documentar los permisos aplicables según la versión del sistema operativo.

## Requisito original pendiente de validación técnica

- **SPEC-004-P01 (pendiente; no aprobado como cumplido):** La solución deberá satisfacer el requisito original de que la alarma suene incluso con el celular en silencio, vibre y muestre un aviso en la pantalla de bloqueo.
- La notificación estándar y el canal definidos para la primera implementación respetan los ajustes del usuario; el silencio puede suprimir el sonido y los ajustes de Android pueden limitar la visibilidad en pantalla de bloqueo. Por ello, el alcance aprobado parcialmente no demuestra ni garantiza SPEC-004-P01.
- Se requiere investigar y validar por separado qué capacidades de Expo SDK 58 cubren este requisito y si hace falta implementación nativa adicional, qué permisos y restricciones implicaría y si la experiencia es compatible con los ajustes y políticas de Android.
- No se debe eliminar, degradar ni declarar satisfecho este requisito mientras no exista evidencia técnica y aprobación explícita del responsable.

## Compatibilidad y permisos Android

| Versión de Android | Consideración para la especificación |
| --- | --- |
| Android 8 o posterior | La notificación pertenece a un canal; el usuario puede cambiar sonido, vibración e importancia. |
| Android 12 o posterior | El acceso a alarmas exactas es distinto del permiso de notificaciones. No se solicita en la primera implementación. |
| Android 13 o posterior | Se documenta y solicita el permiso de notificaciones en tiempo de ejecución antes del primer Pomodoro. Si se deniega, el temporizador continúa. |

La compatibilidad base será la definida por Expo SDK 58. Esta especificación no establece una versión mínima de Android distinta de la compatibilidad del SDK. `bestEffort` puede retrasarse; no se garantiza puntualidad exacta. El modo silencio, No molestar, volumen, canal, permisos y preferencias del usuario pueden impedir señales. No se solicita acceso para omitir dichas restricciones.

## Criterios de aceptación

### SPEC-004-CA01: Solicitud y denegación de permiso

**Dado** que el usuario aún no ha iniciado su primer Pomodoro y Android requiere permiso de notificaciones,  
**Cuando** la aplicación explica y solicita ese permiso,  
**Entonces** si el usuario lo deniega puede iniciar el Pomodoro y el temporizador y ciclo funcionan sin una notificación presentada como entregada.

### SPEC-004-CA02: Programación y canal

**Dado** que el usuario concedió el permiso y una fase está por iniciar,  
**Cuando** inicia esa fase,  
**Entonces** queda programada una única notificación local para su vencimiento y el canal Android usa sonido predeterminado y vibración, sujeto a los ajustes del usuario.

### SPEC-004-CA03: Mensaje según la fase

**Dado** que una fase llega a su vencimiento,  
**Cuando** la fase terminada es de estudio,  
**Entonces** la notificación usa «Estudio terminado. Es momento de descansar»; y cuando la fase terminada es de descanso, usa «Descanso terminado. Es momento de estudiar».

### SPEC-004-CA04: Apertura desde la notificación

**Dado** que existe una notificación de fin de fase,  
**Cuando** el usuario la toca,  
**Entonces** se abre la aplicación y se muestra preparada la siguiente fase, sin iniciarla automáticamente.

### SPEC-004-CA05: Cancelación, reanudación y reinicio

**Dado** que una fase tiene una notificación programada,  
**Cuando** el usuario pausa la fase o solicita reiniciarla,  
**Entonces** se cancela esa notificación; si reanuda la fase o cancela un reinicio de una fase que estaba en ejecución, se programa solo la notificación correspondiente al vencimiento restaurado; si confirma el reinicio, no queda aviso de la ejecución anterior.

### SPEC-004-CA06: Sin duplicados

**Dado** que la misma ejecución se procesa o reconcilia más de una vez,  
**Cuando** la aplicación actualiza el estado o vuelve de segundo plano,  
**Entonces** no se presenta una segunda notificación para esa finalización.

### SPEC-004-CA07: Bloqueo, cierre normal y entrega aproximada

**Dado** que una fase tiene una notificación local permitida programada,  
**Cuando** se bloquea la pantalla o se retira la aplicación de recientes sin detenerla forzosamente,  
**Entonces** Android puede presentar el aviso mediante `bestEffort`, sujeto a permisos, canal y restricciones del sistema, y la aplicación no promete entrega exacta.

### SPEC-004-CA08: Operación sin conexión y detención forzada

**Dado** que el dispositivo no tiene conexión a Internet,  
**Cuando** se programa o entrega un aviso local,  
**Entonces** no se requiere servicio remoto; si el usuario detiene forzosamente la aplicación, no se garantiza la entrega.

### SPEC-004-CA09: Requisito original pendiente

**Dado** que el requisito original exige sonido incluso en silencio, vibración y aviso en pantalla de bloqueo,  
**Cuando** se evalúa el alcance aprobado parcialmente para la primera implementación,  
**Entonces** se registra que esas garantías todavía no están verificadas ni cumplidas y se mantiene pendiente la investigación técnica, sin declarar HU-004 completada.

## Estrategia de verificación preliminar

- Pruebas deterministas de programación única, pausa, reanudación, solicitud/cancelación de reinicio, confirmación de reinicio y deduplicación.
- Pruebas Android en un build de desarrollo y dispositivo físico para permiso concedido/denegado, canal, mensajes, apertura de la aplicación, bloqueo, cierre desde recientes y comportamiento offline.
- Registrar retrasos observados con `bestEffort`; no tratarlos como garantía de puntualidad ni como prueba de SPEC-004-P01.
- Validar el comportamiento tras detención forzada como limitación documentada, no como caso garantizado.
- Diseñar pruebas específicas para SPEC-004-P01 solo después de determinar técnicamente las capacidades y permisos necesarios.

## Matriz de trazabilidad

| Requisitos | Origen | Criterios |
| --- | --- | --- |
| R01-R04 | Decisiones DEC-004-01 y DEC-004-03; permiso y continuidad del temporizador | CA01-CA02 |
| R05-R06 | Decisión DEC-004-04; canal y preferencias | CA02 |
| R07-R10 | Decisión DEC-004-05; mensajes, transición y aviso visual | CA03-CA04 |
| R11-R12, R18-R20 | Decisiones DEC-004-02 y DEC-004-07; entrega, ciclo de vida y compatibilidad | CA07-CA08 |
| R13-R16 | Decisión DEC-004-06; pausa, reinicio y deduplicación | CA05-CA06 |
| R17 | Constitución y HU-006; operación offline | CA08 |
| P01 | Enunciado original de HU-004; pendiente de validación técnica | CA09 |

## Aprobación

- Decisiones autorizadas para la primera implementación: Sí, parcialmente, según `decisiones.md`.
- Requisito obligatorio de alarma incluso en silencio y aviso en pantalla de bloqueo: pendiente de validación técnica.
- Aprobación global de la especificación: Pendiente.
- Estado de HU-004: no completada.
- Implementación parcial: autorizada para HU004-T01–T07, por separado y con pruebas, según DEC-004-10 y `tasks.md`.
- HU004-T08 / SPEC-004-P01: investigación pendiente; implementación no autorizada hasta decisión y autorización específicas posteriores.
