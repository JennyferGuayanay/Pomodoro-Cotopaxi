# Decisiones: HU-004, notificaciones y alarmas

## Estado

**Aprobación parcial.** Las decisiones de alcance inicial que siguen están autorizadas para la primera implementación. La especificación completa y HU-004 no están aprobadas ni completadas: el requisito original de alarma incluso con el teléfono en silencio y de aviso en pantalla de bloqueo requiere validación técnica adicional.

- Historia de origen: `docs/historias/HU-004.md`.
- Especificación asociada: `specs/004-notificaciones-alarmas/spec.md`.
- Dependencias funcionales: HU-001, HU-002 y HU-003.
- Constitución aplicable: `docs/constitution.md`.
- Fecha: 2026-10-19.
- Responsable: responsable del producto; decisiones autorizadas expresamente para esta revisión.
- La autorización parcial para implementación de DEC-004-10 permite ejecutar HU004-T01–T07 por separado y con sus pruebas, sin esperar la resolución de DEC-004-09. No constituye aprobación global de la especificación ni de HU-004.

## Contexto técnico

- El proyecto utiliza Expo SDK 58 y React Native; Expo/CNG genera la configuración nativa. No se deben crear ni editar manualmente `android/` o `ios/`.
- `expo-notifications` es la solución autorizada para programar notificaciones locales. No se instala ninguna dependencia en esta revisión.
- En Android 8 o posterior las notificaciones utilizan canales. En Android 13 o posterior se requiere permiso de notificaciones en tiempo de ejecución. El acceso a alarmas exactas es distinto del permiso de notificaciones y no forma parte de la primera implementación.
- Las notificaciones locales no requieren conexión a Internet ni que JavaScript permanezca ejecutándose. Las restricciones del sistema y del fabricante pueden afectar la entrega.

## Decisiones autorizadas para la primera implementación

### DEC-004-01: Notificación local por fase

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** Avisar al terminar cada fase, incluso si la aplicación no está visible (HU-004; SPEC-004-R01 a R02).
- **Opciones consideradas:** Programación local del sistema; detección del vencimiento solo mientras la aplicación está activa; combinación de ambas como avisos independientes.
- **Decisión:** Utilizar `expo-notifications` y programar una notificación local por cada fase iniciada, asociada a su vencimiento. La notificación no dependerá de red.
- **Consecuencias:** Debe cancelarse o actualizarse al cambiar el estado de la fase y evitarse una segunda notificación para la misma ejecución. La alerta visual en primer plano no debe duplicar la notificación.
- **Documentos afectados:** `spec.md`.

### DEC-004-02: Modalidad inicial y alarmas exactas

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** Android puede diferir notificaciones programadas; la alarma exacta puede requerir acceso especial (SPEC-004-R09 a R10).
- **Opciones consideradas:** `bestEffort`; pedir acceso especial a alarmas exactas; solicitar una modalidad exacta sujeta a elegibilidad y políticas de distribución.
- **Decisión:** Empezar con entrega `bestEffort`. No solicitar permisos especiales de alarma exacta en la primera implementación.
- **Consecuencias:** Documentar que Android o el fabricante pueden retrasar la notificación. No prometer entrega puntual. Cualquier cambio a alarmas exactas requiere una decisión posterior.
- **Documentos afectados:** `spec.md`.

### DEC-004-03: Permiso de notificaciones

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** El usuario debe poder entender por qué se solicitan notificaciones y una denegación no puede impedir el uso del temporizador (SPEC-004-R03 a R04).
- **Opciones consideradas:** Solicitar el permiso durante la configuración inicial; solicitarlo al activar avisos; explicarlo y solicitarlo antes del primer Pomodoro.
- **Decisión:** Explicar y solicitar el permiso de notificaciones antes de iniciar el primer Pomodoro. Si el usuario lo deniega, el temporizador y el ciclo siguen funcionando.
- **Consecuencias:** No se presenta como entregada una notificación que no pudo programarse o mostrarse. En Android 13 o posterior se documenta el permiso en tiempo de ejecución; la solicitud no implica acceso a alarmas exactas.
- **Documentos afectados:** `spec.md`.

### DEC-004-04: Canal, sonido y vibración

- **Estado:** Aprobada parcialmente para la primera implementación; no resuelve el requisito de sonido en silencio.
- **Contexto y requisito:** El aviso debe tener sonido y vibración sin anular los ajustes del sistema (SPEC-004-R05 a R06).
- **Opciones consideradas:** Usar el canal de notificación de Android; reproducir sonido propio; solicitar acceso para alterar el modo silencio o No molestar.
- **Decisión:** Configurar un canal Android con sonido predeterminado y vibración, respetando los ajustes del usuario. No solicitar acceso para omitir No molestar ni cambiar el modo silencio.
- **Consecuencias:** El usuario y Android pueden silenciar o modificar el canal. Esta decisión no satisface ni sustituye el requisito original de que la alarma suene incluso con el celular en silencio; ese requisito queda pendiente (DEC-004-09).
- **Documentos afectados:** `spec.md`.

### DEC-004-05: Mensaje y acción de la notificación

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** El mensaje debe identificar la fase completada y la interacción debe ser coherente con el ciclo (SPEC-004-R07 a R08).
- **Opciones consideradas:** Mensaje genérico o distinto por fase; abrir la aplicación sin preparar el ciclo o mostrar la fase siguiente preparada.
- **Decisión:** Para una fase de estudio, mostrar «Estudio terminado. Es momento de descansar». Para una fase de descanso, mostrar «Descanso terminado. Es momento de estudiar». Al tocar la notificación, abrir la aplicación y mostrar la siguiente fase preparada, sin iniciarla automáticamente.
- **Consecuencias:** La transición debe respetar HU-002 y no duplicar el procesamiento de finalización.
- **Documentos afectados:** `spec.md`.

### DEC-004-06: Pausa, reanudación y reinicio

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** Las notificaciones de ejecuciones suspendidas o reiniciadas no deben aparecer más tarde (SPEC-004-R11 a R14).
- **Opciones consideradas:** Conservar avisos a través de cambios de estado; cancelarlos y programarlos de nuevo cuando la ejecución válida se reanude.
- **Decisión:** Cancelar la notificación pendiente al pausar o al solicitar un reinicio. Reprogramarla al reanudar una fase o al cancelar un reinicio si la fase anterior estaba en ejecución. Si estaba pausada, mantenerla sin aviso. Si se confirma el reinicio, mantener cancelada la notificación anterior hasta que se inicie una nueva fase.
- **Consecuencias:** Las operaciones de cancelar y programar deben ser idempotentes y evitar avisos duplicados, incluso durante la recuperación del estado.
- **Documentos afectados:** `spec.md`.

### DEC-004-07: Bloqueo, cierre y permisos por versión

- **Estado:** Aprobada parcialmente para la primera implementación.
- **Contexto y requisito:** La notificación local debe poder presentarse sin que la aplicación permanezca abierta, dentro de los límites de Android (SPEC-004-R09 a R10).
- **Opciones consideradas:** Limitar la cobertura a la aplicación visible; cubrir bloqueo y cierre normal desde recientes; prometer también entrega tras detención forzada.
- **Decisión:** Cubrir el bloqueo de pantalla y el cierre normal al retirar la aplicación de recientes. No prometer funcionamiento después de una detención forzada.
- **Consecuencias:** Usar compatibilidad Android de Expo SDK 58 y documentar los permisos y diferencias según versión: canales desde Android 8; permiso de notificaciones en tiempo de ejecución desde Android 13; el acceso a alarmas exactas desde Android 12 no se solicita inicialmente.
- **Documentos afectados:** `spec.md`.

## Requisito obligatorio pendiente

### DEC-004-09: Alarma audible en silencio y aviso en pantalla de bloqueo

- **Estado:** Pendiente de investigación y validación técnica. No aprobado como resuelto ni como cumplido.
- **Contexto y requisito original:** El enunciado de HU-004 exige que la alarma suene incluso con el celular en silencio, que vibre y que muestre un aviso en la pantalla de bloqueo.
- **Contradicción:** DEC-004-04 establece que el canal respeta los ajustes del usuario. Si el modo silencio impide el sonido, la notificación estándar no puede garantizar simultáneamente que suene y que se respete ese ajuste. La visualización en pantalla de bloqueo también puede depender de permisos, ajustes de privacidad y comportamiento de Android.
- **Opciones por investigar, sin decisión:** Determinar si `expo-notifications` y la configuración estándar de Expo SDK 58 pueden satisfacer cada parte; identificar qué capacidad o implementación nativa adicional sería necesaria; determinar sus permisos, restricciones de plataforma y distribución, y si respeta las políticas del dispositivo y del usuario.
- **Consecuencias:** Mantener el requisito original trazable en `spec.md` como pendiente técnico. No eliminarlo, reducirlo a un aviso ordinario ni declarar HU-004 completada. La resolución requiere evidencia técnica y decisión explícita del responsable.
- **Documentos afectados:** `spec.md`; la aprobación global de HU-004 permanece pendiente.

### DEC-004-10: Autorización parcial de implementación por tareas

- **Estado:** Aprobada parcialmente por el responsable el 2026-10-19.
- **Contexto y requisitos:** Se requiere iniciar la primera implementación de las capacidades de notificación local técnicamente definidas, mientras SPEC-004-P01/DEC-004-09 permanece sin resolver (SPEC-004-R01 a R20).
- **Opciones consideradas:** Esperar a resolver P01 antes de cualquier implementación; o autorizar de forma acotada las tareas definidas del alcance ordinario y mantener P01 como puerta independiente.
- **Decisión:** Autorizar HU004-T01–T07 para implementación independiente, una tarea a la vez y con pruebas según `tasks.md`: integración de `expo-notifications`, explicación/solicitud de permisos, canal Android con sonido predeterminado y vibración, programación local, respuesta al aviso, cancelación/reprogramación y validación del alcance parcial. Cada tarea se inicia mediante solicitud explícita del responsable. HU004-T01 es la primera tarea autorizada y requiere `expo-notifications` compatible con Expo SDK 58.
- **Consecuencias:** Esta autorización no instala dependencias ni inicia tareas por sí sola; tampoco aprueba globalmente `spec.md` ni cambia el estado de HU-004. HU004-T08 y cualquier implementación destinada a satisfacer P01 requieren investigación técnica, decisión y autorización específicas posteriores. No eliminar ni reducir P01 o sus criterios de aceptación.
- **Documentos afectados:** `spec.md`, `plan.md` y `tasks.md`.

## Fuentes técnicas de referencia

- [Expo SDK 58: Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications.md).
- [Expo SDK 58: Haptics](https://docs.expo.dev/versions/v58.0.0/sdk/haptics.md).
- [Expo SDK 58: Audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio.md).
- [Documentación de Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) y [índice de documentación Expo](https://docs.expo.dev/llms.txt).
- [Android: permiso de notificaciones](https://developer.android.com/develop/ui/compose/notifications/notification-permission).
- [Android: canales de notificación](https://developer.android.com/develop/ui/compose/notifications/channels).
- [Android: alarmas](https://developer.android.com/develop/background-work/services/alarms).

## Puerta SDD

La autorización parcial de DEC-004-10 permite implementar HU004-T01–T07 por separado, tras la solicitud explícita de cada tarea y con las pruebas definidas. No es aprobación global de `spec.md` ni de HU-004. DEC-004-09/SPEC-004-P01 continúa pendiente de investigación, decisión y autorización específica; HU004-T08 no queda autorizada para implementación. No declarar HU-004 completada mientras P01 siga sin resolverse y validarse.
