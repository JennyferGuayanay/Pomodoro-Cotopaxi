# Tareas — HU-003

Estado: Aprobadas explícitamente por el responsable para implementación (2026-10-19)

- [ ] T-001. Revisar el estado actual de HU-001 y HU-002 y las dependencias disponibles. Hecho cuando: exista una decisión técnica documentada que no rompa las funcionalidades existentes. RF: R01-R03, R18.
- [x] T-002. Incorporar almacenamiento local compatible y un modelo persistido validable y versionado. Hecho cuando: se pueda guardar y recuperar estado válido y rechazar registros inválidos. RF: R01-R03, R17, R19. Evidencia: pruebas automatizadas de modelo, validación y AsyncStorage aprobadas.
- [x] T-003. Implementar reconciliación temporal y recuperación de estados en ejecución, pausado, detenido y confirmación de reinicio. Hecho cuando: las pruebas comprueben tiempos correctos, tolerancia de un segundo y estados seguros. RF: R04-R08, R13-R16, R19. Evidencia: pruebas deterministas para marcas temporales, pausa, detención, confirmación de reinicio y datos inválidos aprobadas.
- [x] T-004. Integrar la recuperación al inicio de la aplicación y el guardado en cada transición relevante. Hecho cuando: no aparezca un temporizador provisional interactivo y los estados se restauren. RF: R01, R07-R08, R18.
- [ ] T-005. Resolver una finalización ocurrida durante la ausencia exactamente una vez. Hecho cuando: las pruebas comprueben la transición única de estudio o descanso y el inicio manual de la fase siguiente. RF: R09-R12.
- [ ] T-006. Ejecutar pruebas de regresión y validar offline en Android. Hecho cuando: TypeScript, Jest y los cuatro escenarios originales de HU-003 estén comprobados. RF: R01-R19.

## Regla de trabajo

Implementar tareas en orden, con pruebas antes de aprobar cada una. No marcar tareas como completadas sin comprobación.

La aprobación inicial del responsable del 2026-10-19 autorizó T-002. La autorización vigente de la continuación autoriza únicamente T-003; T-004, T-005 y T-006 siguen fuera de alcance.

## Evidencia de T-002

- Entorno: Windows, Node.js con Expo SDK 58; AsyncStorage `2.2.0` ya estaba instalado.
- `npm test -- --runInBand`: aprobado, 68 pruebas.
- `npx tsc --noEmit`: aprobado.
- ESLint focalizado en los dos archivos nuevos: aprobado.
- `npx expo lint`: no aprobado por un error preexistente en `src/hooks/use-color-scheme.web.ts:11` (`react-hooks/set-state-in-effect`); no se modificó porque está fuera de T-002.
- `git diff --check`: aprobado.
- Validación manual Android/offline: pendiente; no corresponde a T-002.

## Evidencia de T-003

- Entorno: Windows, Node.js, reloj controlado en milisegundos.
- `npm test -- --runInBand`: aprobado, 78 pruebas en 7 suites.
- `npx tsc --noEmit`: aprobado.
- ESLint focalizado en los archivos de persistencia: aprobado.
- `git diff --check`: aprobado.
- Integración con la pantalla y validación manual en Android: pendientes y fuera del alcance de T-003.
