# Memoria del proyecto Pomodoro-Cotopaxi

## Estado actual

- Fecha de actualización: 2026-10-19.
- Aplicación Android de técnica Pomodoro para Academia Cotopaxi.
- Base técnica detectada: Expo SDK 58, React Native 0.88, React 19.3, Expo Router y TypeScript estricto.
- Gestor actual: npm con `package-lock.json`.
- El código en `src/` corresponde todavía a la plantilla inicial de Expo; no se han implementado pantallas ni funcionalidades Pomodoro en esta preparación.
- Se creó la documentación inicial SDD, las convenciones y los agentes de trabajo.
- Se revisaron HU-001 a HU-006 con requisitos EARS y criterios de aceptación en formato Dado/Cuando/Entonces.
- HU-001 a HU-006 permanecen en estado `Borrador`.
- No existe todavía una historia o especificación aprobada que autorice planificación o implementación.

## Alcance funcional conocido

| Historia | Tema | Estado |
| --- | --- | --- |
| HU-001 | Iniciar, pausar, reanudar y reiniciar con confirmación | Borrador |
| HU-002 | Estudio, descanso corto y descanso largo tras cuatro pomodoros; inicio manual de cada fase | Borrador |
| HU-003 | Conservación del estado y cálculo temporal ante bloqueo o cierre | Borrador |
| HU-004 | Notificación, sonido y vibración con limitaciones de Android | Borrador |
| HU-005 | Duraciones configurables; valores 25/5/15 y cambios desde la siguiente fase | Borrador |
| HU-006 | Uso sin inicio de sesión, publicidad ni conexión a Internet | Borrador |

## Decisiones funcionales confirmadas en la revisión

- Reiniciar el temporizador requiere confirmación.
- Cada fase del ciclo requiere inicio manual.
- Después de los pomodoros de estudio primero, segundo y tercero corresponde descanso corto.
- Después del cuarto pomodoro de estudio corresponde descanso largo.
- El estado y el tiempo deben recuperarse tras bloquear el celular o cerrar y reabrir la aplicación.
- La finalización debe intentar notificación, sonido y vibración, sujeta a permisos y controles de Android.
- Las duraciones predeterminadas son 25 minutos de estudio, 5 de descanso corto y 15 de descanso largo.
- Los cambios de duración se aplican desde la siguiente fase.
- La aplicación debe funcionar sin inicio de sesión, publicidad ni conexión a Internet.
- Las historias siguen sin aprobación; estas decisiones deben contrastarse con el enunciado original.

## Referencia técnica revisada

- Se consultó la documentación de `expo-notifications` para Expo SDK 58 el 2026-10-19.
- Android 13 o posterior puede exigir autorización del usuario para mostrar notificaciones.
- Android 8 o posterior controla sonido, vibración e importancia mediante canales configurables por el usuario.
- Modo silencio, “No molestar”, batería y permisos de alarmas exactas pueden limitar la puntualidad o las señales del aviso.
- La consulta técnica no selecciona una implementación ni autoriza dependencias o cambios de configuración.

## Reglas vigentes

- Seguir `docs/constitution.md` y el orden SDD: especificar, aprobar, planificar, dividir en tareas, implementar y probar.
- Contrastar cada historia con el enunciado original antes de aprobarla.
- No planificar ni implementar desde una historia en borrador.
- No inventar requisitos para resolver información ausente.
- Mantener funcionamiento esencial offline, sin cuentas y sin publicidad.
- Usar TypeScript estricto, accesibilidad móvil y pruebas trazables.
- Verificar cualquier API con la documentación de Expo SDK 58 antes de escribir código.
- Implementar una única tarea aprobada a la vez y registrar evidencia de pruebas.

## Información pendiente de verificar

- Enunciado original completo y correspondencia exacta de HU-001 a HU-006.
- Estado del temporizador después de confirmar un reinicio y estados en los que se exige confirmación.
- Posibilidad de cambiar u omitir fases y efecto sobre el ciclo.
- Alcance exacto de “cerrar”, tolerancia temporal, cambios del reloj y estado seguro ante datos inválidos.
- Contenido de la notificación, sonido, vibración, acción al tocarla, versión mínima de Android y política de alarmas exactas.
- Valores mínimos, máximos, unidades y formatos válidos para las duraciones.
- Aplicación de cambios si la siguiente fase ya está disponible, pero no se ha iniciado.
- Necesidad de confirmar la restauración de valores predeterminados.
- Definición definitiva de funciones esenciales offline y política de datos.
- Colores, tipografías, logotipos, recursos sonoros y manual de marca oficiales de Academia Cotopaxi.
- Idioma o idiomas finales y tono editorial de la interfaz.
- Estrategia y herramientas de pruebas que serán autorizadas para el proyecto.

## Próximos pasos

1. Obtener el enunciado original y las fuentes oficiales de requisitos.
2. Contrastar los requisitos y criterios de HU-001 a HU-006 con ese enunciado.
3. Resolver todos los marcadores `[NECESITA ACLARACIÓN]` que afecten comportamiento o pruebas.
4. Aprobar explícitamente cada historia que esté completa y verificable.
5. Crear una especificación y un plan únicamente para la siguiente historia aprobada.
6. Dividir el plan aprobado en tareas pequeñas antes de modificar la aplicación.

## Restricciones de esta revisión

- No se modificaron archivos de aplicación en `src/`.
- No se modificaron `package.json`, `package-lock.json`, `app.json` ni `eas.json`.
- No se instalaron dependencias.
- No se realizó ningún commit.
- Los cambios locales que ya existían en archivos de configuración y dependencias se consideran trabajo previo y deben conservarse.
