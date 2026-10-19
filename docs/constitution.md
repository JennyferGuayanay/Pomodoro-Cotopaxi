# Constitución de Pomodoro-Cotopaxi

## Propósito

Esta constitución establece las reglas obligatorias para especificar, planificar, implementar y validar Pomodoro-Cotopaxi, una aplicación Android de técnica Pomodoro para Academia Cotopaxi.

Cuando exista conflicto entre rapidez de entrega y esta constitución, prevalece esta constitución. Cualquier excepción debe quedar documentada, justificada y aprobada antes de aplicarse.

## Principios

### 1. Desarrollo guiado por especificaciones

- Toda funcionalidad debe originarse en una historia de usuario identificada y contrastada con el enunciado original.
- Los requisitos deben expresarse de forma verificable, preferentemente con patrones EARS.
- Una historia en estado `Borrador` no autoriza planificación técnica ni implementación.
- El orden obligatorio es: historia, especificación, aprobación, plan, tareas, implementación y pruebas.
- Las decisiones y cambios de alcance deben conservar trazabilidad hacia la historia y sus criterios de aceptación.

### 2. Respeto a las historias de usuario

- No se deben inventar requisitos para completar vacíos del enunciado.
- Las ambigüedades deben registrarse como preguntas pendientes y resolverse antes de aprobar la historia.
- El comportamiento implementado debe corresponder exactamente a una especificación aprobada.
- Los cambios posteriores deben actualizar primero la historia y su especificación, y después el plan y las tareas afectadas.
- Cada tarea y cada prueba deben indicar qué requisito o criterio de aceptación cubren.

### 3. Funcionamiento offline y privacidad

- Las funciones esenciales del temporizador, ciclos, recuperación, avisos y configuración deben funcionar sin conexión a Internet.
- La aplicación no debe requerir cuentas, autenticación ni servicios remotos para su operación esencial.
- La información necesaria debe permanecer local, con persistencia suficiente para cumplir las historias aprobadas.
- No se incorporarán anuncios, rastreo, telemetría ni transferencia de datos sin una decisión explícita y aprobada.
- Una dependencia que introduzca necesidad de red o tratamiento de datos debe justificarse antes de adoptarse.

### 4. TypeScript y calidad del código

- Todo código nuevo debe usar TypeScript en modo estricto y evitar `any`, aserciones inseguras y silenciamiento de errores sin justificación.
- Los estados y transiciones del dominio deben modelarse de forma explícita y verificable.
- Se preferirán cambios pequeños, simples y acordes con Expo SDK 58, React Native y Expo Router.
- No se duplicará lógica de dominio entre pantallas, tareas en segundo plano o mecanismos de persistencia.
- Las API de Expo y React Native se validarán contra la documentación correspondiente a la versión instalada antes de usarse.

### 5. Pruebas y evidencia

- Cada requisito aprobado debe tener al menos una estrategia de verificación definida antes de implementarse.
- La lógica de tiempo y ciclos debe probarse de manera determinista, incluyendo límites, pausas, reanudaciones y recuperación.
- Se deben cubrir rutas exitosas, errores, permisos denegados, datos ausentes o inválidos y cambios de estado de la aplicación cuando correspondan.
- Cada tarea implementada debe registrar comandos ejecutados, resultados y pruebas manuales pendientes.
- Ninguna tarea se considera terminada con pruebas fallidas o sin evidencia de validación.

### 6. Accesibilidad y uso móvil

- La experiencia se diseñará primero para Android y para interacción táctil móvil.
- Los controles deben tener etiquetas accesibles, roles, estados y áreas táctiles adecuadas.
- La información no dependerá únicamente del color, sonido o vibración.
- Se respetarán contraste, escalado de texto, preferencias del sistema y reducción de movimiento cuando sean aplicables.
- Las acciones y estados del temporizador deben ser comprensibles con tecnologías de asistencia.

### 7. Alcance mínimo y decisiones explícitas

- Se implementará una tarea aprobada a la vez, evitando trabajo especulativo.
- No se añadirán dependencias, servicios, permisos ni abstracciones sin necesidad trazable.
- Las decisiones relevantes deben registrar contexto, opciones, decisión, consecuencias y fecha.
- Los colores y recursos institucionales no deben inferirse: requieren confirmación oficial de Academia Cotopaxi.

## Puertas de calidad SDD

| Etapa | Entrada requerida | Salida requerida | Condición para avanzar |
| --- | --- | --- | --- |
| Especificación | Historia contrastada con el enunciado | Requisitos EARS, criterios y dudas resueltas | Aprobación explícita |
| Plan | Especificación aprobada | Diseño técnico, riesgos y estrategia de pruebas | Trazabilidad completa |
| Tareas | Plan aprobado | Tareas pequeñas y verificables | Orden y dependencias claros |
| Implementación | Una tarea autorizada | Cambio mínimo y evidencia | Pruebas satisfactorias |
| Cierre | Todas las tareas terminadas | Validación contra la historia | Criterios aceptados |

## Gobierno

- Esta constitución aplica a documentación, código, configuración y pruebas del proyecto.
- Una modificación de la constitución requiere describir el motivo y revisar su impacto en historias, planes y tareas existentes.
- Las revisiones SDD deben comprobar el cumplimiento de estas reglas antes de aprobar cualquier avance.

**Estado:** Vigente para la preparación inicial del proyecto.  
**Última revisión:** 2026-10-19.
