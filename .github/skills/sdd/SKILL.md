---
name: sdd
description: Aplica Spec-Driven Development en Pomodoro-Cotopaxi, desde requisitos EARS y decisiones hasta planes, tareas y evidencia de pruebas.
---

# Skill: Spec-Driven Development

## Objetivo

Usar una especificación aprobada como fuente de verdad para construir Pomodoro-Cotopaxi. Esta skill impide que una idea, borrador o ambigüedad se convierta directamente en código.

## Fuentes de verdad

Consultar en este orden:

1. `docs/constitution.md`.
2. Enunciado original proporcionado por el responsable.
3. Historia de usuario aplicable en `docs/historias/`.
4. Especificación aprobada y decisiones asociadas.
5. Plan y tareas derivados de esa especificación.
6. Código y pruebas, que deben ajustarse a los documentos anteriores.

Si dos fuentes se contradicen, detener el avance y solicitar una decisión. No completar vacíos mediante suposiciones.

## Estados y puertas

| Estado | Significado | Trabajo permitido |
| --- | --- | --- |
| Borrador | No contrastado o con preguntas abiertas | Revisión y aclaración |
| En revisión | Contrastado, pendiente de decisión | Correcciones documentales |
| Aprobado | Alcance y criterios aceptados explícitamente | Planificación |
| Planificado | Plan y tareas trazables aprobados | Implementación de una tarea |
| Implementado | Cambio terminado con evidencia | Validación de aceptación |
| Aceptado | Criterios validados por el responsable | Cierre |

Una historia solo cambia de estado mediante aprobación explícita registrada. La existencia de criterios preliminares no equivale a aprobación.

## Flujo SDD

### 1. Descubrir y contrastar

- Leer la constitución, la historia y el enunciado original.
- Identificar actores, objetivo, disparadores, estados, resultados, límites y errores.
- Marcar contradicciones, términos ambiguos y datos ausentes.
- Formular preguntas concretas sin proponer comportamiento inventado.

### 2. Registrar decisiones

Toda decisión relevante debe incluir:

- Identificador y fecha.
- Contexto y requisito relacionado.
- Opciones consideradas.
- Decisión aprobada y responsable.
- Consecuencias, restricciones y documentos afectados.

Una decisión pendiente no debe presentarse como requisito confirmado.

### 3. Especificar con EARS

Usar requisitos atómicos, numerados y comprobables. Cada requisito debe expresar una sola obligación con “deberá”.

| Patrón | Forma recomendada |
| --- | --- |
| Ubícuo | La aplicación deberá `<respuesta>` |
| Dirigido por evento | Cuando `<evento>`, la aplicación deberá `<respuesta>` |
| Dependiente de estado | Mientras `<estado>`, la aplicación deberá `<respuesta>` |
| Función opcional | Donde `<opción habilitada>`, la aplicación deberá `<respuesta>` |
| Comportamiento no deseado | Si `<condición adversa>`, la aplicación deberá `<respuesta>` |
| Complejo | Mientras `<estado>`, cuando `<evento>`, la aplicación deberá `<respuesta>` |

Evitar “rápido”, “fácil”, “adecuado” y otros términos no medibles. Definir unidades, tolerancias y condiciones observables cuando correspondan.

### 4. Revisar la especificación

Comprobar antes de solicitar aprobación:

- Trazabilidad hacia una historia y el enunciado original.
- Requisitos completos, consistentes, atómicos y verificables.
- Casos normales, límites, errores, permisos y estados de aplicación.
- Requisitos offline, privacidad y accesibilidad.
- Dependencias y fuera de alcance.
- Criterios de aceptación y estrategia de prueba.
- Preguntas abiertas visibles y sin respuestas asumidas.

No marcar una especificación como aprobada. Registrar únicamente la aprobación explícita del responsable.

### 5. Preparar el plan

Solo desde una especificación aprobada:

- Describir el diseño mínimo que satisface los requisitos.
- Identificar componentes afectados, modelo de estado, persistencia e integración con plataforma.
- Verificar las API contra la documentación de Expo SDK 58 y versiones instaladas.
- Registrar riesgos, alternativas y decisiones técnicas necesarias.
- Diseñar pruebas por requisito antes de dividir el trabajo.
- Mantener una matriz de trazabilidad entre requisito, cambio y prueba.

El plan no debe ampliar el alcance ni resolver preguntas funcionales por cuenta propia.

### 6. Dividir en tareas

Cada tarea debe ser pequeña, ejecutable y verificable, e incluir:

- Identificador y objetivo.
- Requisitos y criterios cubiertos.
- Archivos o áreas previstos.
- Dependencias y precondiciones.
- Pasos de implementación sin introducir requisitos nuevos.
- Pruebas y evidencia esperada.
- Condición explícita de finalización.

Ordenar tareas según dependencias. Una tarea no debe mezclar funcionalidades independientes.

### 7. Implementar y probar

- Implementar una sola tarea autorizada.
- Hacer el cambio mínimo y conservar trabajo ajeno.
- Ejecutar primero pruebas específicas y luego validaciones generales aplicables.
- Ejecutar como mínimo lint y comprobación de TypeScript antes de declarar terminado el trabajo de código.
- Registrar comandos, resultados, limitaciones y pruebas manuales pendientes.
- Detenerse si aparece una contradicción o requisito no especificado.

## Evidencia de prueba

Registrar por tarea:

| Campo | Contenido |
| --- | --- |
| Tarea | Identificador implementado |
| Requisitos | Identificadores cubiertos |
| Entorno | Plataforma y condiciones relevantes |
| Comando o procedimiento | Acción reproducible |
| Resultado | Aprobado o fallido, con detalle |
| Evidencia pendiente | Validaciones no ejecutadas y motivo |

No ocultar fallos ni declarar cobertura que no fue ejecutada.

## Reglas de detención

Detener y consultar cuando:

- La historia o especificación siga en borrador.
- Falte el enunciado original necesario para validar alcance.
- Existan criterios contradictorios o no medibles.
- Una decisión afecte permisos, datos, red, accesibilidad o comportamiento esencial y no esté aprobada.
- La implementación requiera ampliar el alcance o agregar una dependencia no prevista.
