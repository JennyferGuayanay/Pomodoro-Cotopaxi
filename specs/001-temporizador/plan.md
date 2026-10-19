# Plan de implementación: 001-temporizador

## Estado

**Aprobado. Autoriza la implementación secuencial de T-000 a T-006.**

- Fecha de aprobación: 2026-10-19.
- Responsable de aprobación: Responsable del proyecto.

- Especificación de origen: `specs/001-temporizador/spec.md`.
- Estado de la especificación: Aprobada el 2026-10-19.
- Historia: HU-001, Control básico del temporizador.
- Plataforma principal: Android.
- Base técnica: Expo SDK 58, React Native 0.88, React 19.3 y TypeScript estricto.

## Objetivo técnico

Implementar los cuatro escenarios aprobados de HU-001 mediante un modelo temporal determinista, una interfaz móvil accesible y un diálogo nativo de confirmación, sin incorporar comportamiento de otras historias.

## Alcance del plan

- Estado detenido, en ejecución, pausado y confirmación de reinicio.
- Inicio desde la duración configurada o 25 minutos para estudio cuando no exista una válida.
- Pausa y reanudación sin pérdida del tiempo restante.
- Suspensión durante el diálogo de reinicio.
- Cancelación que recupera estado y tiempo.
- Reinicio que restaura la duración inicial y deja el temporizador detenido.
- Formato `MM:SS`, redondeo hacia arriba y minutos superiores a 99.
- Controles visibles según el estado.
- Accesibilidad y funcionamiento sin red.
- Pruebas unitarias deterministas y pruebas de componente.

## Fuera de alcance

- Ciclos y transición de fases de HU-002.
- Recuperación tras bloqueo, segundo plano o cierre de HU-003.
- Notificaciones, sonido y vibración de HU-004.
- Edición o persistencia de duraciones de HU-005.
- Cuentas, publicidad y otras funciones de HU-006.
- Identidad visual definitiva de Academia Cotopaxi.
- Eliminación de rutas o navegación de la plantilla que no sea necesaria para HU-001.
- Cambios en `app.json`, `eas.json`, directorios nativos o permisos.

## Estado actual relevante

- `src/app/index.tsx` muestra el contenido inicial de Expo y será reemplazado por la composición de la pantalla del temporizador.
- Expo Router ya está configurado y la ruta principal debe permanecer en `src/app/index.tsx`.
- Existen `ThemedText`, `ThemedView`, tokens neutrales y soporte de tema claro/oscuro reutilizables.
- No hay infraestructura de pruebas ni scripts de Jest instalados.
- `npx tsc --noEmit` presenta un error preexistente en `src/components/app-tabs.web.tsx:38`; debe resolverse como prerrequisito de la puerta global de TypeScript, sin ampliar la funcionalidad.
- La identidad visual institucional sigue pendiente; este plan usa únicamente tokens neutrales existentes.

## Diseño propuesto

### 1. Modelo de dominio

Crear un módulo puro en `src/features/timer/timer-state.ts` con:

- Duraciones expresadas internamente en milisegundos.
- Constante predeterminada de estudio de 25 minutos.
- Unión discriminada para estados `stopped`, `running`, `paused` y `confirmingReset`.
- Funciones puras para iniciar, pausar, reanudar, solicitar reinicio, cancelar y confirmar.
- Función pura para calcular el tiempo restante desde una referencia temporal recibida.
- Función pura para convertir milisegundos a `MM:SS` mediante redondeo hacia arriba.

El módulo no importará React, Expo, almacenamiento, red ni API de plataforma.

### 2. Representación del estado

| Estado | Información mínima | Acción siguiente válida |
| --- | --- | --- |
| `stopped` | Duración inicial y tiempo visible | Iniciar |
| `running` | Duración inicial y marca temporal de finalización | Pausar o solicitar reinicio |
| `paused` | Duración inicial y tiempo restante | Reanudar o solicitar reinicio |
| `confirmingReset` | Duración inicial, tiempo suspendido y estado previo | Cancelar o confirmar reinicio |

El intervalo de actualización no será la fuente de verdad. Mientras se ejecuta, el tiempo se derivará de una marca de finalización y del reloj actual. Al llegar a cero, la fase dejará de ejecutarse y mostrará `00:00`; cualquier transición de ciclo seguirá fuera de alcance.

### 3. Ejecución en React

Crear `src/hooks/use-timer.ts` para conectar el modelo puro con React:

- Inicializar el estado detenido con la duración aplicable.
- Obtener el tiempo actual mediante una función de reloj inyectable o sustituible en pruebas.
- Programar únicamente actualizaciones visuales mientras el estado sea `running`.
- Limpiar el temporizador de actualización al pausar, solicitar reinicio, desmontar o llegar a cero.
- Derivar el texto visible con la función de formato pura.
- Exponer acciones tipadas para la interfaz.

La frecuencia de actualización se limitará a la necesaria para mantener correcta la visualización por segundos. Cada actualización recalculará desde la referencia temporal para evitar acumulación de deriva.

### 4. Interfaz y diálogo

Crear `src/components/pomodoro-timer.tsx` para:

- Mostrar estado y tiempo restante.
- Mostrar `Iniciar` cuando esté detenido.
- Mostrar `Pausar` y `Reiniciar` cuando esté en ejecución.
- Mostrar `Reanudar` y `Reiniciar` cuando esté pausado.
- Usar `Alert.alert` de React Native para el mensaje `¿Deseas reiniciar el temporizador?`.
- Configurar exactamente dos acciones: `Cancelar` y `Reiniciar`.
- Mantener el diálogo no cancelable al tocar fuera en Android para que toda salida ejecute una decisión especificada.
- Despachar cancelación o confirmación desde los callbacks del diálogo.

React Native admite dos botones en Android como acción negativa y positiva. No se requiere una dependencia Expo ni configuración nativa para este diálogo. Antes de implementar se comprobará la firma disponible en los tipos instalados de React Native 0.88.

### 5. Pantalla Expo Router

Reducir `src/app/index.tsx` a composición de pantalla:

- Mantener `SafeAreaView` y los componentes temáticos existentes.
- Renderizar el componente del temporizador.
- Eliminar únicamente el contenido de bienvenida de la ruta principal.
- No introducir lógica de dominio en el archivo de ruta.
- No modificar las demás rutas ni la navegación como parte de HU-001.

### 6. Accesibilidad

- Usar controles táctiles con al menos 48 dp de alto.
- Exponer rol de botón, etiqueta visible y estado deshabilitado cuando corresponda.
- Exponer el estado del temporizador como texto, no solo color.
- Proporcionar una etiqueta comprensible para el tiempo mostrado.
- Evitar anuncios de lector de pantalla cada segundo; anunciar acciones o cambios de estado relevantes sin ruido continuo.
- Comprobar escalado de texto y ausencia de truncamiento en Android.

### 7. Diseño visual provisional

- Reutilizar `ThemedText`, `ThemedView`, `Spacing` y colores neutrales existentes.
- No declarar los colores actuales como institucionales.
- Mantener la jerarquía centrada en tiempo, estado y acción primaria.
- No incorporar animaciones, ilustraciones o recursos de marca no especificados.

## Archivos previstos

| Archivo | Acción prevista | Motivo |
| --- | --- | --- |
| `package.json` | Modificar | Configurar Jest y script de pruebas |
| `package-lock.json` | Modificar mediante instalación autorizada | Registrar dependencias de prueba compatibles |
| `tsconfig.json` | Modificar | Incluir tipos de Jest según la guía Expo |
| `src/components/app-tabs.web.tsx` | Corrección mínima | Eliminar el error TypeScript preexistente que bloquea la validación global |
| `src/features/timer/timer-state.ts` | Crear | Modelo temporal y formato puros |
| `src/features/timer/__tests__/timer-state-test.ts` | Crear | Pruebas deterministas del dominio |
| `src/hooks/use-timer.ts` | Crear | Integración del reloj y ciclo de vida React |
| `src/hooks/__tests__/use-timer-test.ts` | Crear | Pruebas de actualización y limpieza con reloj controlado |
| `src/components/pomodoro-timer.tsx` | Crear | Interfaz y diálogo de confirmación |
| `src/components/__tests__/pomodoro-timer-test.tsx` | Crear | Pruebas de controles, diálogo y accesibilidad |
| `src/app/index.tsx` | Modificar | Componer la pantalla principal del temporizador |

La lista es una previsión. Si la implementación requiere otro archivo o dependencia, se detendrá para actualizar y aprobar el plan.

## Dependencias de prueba propuestas

La documentación de Expo recomienda Jest con `jest-expo` y React Native Testing Library. El proyecto no dispone actualmente de un ejecutor de pruebas.

Comando previsto para Windows, a ejecutar únicamente durante una tarea aprobada:

```powershell
npx expo install jest-expo jest @types/jest @testing-library/react-native "--" --dev
```

Configuración prevista:

- Jest 30, requerido por `jest-expo` en Expo SDK 58.
- Preset `jest-expo`.
- `@testing-library/react-native` 14 o posterior.
- Script no interactivo `test` para la ejecución completa.
- Tipos de Jest en TypeScript sin relajar `strict`.
- Pruebas fuera de `src/app/`, porque todo archivo en esa carpeta es una ruta Expo Router.

No se proponen dependencias de producción.

## Estrategia de pruebas

### Pruebas unitarias del dominio

- Estado inicial de 25 minutos y duración configurada distinta.
- Inicio y cálculo por marca de finalización.
- Pausa que conserva tiempo.
- Permanencia en pausa.
- Reanudación desde el valor conservado.
- Suspensión al solicitar reinicio desde ejecución y pausa.
- Cancelación que recupera cada estado anterior.
- Confirmación que restaura duración y detiene.
- Redondeo hacia arriba de fracciones positivas.
- `00:00` en cero y ausencia de valores negativos.
- Minutos superiores a 99 sin truncamiento.

### Pruebas del hook

- Actualización solo mientras está en ejecución.
- Ausencia de deriva acumulada al usar el reloj de referencia.
- Limpieza de actualizaciones al pausar, confirmar, cancelar, finalizar y desmontar.
- Congelación durante confirmación y reanudación correcta al cancelar.

### Pruebas del componente

- Visibilidad exacta de controles en cada estado.
- Mensaje y botones exactos del diálogo.
- Callback de `Cancelar` y callback de `Reiniciar`.
- Estado y tiempo visibles mediante consultas accesibles.
- Etiquetas, roles y áreas táctiles previstas.
- Ausencia de dependencias de red.

### Validación manual Android

- Recorrer los cuatro escenarios originales en un dispositivo o emulador Android.
- Mantener abierto el diálogo y comprobar que el tiempo no cambia.
- Comprobar `Cancelar` desde ejecución y pausa.
- Comprobar `Reiniciar` desde ejecución y pausa.
- Activar modo avión y repetir los controles.
- Comprobar TalkBack, escalado de fuente y temas claro/oscuro.

## Matriz de trazabilidad

| Requisitos | Diseño | Pruebas principales |
| --- | --- | --- |
| R01-R03 | Modelo, hook y pantalla | Inicio configurado y predeterminado |
| R04-R06 | Modelo y hook | Pausa, permanencia y reanudación |
| R07-R11 | Modelo, hook y `Alert` | Solicitud, suspensión, cancelación y confirmación |
| R12-R13 | Componente accesible | Roles, etiquetas, estado textual y TalkBack |
| R14 | Arquitectura local sin servicios | Repetición manual en modo avión |
| R15 | Formateador puro | Fracciones, cero y minutos superiores a 99 |
| R16-R18 | Renderizado condicional | Controles visibles por estado |

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| El intervalo deriva o se retrasa | Tiempo visual incorrecto | Derivar desde marca de finalización, no desde conteo de ticks |
| Callback del diálogo usa estado obsoleto | Cancelación o reinicio incorrectos | Representar la confirmación dentro del modelo y despachar eventos |
| El diálogo se cierra sin callback | Estado suspendido indefinidamente | Usar dos botones y `cancelable: false` en Android |
| Anuncios accesibles cada segundo | Experiencia ruidosa | No usar región viva agresiva para cada tick |
| Pruebas dependen del reloj real | Resultados intermitentes | Inyectar reloj y usar temporizadores falsos |
| El error TypeScript existente oculta regresiones | Puerta global fallida | Resolverlo aisladamente antes de validar HU-001 |
| La marca institucional no está confirmada | Retrabajo visual | Usar tokens neutrales existentes |

## Documentación técnica consultada

- Expo SDK 58: `https://docs.expo.dev/versions/v58.0.0/`.
- Pruebas unitarias con Jest: `https://docs.expo.dev/develop/unit-testing.md`.
- Pruebas con Expo Router: `https://docs.expo.dev/router/reference/testing.md`.
- React Native `Alert`: `https://reactnative.dev/docs/alert`.

La referencia pública de `Alert` consultada describe el comportamiento Android de dos botones y opciones de cancelación. Durante implementación se validará además la firma incluida en React Native 0.88 instalado.

## Puertas de calidad

- El plan y `tasks.md` deben aprobarse antes de editar código o instalar dependencias.
- Cada tarea se implementará por separado y registrará evidencia.
- Las pruebas específicas deberán pasar antes de avanzar a la siguiente tarea dependiente.
- Al cierre se ejecutarán `npm test -- --runInBand`, `npx expo lint` y `npx tsc --noEmit`.
- Se registrará cualquier validación manual no ejecutada.

## Criterio de finalización del plan

HU-001 estará lista para aceptación cuando todas las tareas aprobadas estén terminadas, las pruebas trazadas pasen, la validación Android esté registrada y los criterios SPEC-001-CA01 a SPEC-001-CA19 hayan sido cubiertos sin implementar alcance de HU-002 a HU-006.
