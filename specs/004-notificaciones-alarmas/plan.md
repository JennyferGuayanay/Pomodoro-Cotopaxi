# Plan: HU-004, notificaciones y alarmas de fin de fase

## Estado y autorización

- **HU-004:** no aprobada globalmente ni completada; su archivo de historia permanece en borrador.
- **Especificación y decisiones:** aprobación parcial para el alcance inicial; SPEC-004-P01 sigue pendiente.
- **Autorización limitada de implementación (DEC-004-10):** el responsable autorizó HU004-T01–T07 por separado y con pruebas, sin esperar a resolver P01. Cada tarea requiere solicitud explícita para iniciar. Esta autorización no aprueba globalmente la especificación, no autoriza HU004-T08 ni permite declarar HU-004 completada.
- **Requisito pendiente:** SPEC-004-P01/DEC-004-09 (alarma audible en silencio, vibración y aviso en pantalla de bloqueo) requiere investigación, decisión y autorización específica; sigue pendiente.
- **Fecha de la autorización:** 2026-10-19.

## Fuentes

- `docs/constitution.md`
- `docs/historias/HU-004.md`
- `specs/004-notificaciones-alarmas/decisiones.md`
- `specs/004-notificaciones-alarmas/spec.md`
- Documentación oficial consultada: [Expo SDK 58 Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications.md) y [índice de documentación de Expo](https://docs.expo.dev/llms.txt), 2026-10-19.

## Objetivo

Preparar una implementación Android que programe una notificación local por fase, respete permisos y ajustes del sistema, y conserve las transiciones y recuperación existentes del temporizador. La planificación incluye los mensajes definidos para cada fase, la apertura de la aplicación al tocar el aviso y pruebas de bloqueo y cierre normal.

## Alcance planificado

### Alcance inicial autorizado para implementación por tareas

- Añadir `expo-notifications` mediante la resolución de versión compatible con Expo SDK 58.
- Configurar el canal Android de fin de fase con sonido predeterminado y vibración, sujetos a la configuración del sistema y a los ajustes del usuario.
- Explicar el propósito y solicitar el permiso de notificaciones antes del primer Pomodoro. Si se deniega, permitir que el temporizador y el ciclo continúen sin representar el aviso como entregado.
- Programar localmente una notificación al iniciar cada fase, con entrega Android `bestEffort` y sin depender de red.
- Usar el mensaje de fase de estudio o descanso establecido en SPEC-004-R07/R08. Al tocar el aviso, abrir la aplicación con la siguiente fase preparada, sin iniciarla automáticamente.
- Cancelar y reprogramar de forma idempotente al pausar, reanudar, solicitar/cancelar un reinicio, confirmar un reinicio y recuperar el estado.
- Evitar avisos repetidos para una misma ejecución y evitar que el aviso de primer plano duplique la notificación.
- Probar el permiso concedido/denegado, canales y contenido en Android real, con pantalla bloqueada y después de retirar la aplicación de recientes; documentar la limitación de detención forzada.
- Mantener la operación local sin conexión y sin prometer entrega exacta.

### Fuera de la autorización de implementación parcial

- **SPEC-004-P01 / DEC-004-09:** alarma audible incluso con el teléfono en silencio, vibración y aviso visible en pantalla de bloqueo. HU004-T08 queda reservada para investigar capacidades y restricciones de Expo SDK 58/Android, e identificar si hace falta capacidad nativa adicional. No se da por satisfecho P01 con el canal ordinario; su implementación requiere decisión y autorización específicas posteriores, y no debe alterar silenciosamente los ajustes del usuario.
- No solicitar acceso especial a alarmas exactas ni prometer precisión puntual. La decisión inicial es `bestEffort`.
- No prometer avisos después de una detención forzada.
- No crear ni editar manualmente `android/` o `ios/`; cualquier configuración nativa se realizará mediante la configuración Expo aprobada.

## Diseño técnico propuesto

1. **Integración de plataforma:** `expo-notifications` es una dependencia ausente en `package.json` y es la única dependencia de biblioteca nueva prevista para T01–T07. Resolver su versión compatible con SDK 58 y revisar el config plugin y `app.json` según la referencia versionada. Como el módulo contiene código nativo, se deberá regenerar/usar un development build para validar la integración; no bastará con asumir que el comportamiento de Expo Go representa el build de la aplicación. No se prevén bibliotecas adicionales para notificaciones locales, permisos, canal Android o respuestas al aviso; Expo Router ya forma parte del proyecto.
2. **Responsabilidades:** mantener el cálculo de fases y las transiciones de HU-001/HU-002 en su lógica de dominio; encapsular las llamadas a notificaciones en un servicio de plataforma; conectar dicho servicio con el ciclo de vida existente de la sesión y su recuperación de HU-003. No añadir lógica de notificaciones a las rutas más allá de composición y navegación.
3. **Identidad y reconciliación:** asociar el aviso a una ejecución concreta de fase y reconciliar los avisos programados con el estado recuperado, de manera idempotente. La elección de almacenamiento/identificador y el orden de operaciones asíncronas se resolverán durante la implementación aprobada sin cambiar el formato persistido de HU-003 innecesariamente.
4. **Permisos y canales:** en Android, preparar el canal requerido con sonido predeterminado y vibración; explicar el propósito antes de la solicitud de permiso inicial. Tratar el permiso de notificaciones (Android 13+) de forma distinta al acceso a alarmas exactas (Android 12+), que no se solicita para el alcance inicial. Los canales ya creados pueden estar sujetos a ajustes que el usuario gestione desde Android.
5. **Primer plano e interacción:** mostrar una señal visual accesible cuando la aplicación esté visible sin presentar una segunda notificación; usar los mensajes aprobados por fase; al responder a la notificación, abrir la pantalla existente de temporizador con la fase siguiente preparada, sin inicio automático.
6. **Compatibilidad temporal:** programar el vencimiento de la fase mediante notificación local del sistema, no mediante un temporizador JavaScript que deba permanecer ejecutándose. Cancelar el aviso antiguo antes de reprogramar una ejecución reanudada o restaurada. `bestEffort` puede retrasarse por Android, Doze, batería o fabricante.

## Áreas previstas

Las ubicaciones exactas podrán ajustarse solo si la inspección de implementación lo justifica y se conserva la separación de responsabilidades.

- Dependencia/configuración: `package.json`, `package-lock.json`, `app.json`.
- Sesión y ciclo de vida: `src/hooks/use-pomodoro-session.ts` y la integración con `src/features/persistence/pomodoro-state-storage.ts`.
- Servicio nuevo de notificaciones bajo `src/features/` (ubicación/nombre por decidir durante la implementación).
- Navegación/interacción de notificación: `src/app/_layout.tsx` y la pantalla existente del temporizador.
- Pruebas: pruebas enfocadas del servicio y sesión junto a `src/features/` y `src/hooks/`; pruebas Android manuales en un development build.

## Estrategia de verificación

| Verificación | Cobertura | Procedimiento/evidencia futura |
|---|---|---|
| Pruebas deterministas de permiso y mensajes | SPEC-004-R02–R10 | Simular estados concedido/denegado y comprobar el texto correspondiente a estudio/descanso, la señal accesible en primer plano y la navegación a la fase preparada. |
| Pruebas de agenda y ciclo de vida | SPEC-004-R01, R11–R16 | Con reloj y servicio simulados, comprobar una programación por ejecución; cancelación en pausa/solicitud de reinicio; reprogramación al reanudar o cancelar un reinicio activo; ausencia de aviso después de confirmar reinicio; deduplicación al recuperar y volver a primer plano. |
| No regresión funcional | HU-001, HU-002, HU-003 | Ejecutar las pruebas existentes de temporizador, ciclo y recuperación; conservar el comportamiento y la cobertura existente de HU-003. La referencia comunicada para HU-003 es 81 pruebas aprobadas. |
| Pruebas manuales Android | SPEC-004-R05–R06, R17–R20; CA02, CA07–CA08 | En development build y dispositivo físico: permiso concedido/denegado, canal, fase de estudio/descanso, toque, pantalla bloqueada, cierre normal desde recientes y modo offline. Registrar retrasos observados; no tratarlos como fallo de precisión garantizada. |
| Límite de sistema | SPEC-004-R19 | Confirmar y documentar que no se promete entrega tras detención forzada; no convertirlo en requisito garantizado. |
| P01 separado | SPEC-004-P01; CA09 | No usar el resultado de las pruebas del canal ordinario como evidencia de P01. La validación de silencio, vibración y pantalla de bloqueo requiere la investigación específica y una solución/decisión aprobada. |

Antes de cerrar cualquier tarea de código futura, ejecutar las pruebas específicas, lint y comprobación TypeScript según las convenciones del proyecto; registrar fallos y evidencia manual pendiente.

## Riesgos y límites

- Los permisos, la visibilidad de pantalla de bloqueo, el sonido, la vibración y los canales son controlados por Android y el usuario; el comportamiento cambia por versión y fabricante.
- `bestEffort` no garantiza exactitud temporal. No solicitar alarmas exactas en el alcance inicial.
- Una transición de fase completada durante el cierre/recuperación puede competir con la cancelación o reconciliación de avisos; las pruebas deberán fijar orden y deduplicación sin procesar dos veces la finalización de HU-002.
- La denegación del permiso no puede bloquear el temporizador/ciclo ni mostrarse como notificación entregada.
- La prueba física es necesaria para bloqueo/cierre y comportamiento del canal. Expo documenta que las notificaciones locales están disponibles en Expo Go, pero la integración nativa del proyecto deberá verificarse en el development build que se use para entrega.
- P01 sigue siendo una puerta de cierre independiente; completar las tareas del alcance inicial no equivale a completar HU-004.

## Matriz de trazabilidad

| Requisitos | Tareas | Criterios |
|---|---|---|
| SPEC-004-R01, R11–R12, R17–R20 | HU004-T01, T04, T07 | CA02, CA07–CA08 |
| SPEC-004-R02–R04 | HU004-T02 | CA01 |
| SPEC-004-R05–R08, R10 | HU004-T03, T05, T07 | CA02–CA03 |
| SPEC-004-R09 | HU004-T05 | CA04 |
| SPEC-004-R13–R16 | HU004-T06 | CA05–CA06 |
| SPEC-004-P01 | HU004-T08 | CA09; pendiente, no satisfecho |
| HU-001, HU-002, HU-003 | HU004-T04, T06, T07 | No regresión; no modifica sus historias ni criterios |

## Autorización de trabajo por tarea

HU004-T01 es la primera tarea autorizada para implementación: integrar `expo-notifications` compatible con Expo SDK 58 y la configuración Android requerida. Habilita las capacidades nativas que usan las tareas siguientes. T01–T07 están dentro del alcance autorizado parcialmente y se ejecutan individualmente, con pruebas, cuando el responsable solicita cada tarea. Esta actualización documental no instala dependencias, no modifica código y no inicia ninguna tarea.

## Condición de cierre de HU-004

No declarar HU-004 completada, aceptada ni globalmente aprobada mientras SPEC-004-P01/DEC-004-09 carezca de investigación técnica, decisión explícita, implementación autorizada si corresponde y validación documentada. Este plan y sus tareas tampoco cambian por sí solos el estado de HU-004.
