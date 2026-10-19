---
name: rn-conventions
description: Convenciones de React Native, Expo SDK 58 y TypeScript para implementar Pomodoro-Cotopaxi de forma móvil, accesible y offline.
---

# Skill: Convenciones React Native, Expo y TypeScript

## Contexto técnico

- Aplicación orientada principalmente a Android.
- Expo SDK 58 con React Native y Expo Router.
- TypeScript en modo estricto.
- Rutas en `src/app/`; componentes, hooks, dominio y utilidades fuera de ese directorio.
- Proyecto administrado con `npm` y `package-lock.json`.

Estas convenciones se aplican únicamente después de que una especificación y una tarea estén aprobadas.

## Verificación de API

Antes de usar o modificar una API de Expo, EAS o React Native:

1. Confirmar la versión instalada en `package.json`.
2. Consultar `https://docs.expo.dev/versions/v58.0.0/`.
3. Consultar `https://docs.expo.dev/llms.txt` y la página específica enlazada cuando sea necesario.
4. Registrar en el plan cualquier restricción de plataforma, permiso o necesidad de development build.

No implementar desde memoria API que puedan haber cambiado entre versiones.

## Estructura y responsabilidades

- Mantener archivos de ruta limitados a composición de pantallas y navegación.
- Mantener componentes reutilizables en `src/components/`.
- Mantener hooks en `src/hooks/`.
- Ubicar lógica pura de temporizador, ciclos y validación fuera de componentes visuales.
- Separar acceso a persistencia y servicios de plataforma del modelo de dominio.
- No crear archivos en `ios/` o `android/` si el proyecto usa Continuous Native Generation.
- Configurar comportamiento nativo mediante configuración de Expo y config plugins solo cuando una tarea aprobada lo requiera.

## TypeScript

- Mantener `strict: true` y corregir errores en lugar de silenciarlos.
- Evitar `any`; usar `unknown` y refinamiento cuando la entrada no sea confiable.
- Modelar estados finitos y tipos de sesión con uniones discriminadas cuando mejore la seguridad.
- Validar datos persistidos antes de utilizarlos.
- Evitar aserciones `as`, operadores `!` y conversiones inseguras salvo justificación localizada.
- Exportar tipos únicamente cuando exista un consumidor real.
- Mantener funciones pequeñas y puras para cálculos temporales y transiciones cuando sea posible.

## React y React Native

- Usar componentes funcionales y patrones modernos compatibles con la versión instalada.
- Mantener el estado mínimo; derivar valores en render cuando no requieran persistencia.
- No usar `useMemo` o `useCallback` por defecto, especialmente con React Compiler habilitado.
- Limpiar timers, listeners y suscripciones en el ciclo de vida correspondiente.
- No usar un intervalo en memoria como única fuente de verdad del tiempo transcurrido.
- Evitar trabajo costoso en el hilo de interfaz y renderizados disparados a frecuencia innecesaria.
- Usar componentes y API nativas de React Native en lugar de supuestos del DOM.
- Respetar áreas seguras, distintos tamaños de pantalla, teclado y orientación configurada.

## Navegación

- Usar Expo Router para toda navegación.
- Conservar pantallas exclusivamente dentro de `src/app/`.
- Importar `Link`, `router` y `useLocalSearchParams` desde `expo-router` cuando corresponda.
- No colocar componentes auxiliares, modelos ni pruebas dentro del árbol de rutas.
- Mantener rutas y parámetros tipados según la configuración disponible.

## Tiempo, estado y persistencia

- Representar duraciones y marcas temporales con una unidad explícita y consistente.
- Calcular recuperación desde referencias temporales persistidas; no asumir que los timers continúan al bloquear o cerrar la aplicación.
- Definir transiciones de estado de forma determinista y probarlas sin depender del reloj real.
- Persistir solo la información mínima necesaria y tratar los datos almacenados como entrada no confiable.
- Evitar condiciones de carrera entre actualización visual, persistencia, ciclo y avisos.
- No adoptar una biblioteca de almacenamiento o notificaciones hasta que el plan aprobado y la documentación de Expo confirmen la opción.

## Offline y privacidad

- Ninguna función esencial debe depender de una solicitud de red.
- Incluir localmente los recursos esenciales autorizados.
- No añadir cuentas, analítica, publicidad, telemetría ni servicios remotos sin especificación aprobada.
- Revisar las dependencias por comportamiento de red y tratamiento de datos.

## Accesibilidad

- Proporcionar nombre, rol, estado y ayuda accesibles cuando sean necesarios.
- Mantener áreas táctiles adecuadas y controles operables sin gestos complejos obligatorios.
- No comunicar estado solamente mediante color, sonido o vibración.
- Admitir escalado de texto y comprobar truncamiento.
- Respetar contraste y preferencias del sistema; confirmar los valores de marca antes de aplicarlos.
- Anunciar cambios relevantes del temporizador sin producir anuncios excesivos.

## Dependencias y comandos

- No instalar dependencias sin una necesidad trazable y aprobación.
- Usar `npx expo install <paquete>` para resolver versiones compatibles con Expo.
- Ejecutar `npx expo lint` y `npx tsc --noEmit` antes de cerrar una tarea de código.
- Usar `npx expo-doctor` cuando el trabajo cambie o diagnostique configuración o dependencias.
- Una biblioteca con código nativo requiere un development build; no asumir que estará disponible en Expo Go.

## Pruebas

- Priorizar pruebas unitarias deterministas para tiempo, ciclos, validación y recuperación.
- Añadir pruebas de integración para persistencia, ciclo de vida y permisos cuando estén especificadas.
- Verificar manualmente en Android los avisos, segundo plano, bloqueo, accesibilidad y condiciones offline.
- Relacionar cada prueba con requisitos y criterios aprobados.
- Registrar pruebas no ejecutadas y su motivo.
