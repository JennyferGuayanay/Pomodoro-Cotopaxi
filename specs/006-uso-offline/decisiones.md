# Decisiones — HU-006, uso offline

## Estado

Decisiones documentadas para revisión. Las decisiones no resueltas no se consideran requisitos aprobados.

## DEC-006-01 — Retirar «Explore» y sus enlaces externos

- **Fecha:** 2026-10-20.
- **Contexto y requisito:** La pantalla de ejemplo «Explore» y sus enlaces externos no forman parte del temporizador ni de la configuración y abren contenido en Internet; HU-006-R03 y HU-006-R07.
- **Opciones consideradas:** Mantener la pantalla y advertir que requiere conexión; retirar únicamente los enlaces; retirar la pantalla de ejemplo y sus accesos/enlaces.
- **Decisión:** El responsable autorizó eliminar la pantalla de ejemplo, sus accesos en Android/web y sus enlaces externos, conservando temporizador y configuración.
- **Responsable:** Responsable del producto, mediante instrucción explícita del 2026-10-20.
- **Consecuencias:** Se elimina la ruta `explore`, se retira el componente de enlaces externos si queda sin usos y se conservan las rutas Home y Configuración. No se cambian las dependencias del manifiesto ni la lógica de HU-001 a HU-005.
- **Estado:** Aprobada para el alcance exacto anterior.

## DEC-006-02 — Definir el criterio de conectividad Android

- **Fecha:** 2026-10-20.
- **Contexto y requisito:** HU-006-R03; el usuario preguntó si además de operar offline el paquete debe carecer del permiso Android `INTERNET`.
- **Opciones consideradas:** Exigir ausencia del permiso `INTERNET`; exigir únicamente que ninguna función de la aplicación dependa de la conectividad.
- **Decisión:** Se exige independencia funcional de Internet. No se exige demostrar ausencia del permiso `INTERNET`.
- **Responsable:** Responsable del producto, mediante selección explícita el 2026-10-20.
- **Consecuencias:** No se inspecciona ni cambia permiso nativo como parte de HU-006. La validación de operación offline en dispositivo permanece requerida.
- **Estado:** Aprobada para la revisión de HU-006.

## DEC-006-03 — Usar versiones actuales como baseline de regresión

- **Fecha:** 2026-10-20.
- **Contexto y requisito:** HU-006 requiere conservar las funciones existentes de HU-001 a HU-005; HU-001, HU-003 y HU-004 están marcadas como borrador.
- **Opciones consideradas:** Esperar aprobación de esas historias; usar las versiones actuales únicamente como referencia de regresión de HU-006.
- **Decisión:** Usar implementaciones y criterios actuales de HU-001, HU-003 y HU-004 como baseline de regresión de esta historia.
- **Responsable:** Responsable del producto, mediante selección explícita el 2026-10-20.
- **Consecuencias:** Esta decisión no aprueba ni cambia el estado de las otras historias.
- **Estado:** Aprobada para la revisión de HU-006.

## DEC-006-04 — Aplicar la constitución como política de privacidad

- **Fecha:** 2026-10-20.
- **Contexto y requisito:** HU-006-R06; principio 3 de `docs/constitution.md`.
- **Opciones consideradas:** Aplicar la constitución vigente; agregar una política institucional específica para diagnósticos/telemetría.
- **Decisión:** La constitución vigente es suficiente para esta historia. No se agregan reglas institucionales adicionales en HU-006.
- **Responsable:** Responsable del producto, mediante selección explícita el 2026-10-20.
- **Consecuencias:** No añadir rastreo, telemetría ni transferencia de datos sin una decisión explícita y aprobada; esta tarea no incorpora servicios remotos.
- **Estado:** Aprobada para la revisión de HU-006.
