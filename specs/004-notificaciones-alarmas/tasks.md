# Tareas: HU-004, notificaciones y alarmas

## Estado y puerta de ejecución

El responsable autorizó parcialmente la implementación de HU004-T01–T07 el 2026-10-19, por separado y con pruebas (DEC-004-10). El 2026-10-20 autorizó HU004-T09: canal versionado con sonido normal del sistema y vibración, sin permisos especiales (DEC-004-11). Estas autorizaciones no resuelven el sonido en modo silencio/No molestar ni la visibilidad garantizada en pantalla bloqueada; no aprueban globalmente la especificación ni permiten declarar HU-004 completada. T01 aún conserva pendiente validación en Android. `expo-notifications` ya está instalada; no se instalan dependencias. HU004-T08 conserva la investigación restante de SPEC-004-P01.

**Dependencia común de T01–T07:** iniciar cada tarea solo tras la solicitud explícita del responsable y respetar su orden de dependencias. Las tareas que necesiten validar la integración nativa requieren un Android development build. Esta solicitud no autoriza instalación de dependencias, builds ni commits.

## Dependencias nativas por tarea

| Tarea | Dependencia/capacidad nativa |
|---|---|
| HU004-T01 | Integra la única biblioteca nueva prevista: `expo-notifications`, compatible con Expo SDK 58. Al ser un módulo nativo, requiere regenerar/usar un Android development build para validar la integración. |
| HU004-T02 | Usa permisos de notificación expuestos por `expo-notifications`; no requiere otra biblioteca nativa. |
| HU004-T03 | Usa la API de canales de Android expuesta por `expo-notifications`; no requiere otra biblioteca nativa. |
| HU004-T04 | Usa programación local expuesta por `expo-notifications`; no requiere otra biblioteca nativa. |
| HU004-T05 | Usa respuestas a notificaciones con `expo-notifications` y navegación mediante Expo Router ya instalado; no requiere otra biblioteca nativa. |
| HU004-T06 | Usa cancelación/reprogramación con `expo-notifications` y la integración de estado existente; no requiere otra biblioteca nativa. |
| HU004-T07 | Requiere un development build y dispositivo Android físico para las pruebas; no añade una biblioteca. |
| HU004-T08 | Capacidad para modo silencio/No molestar y visibilidad garantizada no determinada. Investigación pendiente; no añadir permisos especiales sin autorización. |
| HU004-T09 | Usa la API de canal ya instalada de `expo-notifications`; cambio de ID/argumentos en JavaScript, sin dependencia ni permiso adicional. |

## Alcance inicial técnicamente definido y autorizado por tareas

### HU004-T01 — Integrar la dependencia y la configuración Android

- **Alcance:** primera tarea implementable dentro de la autorización parcial; ejecutar solo cuando el responsable la solicite.
- **Requisitos:** SPEC-004-R01, R05, R20.
- **Criterios:** CA02; compatibilidad técnica Android según CA07.
- **Áreas previstas:** `package.json`, `package-lock.json`, `app.json`, configuración Expo.
- **Depende de:** solicitud explícita para ejecutar HU004-T01; ninguna tarea de código HU-004.
- **Pasos:**
  1. Resolver e instalar `expo-notifications` con el mecanismo compatible con Expo SDK 58 (`npx expo install`) cuando se autorice ejecutar esta tarea.
  2. Revisar la configuración del config plugin documentada para SDK 58 y modificar configuración Expo únicamente si se requiere.
  3. Generar/actualizar un development build con la dependencia nativa; no editar `android/` ni `ios/` manualmente.
  4. Registrar permisos aplicables por versión Android y distinguir el permiso de notificación de alarmas exactas; no añadir solicitud de alarmas exactas.
- **Pruebas/evidencia:** confirmar compatibilidad de dependencias con SDK 58, compilar/iniciar el development build y verificar que la aplicación instala; revisar configuración final y documentar permisos. No solicitar push tokens ni configurar servicios remotos.
- **Hecho cuando:** dependencia y configuración compatibles con SDK 58 quedan integradas, el development build se ejecuta y la evidencia de instalación/configuración queda registrada sin cambios a archivos nativos generados manualmente.

#### Evidencia de ejecución

- **Estado:** Parcial; la dependencia y configuración Expo están preparadas, pero queda pendiente la validación en un Android development build.
- **Requisitos/criterios:** HU004-T01; SPEC-004-R01, R05 y R20; CA02 y compatibilidad Android de CA07. Esta evidencia no valida programación por fase, solicitud de permisos ni comportamiento físico.
- **Entorno:** Windows; Expo `58.0.16`, SDK `58.0.0`, `expo-notifications` `58.1.5`.
- **Dependencia:** `npm ls expo-notifications expo --depth=0` confirmó ambas versiones; `npx expo install --check` informó `Dependencies are up to date`. No se instaló ni reinstaló ningún paquete.
- **Configuración inicial:** `npx expo config --type prebuild --json` resolvió correctamente la configuración y mostró `expo-notifications` entre los módulos Android autolinked. El manifest Android del módulo declara `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED`; no declara acceso a alarmas exactas. No se configuraron push tokens ni servicios remotos.
- **Actualización autorizada por el responsable (2026-10-19):** se hace explícito el config plugin en `app.json` con notificaciones remotas deshabilitadas (solo se requieren notificaciones locales). El módulo Android declara sus permisos mediante su propio manifest. La documentación de Expo SDK 58 reserva `defaultChannel` para notificaciones FCM; por tanto, el canal local no se define con esa opción del plugin.
- **Canal Android original:** el canal `pomodoro-phase-end` se llegó a configurar con `sound: null`; Android conserva la configuración de un canal creado y el canal puede permanecer visible en ajustes. HU004-T09 cambia al ID `pomodoro-phase-end-v2`, omite la opción `sound` para usar el sonido del sistema según la API instalada y mantiene vibración. No crea sonido personalizado ni solicita permiso especial.
- **Pruebas automatizadas de la ejecución inicial:** `npm test -- --runInBand`: 8 suites y 81 pruebas aprobadas. `npx tsc --noEmit`: aprobado sin errores.
- **Pruebas de esta actualización:** `npm test -- --runInBand`: 9 suites y 82 pruebas aprobadas, incluida la prueba del canal local. `npx tsc --noEmit`: aprobado sin errores. `npx expo config --type prebuild --json`: configuración resuelta con el plugin `expo-notifications` y el autolinking Android. `npx expo-doctor`: 20/20 comprobaciones aprobadas.
- **Lint:** ESLint enfocado en los tres archivos de código modificados: aprobado. `npx expo lint` continúa fallando solo por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`.
- **Evidencia pendiente:** no se generó ni instaló un Android development build, según la instrucción del responsable. Queda pendiente validar instalación nativa y creación efectiva del canal en dispositivo; T01 no se declara totalmente probada.
- **Dependencia para HU004-T02:** no iniciada. Según la dependencia declarada, T02 espera a T01 y T01 aún no cumple su condición de finalización hasta validar el development build. Al implementar T02, la solicitud de permiso en Android 13+ deberá esperar a que termine la creación asíncrona del canal para que el sistema muestre el diálogo.
- **Autorización para avanzar con T02 (2026-10-19):** el responsable autorizó iniciar HU004-T02 aunque siga pendiente la validación física de T01, siempre que la configuración y las dependencias de código estén preparadas. `expo-notifications`, el config plugin y la creación asíncrona del canal están preparados. Esta excepción permite ejecutar T02, pero no cambia el estado parcial de T01 ni registra como realizada su validación en Android.

### HU004-T02 — Explicar y solicitar el permiso antes del primer Pomodoro

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R02–R04, R20.
- **Criterios:** CA01.
- **Áreas previstas:** flujo de inicio del primer Pomodoro y servicio de permisos; ubicación final por decidir según la arquitectura existente.
- **Depende de:** HU004-T01.
- **Pasos:**
  1. Presentar una explicación clara de que el permiso permite avisar al finalizar fases antes de solicitarlo por primera vez.
  2. Consultar el estado de permiso y solicitarlo solo cuando corresponda según la versión de Android.
  3. Si se deniega, permitir iniciar y usar el temporizador/ciclo normalmente y no informar que la notificación está programada o entregada.
  4. No confundir el permiso estándar de notificaciones con acceso especial a alarmas exactas.
- **Pruebas/evidencia:** pruebas deterministas de permiso concedido, denegado y no requerido; prueba manual Android de primer inicio; comprobar que la denegación no bloquea el Pomodoro ni el ciclo.
- **Hecho cuando:** la explicación antecede a la primera solicitud, los estados del permiso se tratan según Android, y las pruebas demuestran continuidad funcional al denegarlo.

#### Evidencia de ejecución

- **Estado:** Implementada y probada automáticamente; validación manual Android pendiente.
- **Requisitos/criterio:** HU004-T02; SPEC-004-R02–R04 y R20; CA01.
- **Autorización/dependencia:** ejecutada por solicitud explícita del responsable el 2026-10-19, con autorización de avanzar aunque siga pendiente la validación física de T01. La configuración y dependencias de código de T01 estaban preparadas. T01 permanece parcial y su validación con Android development build sigue pendiente.
- **Implementación:** antes de iniciar el Pomodoro, en Android 13 o posterior se comprueba el permiso. Si se puede solicitar, se explica primero el propósito y se permite continuar o iniciar sin solicitarlo. El canal Android se configura y su operación asíncrona termina antes de consultar/solicitar el permiso. Si el usuario deniega la solicitud, el temporizador inicia igualmente. En Android anterior a 13 no se solicita permiso en tiempo de ejecución. No se solicita acceso a alarmas exactas ni se añadieron dependencias.
- **Pruebas automatizadas:** permiso concedido, denegado, solicitud no disponible y permiso no requerido; orden de configuración del canal antes de consultar/solicitar; explicación previa y continuidad del Pomodoro al omitir o denegar el permiso.
- **Comandos:** `npm test -- --runInBand` — 10 suites y 90 pruebas aprobadas. `npx tsc --noEmit` — aprobado sin errores.
- **Lint:** `npx expo lint` falla únicamente por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`, archivo ajeno a T02.
- **Evidencia pendiente:** validar manualmente en Android 13+ el primer inicio, el orden del diálogo del sistema tras crear el canal y la continuidad al denegar; no se generó ni instaló un build, según la instrucción del responsable. La validación física pendiente de T01 también se conserva.
- **Límites:** no se implementó programación de notificaciones (T04), canal (T03), cambios de ciclo de vida ni manejo de alarmas en modo silencio. SPEC-004-P01/DEC-004-09 continúa pendiente y no se declara satisfecho.

### HU004-T03 — Configurar canal con sonido predeterminado y vibración

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R05–R06, R20.
- **Criterios:** CA02.
- **Áreas previstas:** servicio de notificaciones y configuración del canal Android.
- **Depende de:** HU004-T01.
- **Pasos:**
  1. Configurar un canal Android identificable para fin de fase con sonido predeterminado y patrón de vibración según el alcance aprobado.
  2. Respetar los ajustes existentes del canal y del usuario; no intentar alterar silencio o No molestar.
  3. Crear/configurar el canal antes de depender de su comportamiento en una notificación.
- **Pruebas/evidencia:** prueba de configuración del canal y prueba manual en Android 8+ con el canal habilitado; comprobar que los ajustes del sistema prevalecen si el usuario los cambia.
- **Hecho cuando:** el canal de fin de fase queda configurado para sonido predeterminado y vibración y la verificación muestra que la aplicación respeta los controles del sistema.

#### Evidencia de ejecución

- **Estado:** Implementación y pruebas automatizadas aprobadas; validación manual Android pendiente.
- **Requisitos/criterios:** HU004-T03; SPEC-004-R05–R06 y R20; CA02.
- **Implementación:** se reutiliza `src/features/notifications/notification-channel.ts`, ya preparado durante T01. Configura el canal `pomodoro-phase-end` en Android con importancia predeterminada, sonido predeterminado y vibración habilitada; no define un patrón personalizado ni intenta alterar silencio o No molestar. El canal se prepara al iniciar la aplicación y antes de consultar/solicitar el permiso en el flujo T02.
- **Pruebas automatizadas:** se verifica la configuración del canal Android, que no se intente configurar un canal en otras plataformas y que los errores de configuración se propaguen explícitamente. La continuidad del temporizador si el permiso se deniega está cubierta por las pruebas de HU004-T02 y pasó en la suite completa; no se amplía el alcance de T03.
- **Comandos:** `npm test -- --runInBand` — 10 suites y 92 pruebas aprobadas. `npx tsc --noEmit` — aprobado sin errores. `npx expo lint` — falla por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`, archivo ajeno a T03.
- **Evidencia pendiente:** comprobar en Android 8+ con un development build y dispositivo físico que el canal está habilitado y que los ajustes modificados por el usuario prevalecen. No se generó ningún build, según la instrucción del responsable.
- **Límites:** esta evidencia no valida programación de notificaciones (T04) ni satisface SPEC-004-P01/DEC-004-09; el requisito de alarma en modo silencio permanece pendiente.

### HU004-T04 — Programar una notificación local por cada fase

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R01, R07–R08, R11–R12, R16–R18, R20.
- **Criterios:** CA02–CA03, CA06–CA08.
- **Áreas previstas:** servicio nuevo bajo `src/features/`, `src/hooks/use-pomodoro-session.ts`, integración con el estado de sesión.
- **Depende de:** HU004-T01, HU004-T02, HU004-T03.
- **Pasos:**
  1. Programar una notificación local asociada al vencimiento al iniciar cada fase cuando el permiso lo permita, usando el comportamiento `bestEffort` previsto.
  2. Elegir contenido desde la fase que termina: mensaje de estudio o de descanso según SPEC-004-R07/R08.
  3. Vincular cada aviso a una ejecución concreta y hacer la operación idempotente, incluida la recuperación de sesión.
  4. Mantener el temporizador y el ciclo como fuente de verdad; no depender de JavaScript activo ni de conexión a Internet para que Android entregue el aviso.
  5. Evitar una segunda notificación cuando la fase termina mientras la aplicación está visible.
- **Pruebas/evidencia:** pruebas unitarias con reloj/servicio simulados para programación al inicio de estudio y descanso, contenido por fase, permiso denegado, una sola programación por ejecución, sin envío remoto y sin programación de avisos anticipados.
- **Hecho cuando:** cada fase permitida tiene como máximo un aviso local asociado a su vencimiento, el contenido identifica la fase terminada y la programación/reconciliación no duplica el evento.

#### Evidencia de ejecución

- **Estado:** Implementada; pruebas automatizadas aprobadas. La validación en Android development build y dispositivo físico sigue pendiente.
- **Requisitos/criterios:** HU004-T04; SPEC-004-R01, R07–R08, R11–R12, R16–R18 y R20; CA02–CA03 y CA06–CA08.
- **Implementación:** `src/features/notifications/pomodoro-phase-notification.ts` programa una notificación local con trigger de fecha y entrega `bestEffort`, tras preparar el canal y comprobar el permiso. El texto corresponde a la fase que termina. La ejecución se identifica con fase y vencimiento; se reutiliza un aviso ya programado y se deduplican solicitudes simultáneas. El servicio no usa APIs de push ni red. `use-pomodoro-session.ts` programa al iniciar y al restaurar una fase en ejecución, sin cambiar el formato persistido; no agenda una fase cuyo vencimiento ya pasó.
- **Pruebas automatizadas:** programación de estudio y descanso, contenido, entrega `bestEffort`, permiso denegado, fase vencida, recuperación de aviso existente y llamadas simultáneas; integración de inicio y recuperación/retorno a primer plano en la sesión.
- **Comandos en la puerta T04:** `npm test -- --runInBand` — 11 suites y 101 pruebas aprobadas. `npx tsc --noEmit` — aprobado sin errores.
- **Evidencia pendiente:** observar en un Android development build y dispositivo físico el comportamiento y retraso de entrega `bestEffort`, los mensajes de ambas fases y el escenario offline, sin tratar el resultado como garantía de puntualidad. No se generó APK ni build por instrucción del responsable; la validación Android de T01 también sigue pendiente.
- **Límites:** no se implementa cancelación/reprogramación por pausa o reinicio (T06). No se afirma cumplimiento de SPEC-004-P01/DEC-004-09: la alarma audible en modo silencio y el aviso de pantalla de bloqueo continúan pendientes.

### HU004-T05 — Abrir la aplicación desde el aviso y comunicar la fase terminada

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R07–R10.
- **Criterios:** CA03–CA04.
- **Áreas previstas:** respuesta a notificaciones en `src/app/_layout.tsx` y pantalla existente del temporizador.
- **Depende de:** HU004-T04.
- **Pasos:**
  1. Manejar la interacción con el aviso tanto si la aplicación ya está activa como si se abre desde segundo plano/cerrada normalmente.
  2. Abrir la pantalla de temporizador y mostrar la siguiente fase ya preparada, sin iniciarla automáticamente.
  3. En primer plano, ofrecer una indicación visual accesible de finalización sin presentar una segunda notificación para la misma ejecución.
- **Pruebas/evidencia:** pruebas de respuesta inicial y respuesta en ejecución; comprobar navegación y fase preparada; prueba de que no se inicia por tocar el aviso; verificación de señal accesible y no duplicación en primer plano.
- **Hecho cuando:** tocar la notificación abre la aplicación en el estado especificado y el procesamiento de la respuesta no ejecuta dos veces la transición de HU-002.

#### Evidencia de ejecución

- **Estado:** Implementada; pruebas automatizadas aprobadas. La interacción debe validarse manualmente en Android.
- **Requisitos/criterios:** HU004-T05; SPEC-004-R07–R10; CA03–CA04.
- **Implementación:** `src/features/notifications/pomodoro-notification-response.ts` procesa respuestas recibidas en ejecución y la última respuesta que abrió la aplicación, ignora avisos ajenos a Pomodoro, deduplica la respuesta y navega con Expo Router a la pestaña del temporizador. No altera el ciclo ni inicia el timer desde el toque; la recuperación/finalización existente deja preparada la siguiente fase. La sesión expone la fase recién completada y la pantalla presenta un mensaje accesible con rol `alert` y `accessibilityLiveRegion="polite"`.
- **Pruebas automatizadas:** respuesta en ejecución y de inicio en frío, avisos ajenos, respuesta duplicada, limpieza del listener y mensaje accesible con la siguiente fase preparada y sin invocar `start`.
- **Comandos de validación final:** `npm test -- --runInBand` — 12 suites y 107 pruebas aprobadas. `npx tsc --noEmit` — aprobado sin errores. `npx expo lint` — falla únicamente por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`, archivo ajeno a T04/T05.
- **Evidencia pendiente:** comprobar en Android development build el toque con la aplicación activa, en segundo plano y después del cierre normal desde recientes, y verificar la fase preparada en dispositivo. No se generó APK ni build por instrucción del responsable. También se conserva pendiente la validación física Android de T01 y la prueba del canal de T03.
- **Límites:** esto no valida bloqueo/cierre normal de extremo a extremo (T07), ni cancelación/reprogramación de T06, ni satisface SPEC-004-P01/DEC-004-09. HU-004 no está completada.

### HU004-T06 — Cancelar y reprogramar al pausar, reanudar o reiniciar

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R13–R16, R18.
- **Criterios:** CA05–CA06.
- **Áreas previstas:** servicio de notificaciones, `src/hooks/use-pomodoro-session.ts`, integración con recuperación existente.
- **Depende de:** HU004-T04; coordinar con HU004-T05 para evitar doble finalización.
- **Pasos:**
  1. Cancelar el aviso de la ejecución activa al pausar o solicitar reinicio.
  2. Reprogramar el aviso con el vencimiento restaurado al reanudar o cancelar un reinicio de una fase que estaba corriendo.
  3. Mantener cancelado el aviso al confirmar el reinicio; no programar aviso mientras la fase permanece pausada.
  4. Reconciliar avisos pendientes al restaurar la sesión y volver a primer plano sin duplicar, revivir avisos cancelados ni alterar el resultado del ciclo.
  5. Preservar la lógica y el formato persistido de HU-003, salvo que una necesidad justificada requiera una decisión aprobada antes del cambio.
- **Pruebas/evidencia:** pruebas deterministas de pausa, reanudación, solicitud/cancelación/confirmación de reinicio, recuperación, carrera de cancelación/reprogramación y múltiples reconciliaciones; ejecutar las pruebas existentes de temporizador, ciclo y persistencia de HU-001–HU-003.
- **Hecho cuando:** cada transición deja como máximo un aviso válido para la ejecución vigente, no queda aviso activo para fases pausadas/reiniciadas, y las pruebas de no regresión aprobadas siguen pasando.

#### Evidencia de ejecución

- **Estado:** Implementada; regresión automatizada aprobada. La comprobación física de Android continúa pendiente como parte de T07.
- **Requisitos/criterios:** HU004-T06; SPEC-004-R13–R16 y R18; CA05–CA06.
- **Implementación:** `pomodoro-phase-notification.ts` serializa operaciones de agenda, cancelación y reconciliación; cancela avisos obsoletos y conserva como máximo un aviso para la ejecución vigente. `use-pomodoro-session.ts` reconcilia al iniciar/restaurar, pausar, reanudar, solicitar/cancelar/confirmar reinicio, completar una fase y volver a primer plano. No se cambió el formato persistido ni la lógica de ciclo/temporizador de HU-001–HU-003.
- **Pruebas automatizadas:** cubren pausa y reanudación con vencimiento restaurado, solicitud/cancelación/confirmación de reinicio, recuperación pausada, reconciliación al volver a primer plano, cancelación idempotente, limpieza de avisos obsoletos/duplicados, serialización de cancelación concurrente con agenda y reconciliaciones repetidas.
- **Comandos:** `npm test -- --runInBand` — 12 suites y 116 pruebas aprobadas; `npx tsc --noEmit` — aprobado sin errores.
- **Lint:** `npx expo lint` continúa fallando únicamente por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; no reporta errores en los archivos de T06.
- **Evidencia pendiente:** escenarios físicos de canal, permisos, entrega, pantalla bloqueada, cierre normal desde recientes, interacción con avisos y modo offline quedan pendientes de T07; no se generó un build por instrucción del responsable.
- **Límites:** T06 no resuelve SPEC-004-P01/DEC-004-09. El requisito original de alarma en modo silencio permanece pendiente.

### HU004-T07 — Validar entrega local en Android y regresión

- **Alcance:** autorizado parcialmente; ejecutar solo cuando el responsable lo solicite.
- **Requisitos:** SPEC-004-R05–R06, R17–R20.
- **Criterios:** CA01–CA08, excluyendo cualquier afirmación de cumplimiento de CA09/P01.
- **Áreas previstas:** pruebas existentes, development build y dispositivos Android físicos; sin archivos nativos editados manualmente.
- **Depende de:** HU004-T01–T06.
- **Pasos:**
  1. Ejecutar las pruebas automatizadas específicas y la suite de regresión disponible de HU-001, HU-002 y HU-003.
  2. En dispositivo físico, verificar permiso concedido/denegado, canal, mensajes de ambas fases y toque del aviso.
  3. Dejar vencer una fase con pantalla bloqueada y con la aplicación retirada de recientes mediante cierre normal; registrar condiciones y retraso observado.
  4. Repetir sin conexión y comprobar que no se requiere servicio remoto.
  5. Confirmar/documentar que tras detención forzada no se garantiza entrega y que `bestEffort` no ofrece hora exacta.
- **Pruebas/evidencia:** registrar modelo/versión Android/build, estado de permisos/canal, procedimiento y resultado por escenario; no convertir un solo resultado manual en garantía para todos los fabricantes.
- **Hecho cuando:** existe evidencia reproducible de los escenarios indicados, regresión aprobada, limitaciones documentadas y ningún resultado se presenta como validación de P01.

#### Evidencia de ejecución

- **Estado:** Regresión automatizada aprobada; una parte de la prueba física se ejecutó y registró abajo. T07 permanece incompleta porque otros escenarios requeridos no se reportaron.
- **Requisitos/criterios:** HU004-T07; SPEC-004-R05–R06 y R17–R20; CA01–CA08, excluyendo CA09/P01.
- **Entorno automatizado:** Windows; Expo `58.0.16`; `expo-notifications` `58.1.5`. No se generó ni instaló un Android development build, conforme a la instrucción del responsable.
- **Regresión:** `npm test -- --runInBand` — 12 suites y 116 pruebas aprobadas, incluidas pruebas existentes de temporizador, ciclo y persistencia; `npx tsc --noEmit` — aprobado sin errores.
- **Lint:** `npx expo lint` no queda limpio por el diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`; no se detectaron errores de lint en los archivos de notificaciones/sesión modificados.
- **Pruebas manuales Android pendientes:** registrar modelo, versión del SO y build; verificar permiso concedido y denegado (incluido Android 13+), canal y prevalencia de ajustes del usuario; comprobar ambos mensajes y el toque con la app activa, en segundo plano y tras cierre normal desde recientes; repetir offline y anotar retrasos `bestEffort`. Los escenarios no reportados no se consideran aprobados. La validación restante de T01 (integración/build), T03 (canal), T04 (entrega local) y T05 (interacción) sigue pendiente.
- **Limitaciones documentadas, no garantías probadas:** no prometer entrega tras detención forzada ni una hora exacta; Android, Doze, batería, permisos, canal y fabricante pueden modificar o retrasar la entrega.
- **Requisito pendiente:** SPEC-004-P01/DEC-004-09 — alarma audible y vibración en modo silencio/No molestar — sigue sin cumplirse ni aprobarse. La aparición de la notificación en pantalla bloqueada fue observada en las pruebas informadas, pero no se convierte en garantía general ni valida el requisito combinado.

#### Resultado de prueba física comunicado por el responsable (2026-10-20)

- **Entorno conocido:** un celular Android físico. No se proporcionaron modelo, versión Android, número de build, configuración detallada del permiso/canal ni secuencia reproducible; esos datos quedan sin registrar, no asumidos.
- **Modo normal:** **aprobada para esta ejecución únicamente** la observación reportada: al terminar la fase con la pantalla bloqueada, apareció la notificación, sonó y vibró.
- **Modo silencio:** **aprobada para esta ejecución únicamente** la observación de que apareció la notificación. No se especificó si apareció en la pantalla bloqueada; no se observó sonido ni vibración, resultado negativo respecto de la exigencia original.
- **Aprobaciones limitadas:** la presentación en pantalla bloqueada, el sonido y la vibración se observaron solo en modo normal. En modo silencio se observó únicamente la aparición de la notificación y la ausencia de sonido/vibración. No se marca como aprobada ninguna prueba de cierre desde recientes, modo offline, permisos denegados, mensajes/toque, entrega puntual ni otros dispositivos.
- **Estado de aceptación:** esta evidencia no completa T07 ni HU-004. CA09/SPEC-004-P01 permanece explícitamente pendiente de investigación, decisión y validación; no se modifica el permiso, el canal ni los ajustes del dispositivo.

## Requisito obligatorio pendiente de decisión/capacidad

### HU004-T08 — Investigar y resolver SPEC-004-P01: alarma en silencio y pantalla de bloqueo

- **Estado:** investigación/validación restantes pendientes. HU004-T09 implementa sonido normal del sistema y vibración; P01 no está aprobado como cumplido.
- **Alcance:** fuera de la primera implementación hasta que exista evidencia técnica y decisión explícita del responsable. La tarea reserva la investigación y la validación; no autoriza por sí sola una capacidad que omita ajustes de Android/usuario.
- **Requisito:** SPEC-004-P01 y DEC-004-09.
- **Criterio:** CA09; debe permanecer pendiente hasta completar las fases y aprobaciones requeridas.
- **Depende de:** investigación técnica en documentación SDK 58/Android y decisión explícita del responsable sobre el comportamiento aceptable, permisos y capacidad nativa; cualquier implementación necesita autorización propia.
- **Áreas previstas:** análisis técnico Expo/Android; si se aprueba, configuración Expo/CNG, permisos y módulo o integración nativa aprobada. Nunca editar manualmente `android/` o `ios/`.
- **Fases:**
  1. Documentar por separado si Expo SDK 58 puede emitir sonido con el teléfono en silencio, vibrar y mostrar el aviso en pantalla de bloqueo; distinguir comportamiento verificable de comportamiento condicionado por permisos, canal, privacidad, No molestar y fabricante.
  2. Si la solución estándar no cubre P01, identificar alternativas nativas, permisos, restricciones, elegibilidad/distribución y consecuencias para los ajustes del usuario; no seleccionar ni implementar una alternativa sin decisión.
  3. Presentar evidencia y opciones al responsable; registrar la decisión aprobada en la fuente SDD correspondiente.
  4. Solo después de autorización específica, implementar la opción aceptada y validar sonido en silencio, vibración y presentación en pantalla de bloqueo en los dispositivos/estados aprobados.
- **Pruebas/evidencia:** matriz de capacidades por versión/plataforma y fuente oficial; prueba física para cada garantía autorizada y cada estado relevante; registro explícito de limitaciones o resultados negativos.
- **Hecho cuando:** la investigación tiene evidencia y decisión registrada; si se autoriza implementación, cada parte de P01 tiene prueba verificable y aceptación explícita. Hasta entonces la tarea permanece bloqueada/incompleta y HU-004 no puede declararse completada.

### HU004-T09 — Usar sonido normal del sistema y canal versionado

- **Estado:** Implementada; Jest y TypeScript aprobados el 2026-10-20. Lint global conserva un error preexistente. Resultado físico parcial registrado en HU004-T07; SPEC-004-P01 continúa pendiente.
- **Autorización:** Solicitud explícita del responsable del 2026-10-20 (DEC-004-11).
- **Requisitos/criterios:** SPEC-004-R05–R06; alcance parcial de SPEC-004-P01; CA02 y CA09.
- **Cambios:** Actualizar el ID del canal a `pomodoro-phase-end-v2`, omitir `sound` en `setNotificationChannelAsync` (la API instalada usa el sonido predeterminado del sistema cuando se omite) y mantener `enableVibrate: true`. La prueba comprueba el nuevo ID y que no se pasa una opción de sonido personalizado.
- **Restricciones:** No usar `sound: 'default'`, añadir archivos de sonido, dependencias ni permisos especiales. No cambiar el sonido en modo silencio/No molestar ni prometer vibración/visibilidad si el sistema o el usuario las suprimen. P01 permanece sin aprobación.
- **Pruebas/evidencia:** `npm test -- --runInBand` — 17 suites/158 pruebas aprobadas tras añadir el harness temporal; `npx tsc --noEmit` — aprobado sin errores; `npx expo lint` — falla por diagnóstico preexistente `react-hooks/set-state-in-effect` en `src/hooks/use-color-scheme.web.ts:11`, archivo sin cambios. La validación manual parcial está registrada en HU004-T07. Modo silencio/No molestar no se declara aprobado para sonido ni vibración.
- **APK:** El canal se configura en runtime y no cambió código nativo, plugin ni manifiesto. Como el proyecto no incluye `expo-updates`, un APK de distribución ya instalado no recibe el JavaScript nuevo: para probar en ese APK de producción hay que generar e instalar otro APK. No hace falta regenerar el proyecto nativo para cambiar la opción del canal; un development build ya instalado puede probar la actualización cargando el JavaScript desde Metro.

### Harness temporal de prueba HU-004 — fase de estudio de 10 segundos

- **Estado:** Retirado el 2026-10-20 antes de preparar el APK Preview final. No forma parte del comportamiento de producción ni cambia la especificación funcional de HU-004.
- **Autorización:** Excepción limitada autorizada explícitamente por el responsable el 2026-10-20, aunque HU-004 siga en borrador. Se limita a un harness temporal e aislado para validar avisos y no autoriza cambios de producto, permisos adicionales ni la resolución de SPEC-004-P01.
- **Aislamiento:** El perfil EAS `hu004-test` hereda el development APK y define `EXPO_PUBLIC_HU004_TEST_MODE=1`. `app.config.js` cambia nombre e identificador Android a `com.jennyferg.PomodoroCotopaxi.hu004test`; los datos y notificaciones pertenecen a otra instalación. En modo de prueba la sesión se inicia limpia con 10 segundos, no lee ni escribe la sesión persistida y el flag solo surte efecto con `__DEV__`. La configuración predeterminada de estudio continúa en 25 minutos.
- **Protección de release:** `app.config.js` rechaza el flag en perfiles EAS que no sean `development` o `hu004-test`. Los perfiles `preview` y `production` conservan el identificador de producción cuando se ejecutan sin el flag.
- **Archivos:** `eas.json`, `app.config.js`, `src/features/testing/hu004-test-mode.ts`, `src/hooks/use-pomodoro-session.ts` y `src/hooks/__tests__/use-pomodoro-session-test.ts`.
- **Evidencia automatizada histórica:** antes de retirar el harness, `npm test -- --runInBand` — 17 suites y 158 pruebas aprobadas; `npx tsc --noEmit` — aprobado; ESLint enfocado en los archivos del harness/sesión — aprobado. Se conserva este resultado histórico.
- **Validación de configuración:** `npx expo config --type public --json` confirmó el nombre de prueba y paquete `.hu004test` con el flag, y el nombre/paquete de producción sin él. El flag con un perfil EAS no-development se rechazó como esperado.
- **Evidencia física:** prueba manual parcial comunicada el 2026-10-20; consultar HU004-T07. No completar con supuestos los campos del modelo, versión del sistema o build que no fueron proporcionados.
- **Retirada ejecutada:** se eliminó el perfil EAS `hu004-test`, la configuración dinámica `app.config.js`, el selector `src/features/testing/hu004-test-mode.ts`, la lógica condicional de `src/hooks/use-pomodoro-session.ts` y la prueba específica del modo temporal en `src/hooks/__tests__/use-pomodoro-session-test.ts`. Se mantiene el arranque y persistencia normales de sesión.
- **Validación posterior a la retirada:** `npm test -- --runInBand` — 17 suites y 157 pruebas aprobadas; la prueba eliminada era únicamente la del harness temporal. `npx tsc --noEmit` — aprobado sin errores. `npx expo config --type public --json` resolvió la configuración estática de producción con el paquete normal `com.jennyferg.PomodoroCotopaxi`.
- **APK Preview:** `eas.json` conserva `preview.distribution: "internal"` y `preview.android.buildType: "apk"`; no activa `developmentClient`. El APK Preview es instalable y autónomo, no requiere Metro. No se ejecutó EAS Build.
