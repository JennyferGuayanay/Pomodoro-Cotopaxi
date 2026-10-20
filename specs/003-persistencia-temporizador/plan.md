# Plan de implementación — HU-003

Estado: Aprobado para implementación (2026-10-19)

## Objetivo
Conservar y recuperar el estado del temporizador y del ciclo Pomodoro al bloquear el dispositivo o cerrar la aplicación, sin modificar los comportamientos aprobados de HU-001 y HU-002.

## Estrategia técnica
1. Revisar los hooks y estados actuales del temporizador y del ciclo.
2. Usar AsyncStorage `2.2.0`, ya instalada; T-002 no añadirá ni instalará dependencias.
3. Definir un modelo persistido versionado con fase, progreso, duración, estado, tiempo restante y marca absoluta de finalización.
4. Implementar funciones de validación, almacenamiento y recuperación con un estado seguro para datos ausentes o inválidos. La reconciliación temporal corresponde a T-003.
5. Conectar la persistencia a los cambios funcionales y recuperar el estado antes de habilitar los controles.
6. Comprobar que las finalizaciones ocurridas durante la ausencia generan una sola transición.
7. Ejecutar pruebas automatizadas y pruebas manuales en Android, incluyendo funcionamiento sin conexión.

## Restricciones
- No cambiar las reglas funcionales de HU-001 y HU-002.
- No iniciar automáticamente la siguiente fase.
- No mostrar tiempo negativo ni descontar tiempo durante una pausa.
- No usar servicios remotos para guardar el estado.
- Los avisos efectivos pertenecen a HU-004.

## Validación
Ejecutar npx tsc --noEmit y npm test -- --runInBand. Después probar bloqueo, cierre desde recientes, fase vencida durante la ausencia y sesión pausada.

## Aprobación

- Aprobación del responsable: Aprobado explícitamente el 2026-10-19.
- Autorización vigente del responsable: implementación exclusiva de T-003; no autoriza T-004 ni tareas posteriores.
