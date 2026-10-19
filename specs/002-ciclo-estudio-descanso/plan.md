# Plan de implementación: 002-ciclo-estudio-descanso

## Estado

**Aprobado. Autoriza la implementación secuencial de T-000 a T-006.**

- Fecha de aprobación: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.

- Especificación de origen: `specs/002-ciclo-estudio-descanso/spec.md`.
- Estado de la especificación: Aprobada el 2026-10-19.
- Decisiones: `specs/002-ciclo-estudio-descanso/decisiones.md`, aprobadas el 2026-10-19.
- Historia: HU-002, Ciclos de estudio y descanso.
- Dependencia funcional: HU-001, implementada, probada y aprobada.
- Plataforma principal: Android.
- Base técnica: Expo SDK 58, React Native 0.88, React 19.3, Expo Router y TypeScript estricto.

## Objetivo técnico

Extender el temporizador de HU-001 con un modelo determinista de ciclo que prepare estudio, descanso corto o descanso largo al finalizar cada fase, mantenga el progreso visible y accesible, y preserve sin regresiones el inicio, pausa, reanudación y reinicio aprobados.

## Alcance del plan

- Estado inicial `Estudio` con `Pomodoros completados: 0 de 4`.
- Duraciones provisionales de 25 minutos para estudio, 5 para descanso corto y 15 para descanso largo.
- Descanso corto después de los primeros tres estudios completados.
- Descanso largo después del cuarto estudio completado.
- Progreso `4 de 4` durante el descanso largo y reinicio a `0 de 4` cuando este termine.
- Estudio preparado después de cualquier descanso.
- Inicio manual de cada fase.
- Nombres exactos de fase y texto accesible de progreso.
- Procesamiento único de cada finalización.
- Imposibilidad de omitir o seleccionar manualmente fases.
- Compatibilidad completa con los controles y el diálogo de HU-001.
- Pruebas deterministas con Jest, validación TypeScript y pruebas manuales Android.

## Fuera de alcance

- Interfaz, validación o persistencia para configurar la cantidad requerida; corresponden a HU-005.
- Edición o persistencia de las duraciones; corresponden a HU-005.
- Persistencia o recuperación del ciclo después de cierre, bloqueo o reinicio; corresponden a HU-003.
- Notificaciones, sonidos o vibración al finalizar; corresponden a HU-004.
- Omisión, selección manual o reordenamiento de fases.
- Inicio automático de una fase.
- Dependencias nuevas, permisos, servicios remotos o cambios nativos.
- Cambios en rutas ajenas a la pantalla principal.

## Estado actual relevante

- `src/features/timer/timer-state.ts` contiene el modelo puro aprobado de HU-001 y cambia de `running` a `stopped` con cero milisegundos al finalizar.
- `src/hooks/use-timer.ts` ejecuta el reloj mediante una marca de finalización y actualizaciones periódicas, pero no publica todavía una señal de finalización.
- `src/components/pomodoro-timer.tsx` presenta tiempo, estado, controles y diálogo de reinicio; actualmente recibe una única duración.
- `src/app/index.tsx` presenta una sesión de estudio y renderiza `PomodoroTimer`.
- Jest, `jest-expo` y React Native Testing Library ya están configurados; no se requiere instalar dependencias.
- Las pruebas de HU-001 constituyen la línea base de regresión obligatoria.

## Diseño propuesto

### 1. Modelo puro del ciclo

Crear `src/features/pomodoro-cycle/pomodoro-cycle-state.ts` separado del reloj. El modelo mantendrá:

- Fase actual: `study`, `shortBreak` o `longBreak`.
- Pomodoros completados visibles en el ciclo.
- Cantidad requerida vigente, con cuatro como valor de HU-002.
- Transición pura de finalización de fase.
- Resolución de la duración provisional correspondiente a cada fase.

Reglas del modelo:

| Fase completada | Progreso anterior | Siguiente fase | Progreso siguiente |
| --- | --- | --- | --- |
| `study` | 0, 1 o 2 de 4 | `shortBreak` | 1, 2 o 3 de 4 |
| `study` | 3 de 4 | `longBreak` | 4 de 4 |
| `shortBreak` | 1, 2 o 3 de 4 | `study` | Sin cambios |
| `longBreak` | 4 de 4 | `study` | 0 de 4 |

El modelo no importará React, Expo, almacenamiento, red ni API de plataforma. No incluirá eventos para omitir o seleccionar una fase.

Para la integración futura con HU-005, la cantidad requerida se considerará fija durante el ciclo. La transición que termina el descanso largo podrá recibir la cantidad aplicable al ciclo siguiente; HU-002 usará siempre cuatro y no expondrá configuración al usuario.

### 2. Finalización única del temporizador

Extender de forma compatible `useTimer` y `PomodoroTimer` con una notificación opcional de finalización:

- Detectar únicamente la transición real desde ejecución con tiempo positivo hasta detenido en cero.
- Emitir una sola notificación por ejecución completada, aunque existan renderizados o ticks posteriores.
- No emitir finalización al pausar, confirmar un reinicio, cancelar el diálogo, montar un temporizador ya detenido o desmontar.
- Mantener el comportamiento actual cuando no se proporciona el callback opcional.

La señal será una integración React; la transición temporal continuará delegada a `transitionTimer`. No se modificará la semántica de los estados aprobados de HU-001.

### 3. Controlador React del ciclo

Crear `src/hooks/use-pomodoro-cycle.ts` para conectar el modelo puro con la interfaz:

- Inicializar `study`, cero completados y objetivo cuatro.
- Exponer fase, nombre visible, progreso y duración aplicable.
- Procesar la señal de finalización mediante la transición pura del ciclo.
- Preparar una nueva instancia detenida del temporizador después de cada transición.
- Mantener estable la cantidad requerida del ciclo actual.

El controlador no gestionará ticks ni replicará las reglas de tiempo de HU-001. Esas responsabilidades permanecerán en `useTimer`.

### 4. Composición de interfaz

Crear `src/components/pomodoro-cycle.tsx` como composición de ciclo y temporizador:

- Mostrar el nombre exacto de la fase actual.
- Mostrar exactamente `Pomodoros completados: C de N`.
- Renderizar `PomodoroTimer` con la duración de la fase actual.
- Conectar la finalización única del temporizador con el controlador del ciclo.
- Forzar una nueva instancia detenida del temporizador al cambiar de fase, sin iniciar automáticamente.
- No renderizar controles para omitir o seleccionar fases.

`PomodoroTimer` seguirá siendo responsable de los controles `Iniciar`, `Pausar`, `Reanudar` y `Reiniciar`, incluido el diálogo aprobado. `PomodoroCycle` no duplicará esos controles.

### 5. Pantalla principal

Modificar `src/app/index.tsx` únicamente para sustituir la composición de temporizador individual por `PomodoroCycle`:

- Mantener `SafeAreaView`, componentes temáticos, tokens de espacio y estructura móvil.
- Mantener la lógica de dominio fuera de `src/app/`.
- No modificar navegación, otras rutas ni configuración Expo.
- Evitar un título fijo que contradiga la fase visible actual.

### 6. Accesibilidad

- Exponer el nombre de fase como texto y etiqueta accesible.
- Exponer el progreso mediante la cadena exacta aprobada.
- No depender únicamente de color, iconos o posición.
- Mantener roles, etiquetas y áreas táctiles de HU-001.
- Evitar anuncios repetitivos por cada tick; anunciar únicamente cambios relevantes de fase o progreso si la implementación requiere una región accesible.
- Verificar escalado de texto sin truncar fase, progreso, tiempo ni controles.

### 7. Operación local

- Mantener toda la lógica de ciclo en memoria y en funciones locales.
- No introducir solicitudes de red, cuentas, telemetría ni servicios remotos.
- Dejar persistencia y recuperación fuera de HU-002.

## Archivos previstos

| Archivo | Acción prevista | Motivo |
| --- | --- | --- |
| `src/features/pomodoro-cycle/pomodoro-cycle-state.ts` | Crear | Modelo puro de fases, progreso y duraciones |
| `src/features/pomodoro-cycle/__tests__/pomodoro-cycle-state-test.ts` | Crear | Pruebas deterministas de todas las transiciones y límites |
| `src/hooks/use-timer.ts` | Modificar mínimamente | Publicar una finalización opcional y única |
| `src/hooks/__tests__/use-timer-test.ts` | Modificar | Probar la señal sin degradar HU-001 |
| `src/components/pomodoro-timer.tsx` | Modificar mínimamente | Reenviar la finalización opcional sin cambiar controles |
| `src/components/__tests__/pomodoro-timer-test.tsx` | Modificar | Cubrir finalización y regresión de controles y diálogo |
| `src/hooks/use-pomodoro-cycle.ts` | Crear | Controlador React del estado de ciclo |
| `src/hooks/__tests__/use-pomodoro-cycle-test.ts` | Crear | Probar integración del modelo y preparación de fases |
| `src/components/pomodoro-cycle.tsx` | Crear | Componer información del ciclo y temporizador reutilizado |
| `src/components/__tests__/pomodoro-cycle-test.tsx` | Crear | Probar flujo, texto accesible y ausencia de selección manual |
| `src/app/index.tsx` | Modificar | Integrar el ciclo en la pantalla principal |

No se prevén cambios en dependencias, `package.json`, archivos nativos ni configuración Expo. Si aparece la necesidad de otro archivo, dependencia o permiso, la implementación se detendrá para revisar el plan.

## Estrategia de pruebas

### Pruebas unitarias del dominio

- Estado inicial `study`, cero de cuatro y duración de 25 minutos.
- Duraciones provisionales de 25, 5 y 15 minutos.
- Estudios primero, segundo y tercero conducen a descanso corto y aumentan una sola vez.
- Cuarto estudio conduce a descanso largo y conserva cuatro de cuatro.
- Descanso corto conduce a estudio sin cambiar progreso.
- Descanso largo conduce a estudio y reinicia a cero.
- La cantidad vigente no cambia durante el ciclo.
- Una cantidad futura se aplica únicamente al crear el ciclo siguiente después del descanso largo.
- No existen transiciones públicas para omitir o seleccionar fases.

### Pruebas de integración React

- `useTimer` notifica una sola vez al finalizar de forma natural.
- Pausa, reanudación, reinicio confirmado y cancelado no notifican una finalización falsa.
- Ticks posteriores en cero no duplican la notificación.
- `usePomodoroCycle` prepara cada fase y duración correctas.
- Cada nueva fase queda detenida hasta `Iniciar`.
- La composición recorre estudio, descanso corto y estudio, además del límite hacia descanso largo.

### Pruebas de componente y accesibilidad

- Nombres exactos `Estudio`, `Descanso corto` y `Descanso largo`.
- Texto exacto `Pomodoros completados: C de N` en cada transición.
- `4 de 4` permanece visible durante el descanso largo.
- `0 de 4` aparece al finalizar el descanso largo.
- No existen botones para omitir ni seleccionar fases.
- Los controles y el diálogo de HU-001 conservan texto, visibilidad y comportamiento.
- Fase, progreso, estado y tiempo pueden consultarse mediante etiquetas accesibles.

### Regresión de HU-001

- Ejecutar íntegramente las pruebas existentes de `timer-state`, `useTimer` y `PomodoroTimer`.
- Confirmar inicio, pausa, reanudación, reinicio y cancelación en los tres tipos de fase.
- Confirmar que reiniciar conserva la fase y el progreso.
- Confirmar que ninguna fase comienza automáticamente.

### Validación manual Android

- Verificar el estado inicial `Estudio`, `0 de 4` y `25:00`.
- Completar estudios y comprobar descansos cortos de `05:00` después de los tres primeros.
- Completar el cuarto estudio y comprobar `Descanso largo`, `4 de 4` y `15:00`.
- Completar el descanso largo y comprobar `Estudio`, `0 de 4` y `25:00`.
- En cada tipo de fase, recorrer iniciar, pausar, reanudar, solicitar reinicio, cancelar y confirmar reinicio.
- Confirmar que las fases nuevas permanecen detenidas.
- Confirmar que no hay acciones para omitir o seleccionar fases.
- Repetir el flujo esencial en modo avión.
- Revisar TalkBack, escalado de fuente y temas claro/oscuro.

## Matriz de trazabilidad

| Requisitos | Diseño | Pruebas principales |
| --- | --- | --- |
| R01-R03, R18 | Composición accesible | Nombres, progreso exacto y consultas accesibles |
| R04, R19 | Modelo e inicialización | Cuatro por defecto, estudio y cero inicial |
| R05-R08 | Modelo y señal única | Estudios 1 a 4, descansos y ausencia de avances falsos |
| R09-R11 | Modelo del ciclo | Finalización de descansos y reinicio después del largo |
| R12-R15 | Duraciones y temporizador reutilizado | 25/5/15, inicio manual y regresión HU-001 |
| R16 | Señal y transición idempotentes | Ticks posteriores sin duplicados |
| R17 | Arquitectura local | Flujo en modo avión |
| R20 | Límite capturado por ciclo | Nueva cantidad aplicada solo al ciclo siguiente |
| R21 | API y UI sin selección | Ausencia de controles y eventos de omisión |

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| La finalización se procesa más de una vez | Conteo o fases incorrectos | Señal protegida por ejecución y pruebas con ticks repetidos |
| La nueva fase hereda cero o estado en ejecución | Inicio automático o tiempo incorrecto | Crear una instancia detenida con la duración completa al cambiar de fase |
| El reinicio de HU-001 se interpreta como finalización | Avance falso del ciclo | Notificar solo transición natural desde ejecución hasta cero |
| El contador se reinicia antes del descanso largo | Incumplimiento de `4 de 4` | Mantener `N` durante el descanso y reiniciar en su finalización |
| Cambios al hook degradan HU-001 | Regresión funcional | Callback opcional, cambio mínimo y suite completa de regresión |
| Lógica temporal duplicada en el ciclo | Divergencia con HU-001 | Mantener ticks y controles exclusivamente en `useTimer` |
| Una futura configuración altera el ciclo actual | Umbral inconsistente | Capturar el objetivo por ciclo y aceptar uno nuevo solo al terminar el descanso largo |
| Recorrido manual completo requiere tiempo real | Validación Android prolongada | Cubrir exhaustivamente límites con reloj falso y registrar por separado la evidencia manual real |

## Puertas de calidad

- `plan.md` y `tasks.md` deben aprobarse antes de editar código.
- No se instalarán dependencias para HU-002.
- Cada tarea se implementará y validará por separado.
- Las pruebas específicas y la regresión relacionada deberán pasar antes de avanzar.
- Al cierre se ejecutarán `npm test -- --runInBand`, `npx tsc --noEmit` y lint sobre los archivos modificados.
- Se intentará `npx expo lint`; cualquier fallo ajeno ya documentado se registrará sin ocultarlo.
- Las pruebas manuales Android se registrarán con resultado, dispositivo y pendientes reales.

## Criterio de finalización del plan

HU-002 estará lista para aceptación cuando T-000 a T-006 estén completadas, los 17 criterios SPEC-002-CA estén cubiertos, la suite de HU-001 continúe aprobada, TypeScript no presente regresiones y la validación Android esté documentada sin implementar alcance de HU-003 a HU-006.
