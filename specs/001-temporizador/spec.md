# Especificación 001: Control del temporizador

**Estado: aprobada**

## Trazabilidad

- Historia de usuario: `docs/historias/HU-001.md`.
- Título de la historia: HU-001, Control básico del temporizador.
- Decisiones: `specs/001-temporizador/decisiones.md`.
- Constitución: `docs/constitution.md`.
- Estado de HU-001 para esta especificación: Contrastada con los cuatro escenarios originales.

Esta especificación autoriza la planificación de HU-001. La implementación requiere además un plan y tareas aprobados.

## Objetivo

Especificar el comportamiento verificable para iniciar, pausar, reanudar y solicitar el reinicio con confirmación de una fase del temporizador.

## Actor

- Estudiante de Academia Cotopaxi que controla una fase Pomodoro desde un dispositivo Android.

## Alcance

- Mostrar el estado y el tiempo restante.
- Iniciar manualmente desde la duración configurada.
- Usar 25 minutos como duración predeterminada de estudio cuando no exista una configuración válida.
- Pausar y conservar el tiempo restante.
- Reanudar desde el tiempo conservado sin reiniciar.
- Permitir solicitar reinicio únicamente en ejecución o pausa y exigir confirmación.
- Suspender la cuenta regresiva mientras la confirmación esté abierta.
- Mostrar el mensaje `¿Deseas reiniciar el temporizador?` con los botones `Cancelar` y `Reiniciar`.
- Al cancelar, restaurar el estado anterior y reanudar desde el tiempo suspendido si estaba en ejecución.
- Al confirmar, restaurar la duración configurada completa y dejar el temporizador detenido.
- Mostrar el tiempo como `MM:SS`, sin decimales, redondeando hacia arriba los segundos positivos y permitiendo minutos superiores a 99.
- Mostrar únicamente los controles `Iniciar`, `Pausar`, `Reanudar` y `Reiniciar` que correspondan al estado.
- Comunicar controles y estados de forma accesible.
- Ejecutar estas operaciones sin conexión a Internet.

## Fuera de alcance

- Edición y persistencia de duraciones, cubierta por HU-005.
- Selección y transición entre estudio, descanso corto y descanso largo, cubierta por HU-002.
- Recuperación después de bloqueo o cierre, cubierta por HU-003.
- Notificación, sonido y vibración al finalizar, cubiertos por HU-004.
- Cuentas, publicidad y alcance offline general, cubiertos por HU-006.
- Comportamiento al llegar a cero, excepto que una fase deja de estar en ejecución; la transición posterior depende de HU-002 y HU-004.
- Diseño visual definitivo y marca institucional.

## Términos

| Término | Definición para esta especificación |
| --- | --- |
| Fase actual | Fase cuyo temporizador controla el usuario |
| Duración configurada | Duración vigente para el tipo de fase actual, definida fuera de HU-001 |
| Duración predeterminada | 25 minutos para una fase de estudio cuando no existe configuración válida |
| Detenido | Estado en el que la fase no descuenta tiempo y espera que el usuario seleccione `Iniciar` |
| En ejecución | Estado en el que la cuenta regresiva descuenta tiempo |
| Pausado | Estado en el que existe tiempo restante conservado y no se descuenta |
| Reinicio solicitado | Situación temporal en la que la cuenta está suspendida y la aplicación espera confirmación o cancelación |

## Correspondencia con HU-001

- **Iniciar:** Comenzar desde la duración aplicable.
- **Pausar y continuar:** Conservar el tiempo al pausar y continuar desde él sin reiniciar.
- **Reiniciar:** Solicitar confirmación y, al elegir `Reiniciar`, volver al tiempo inicial de la fase actual.
- **Cancelar el reinicio:** Al elegir `Cancelar`, conservar el tiempo restante y el estado anterior.
- Esta especificación no agrega otros escenarios funcionales a HU-001.

## Requisitos EARS

### Visualización y acceso

- **SPEC-001-R01 (ubícuo):** La aplicación deberá mostrar el estado actual del temporizador y su tiempo restante.
- **SPEC-001-R02 (dependiente de estado):** Mientras no exista una duración de estudio configurada válida, la aplicación deberá usar 25 minutos como duración predeterminada al preparar una fase de estudio.
- **SPEC-001-R03 (dirigido por evento):** Cuando el usuario seleccione `Iniciar` con el temporizador detenido, la aplicación deberá cambiarlo a ejecución y comenzar la cuenta regresiva desde su duración configurada aplicable.

### Pausa y reanudación

- **SPEC-001-R04 (dirigido por evento):** Cuando el usuario pause una fase en ejecución, la aplicación deberá conservar el tiempo restante existente en el momento de la pausa.
- **SPEC-001-R05 (dependiente de estado):** Mientras una fase permanezca pausada, la aplicación no deberá reducir su tiempo restante.
- **SPEC-001-R06 (dirigido por evento):** Cuando el usuario reanude una fase pausada, la aplicación deberá cambiarla a ejecución y continuar la cuenta regresiva desde el tiempo restante conservado, sin restaurar la duración completa.

### Reinicio con confirmación

- **SPEC-001-R07 (dirigido por evento):** Cuando el usuario seleccione `Reiniciar` mientras el temporizador esté en ejecución o pausado, la aplicación deberá suspender la cuenta y mostrar el mensaje `¿Deseas reiniciar el temporizador?` con los botones `Cancelar` y `Reiniciar`.
- **SPEC-001-R08 (dirigido por evento):** Cuando el usuario seleccione `Cancelar` en el diálogo, la aplicación deberá conservar el tiempo restante y restaurar el estado existente antes de solicitar el reinicio.
- **SPEC-001-R09 (dirigido por evento):** Cuando el usuario seleccione `Reiniciar` en el diálogo, la aplicación deberá restaurar el tiempo inicial configurado de la fase actual y dejar el temporizador detenido.
- **SPEC-001-R10 (dependiente de estado):** Mientras la confirmación de reinicio esté abierta, la aplicación no deberá descontar tiempo.
- **SPEC-001-R11 (dirigido por evento):** Cuando el usuario cancele una confirmación solicitada desde ejecución, la aplicación deberá reanudar la cuenta desde el tiempo en que fue suspendida.

### Accesibilidad y operación local

- **SPEC-001-R12 (ubícuo):** La aplicación deberá proporcionar nombres, roles y estados accesibles para el tiempo y los controles del temporizador.
- **SPEC-001-R13 (ubícuo):** La aplicación no deberá comunicar el estado del temporizador únicamente mediante color.
- **SPEC-001-R14 (dependiente de estado):** Mientras el dispositivo no tenga conexión a Internet, la aplicación deberá permitir iniciar, pausar, reanudar y solicitar, cancelar o confirmar un reinicio con el mismo comportamiento funcional.
- **SPEC-001-R15 (ubícuo):** La aplicación deberá mostrar el tiempo restante en formato `MM:SS`, sin decimales, usando el entero superior para cualquier fracción de segundo positiva y permitiendo que el campo de minutos supere 99.
- **SPEC-001-R16 (dependiente de estado):** Mientras el temporizador esté detenido, la aplicación deberá mostrar `Iniciar` y no deberá mostrar `Pausar`, `Reanudar` ni `Reiniciar`.
- **SPEC-001-R17 (dependiente de estado):** Mientras el temporizador esté en ejecución, la aplicación deberá mostrar `Pausar` y `Reiniciar`, y no deberá mostrar `Iniciar` ni `Reanudar`.
- **SPEC-001-R18 (dependiente de estado):** Mientras el temporizador esté pausado, la aplicación deberá mostrar `Reanudar` y `Reiniciar`, y no deberá mostrar `Iniciar` ni `Pausar`.

## Criterios de aceptación

### SPEC-001-CA01: Inicio con duración configurada

**Dado** que el temporizador está detenido con una duración configurada válida,  
**Cuando** el usuario selecciona `Iniciar`,  
**Entonces** la fase cambia a ejecución y la cuenta regresiva comienza desde esa duración.

### SPEC-001-CA02: Inicio con duración predeterminada

**Dado** que una fase de estudio está detenida y no existe una duración configurada válida,  
**Cuando** el usuario selecciona `Iniciar`,  
**Entonces** la fase cambia a ejecución y la cuenta regresiva comienza desde 25 minutos.

### SPEC-001-CA03: Pausa

**Dado** que una fase está en ejecución con tiempo restante,  
**Cuando** el usuario selecciona `Pausar`,  
**Entonces** la fase cambia a pausada y conserva el tiempo restante existente en ese momento.

### SPEC-001-CA04: Permanencia en pausa

**Dado** que una fase está pausada con tiempo restante conservado,  
**Cuando** transcurre tiempo sin que el usuario la reanude,  
**Entonces** el tiempo restante no disminuye.

### SPEC-001-CA05: Reanudación

**Dado** que una fase está pausada con tiempo restante conservado,  
**Cuando** el usuario selecciona `Reanudar`,  
**Entonces** la fase cambia a ejecución y continúa descontando desde ese tiempo, sin volver a la duración completa.

### SPEC-001-CA06: Solicitud de reinicio desde ejecución

**Dado** que el temporizador está en ejecución con tiempo restante,  
**Cuando** el usuario selecciona `Reiniciar`,  
**Entonces** la aplicación suspende la cuenta y muestra `¿Deseas reiniciar el temporizador?` con los botones `Cancelar` y `Reiniciar`, sin restaurar todavía la duración.

### SPEC-001-CA07: Solicitud de reinicio desde pausa

**Dado** que el temporizador está pausado con tiempo restante,  
**Cuando** el usuario selecciona `Reiniciar`,  
**Entonces** la aplicación conserva suspendida la cuenta y muestra `¿Deseas reiniciar el temporizador?` con los botones `Cancelar` y `Reiniciar`, sin restaurar todavía la duración.

### SPEC-001-CA08: Cancelación desde ejecución

**Dado** que la confirmación fue solicitada desde ejecución y conserva el tiempo suspendido,  
**Cuando** el usuario selecciona `Cancelar`,  
**Entonces** la fase vuelve a ejecución y continúa desde el tiempo en que fue suspendida, sin restaurar la duración completa.

### SPEC-001-CA09: Cancelación desde pausa

**Dado** que la confirmación fue solicitada desde pausa y conserva el tiempo restante,  
**Cuando** el usuario selecciona `Cancelar`,  
**Entonces** la fase vuelve a pausa con el mismo tiempo restante, sin restaurar la duración completa.

### SPEC-001-CA10: Confirmación del reinicio

**Dado** que la confirmación de reinicio está abierta desde ejecución o pausa,  
**Cuando** el usuario selecciona `Reiniciar`,  
**Entonces** el tiempo vuelve al valor inicial configurado de la fase actual y el temporizador queda detenido.

### SPEC-001-CA11: Suspensión durante la confirmación

**Dado** que la confirmación de reinicio está abierta con un tiempo suspendido,  
**Cuando** transcurre tiempo antes de que el usuario confirme o cancele,  
**Entonces** el tiempo suspendido no disminuye.

### SPEC-001-CA12: Formato y redondeo del tiempo

**Dado** que el temporizador tiene una cantidad positiva de tiempo restante que incluye una fracción de segundo,  
**Cuando** la aplicación presenta ese tiempo,  
**Entonces** redondea hacia arriba al siguiente segundo entero y lo muestra como `MM:SS`, sin decimales.

### SPEC-001-CA13: Visualización en cero

**Dado** que el tiempo restante es cero,  
**Cuando** la aplicación presenta ese tiempo,  
**Entonces** muestra `00:00`.

### SPEC-001-CA14: Duraciones superiores a 99 minutos

**Dado** que el tiempo restante equivale a más de 99 minutos,  
**Cuando** la aplicación presenta ese tiempo,  
**Entonces** muestra todos los minutos en el campo `MM` sin truncarlos ni imponer un límite; por ejemplo, 100 minutos se muestran como `100:00`.

### SPEC-001-CA15: Controles con temporizador detenido

**Dado** que el temporizador está detenido,  
**Cuando** la aplicación presenta los controles del temporizador,  
**Entonces** muestra `Iniciar` y no muestra `Pausar`, `Reanudar` ni `Reiniciar`.

### SPEC-001-CA16: Controles con temporizador en ejecución

**Dado** que el temporizador está en ejecución,  
**Cuando** la aplicación presenta los controles del temporizador,  
**Entonces** muestra `Pausar` y `Reiniciar`, y no muestra `Iniciar` ni `Reanudar`.

### SPEC-001-CA17: Controles con temporizador pausado

**Dado** que el temporizador está pausado,  
**Cuando** la aplicación presenta los controles del temporizador,  
**Entonces** muestra `Reanudar` y `Reiniciar`, y no muestra `Iniciar` ni `Pausar`.

### SPEC-001-CA18: Control offline

**Dado** que el dispositivo no tiene conexión a Internet y el temporizador está detenido, en ejecución o pausado,  
**Cuando** el usuario ejecuta una acción permitida de inicio, pausa, reanudación o reinicio,  
**Entonces** la acción produce el mismo cambio funcional que con conexión.

### SPEC-001-CA19: Accesibilidad

**Dado** que el usuario recorre el temporizador con tecnología de asistencia,  
**Cuando** consulta el tiempo, el estado y los controles disponibles,  
**Entonces** puede identificar el nombre, rol y estado de cada elemento sin depender únicamente del color.

## Matriz de trazabilidad

| Requisito de especificación | Referencia HU-001 | Criterios |
| --- | --- | --- |
| SPEC-001-R01 | HU-001-R01 | CA01-CA19 |
| SPEC-001-R02 | HU-001-R02; duración propuesta | CA02 |
| SPEC-001-R03 | HU-001-R02 | CA01, CA02 |
| SPEC-001-R04, R05 | HU-001-R03, R08 | CA03, CA04 |
| SPEC-001-R06 | HU-001-R04 | CA05 |
| SPEC-001-R07, R10 | HU-001-R05 | CA06, CA07, CA11 |
| SPEC-001-R08, R11 | HU-001-R06 | CA08, CA09 |
| SPEC-001-R09 | HU-001-R07 | CA10 |
| SPEC-001-R12, R13 | HU-001-R09 | CA19 |
| SPEC-001-R14 | Constitución y HU-006 | CA18 |
| SPEC-001-R15 | HU-001-R01; DEC-009 | CA12-CA14 |
| SPEC-001-R16-R18 | HU-001-R09; DEC-010 | CA15-CA17 |

## Estrategia de verificación preliminar

- Probar las transiciones con un reloj controlado para evitar dependencia del tiempo real.
- Verificar por separado duración configurada y valor predeterminado.
- Confirmar que pausar estabiliza el tiempo y reanudar no lo restablece.
- Verificar reinicio desde ejecución y pausa, incluyendo suspensión, confirmación y cancelación.
- Verificar `MM:SS`, cero y redondeo hacia arriba de fracciones positivas.
- Verificar minutos superiores a 99 sin truncamiento ni límite añadido.
- Verificar la visibilidad de controles en cada estado.
- Verificar las mismas acciones sin conectividad.
- Realizar comprobación manual con tecnología de asistencia en Android.

Esta estrategia no selecciona herramientas ni autoriza implementación.

## Resultado de la revisión

- Los requisitos y criterios cubren los cuatro escenarios indicados: iniciar, pausar y continuar, reiniciar, y cancelar el reinicio.
- El diálogo y el formato para duraciones superiores a 99 minutos están definidos.
- No quedan preguntas funcionales abiertas dentro de HU-001.

## Aprobación

- Aprobada explícitamente por el responsable del proyecto.
- Fecha de aprobación: 2026-10-19.
- Alcance aprobado: los cuatro escenarios originales de HU-001 documentados en esta especificación.
- Próxima etapa autorizada: planificación y división en tareas.
- Implementación: no autorizada hasta que el plan y las tareas sean revisados.
