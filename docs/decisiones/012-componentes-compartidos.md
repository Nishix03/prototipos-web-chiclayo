# 012 · Reutilizar comportamiento sin uniformar apariencia

Fecha: 2026-11-01. Estado: implementado para revisión visual.

## Contexto

Aplicación de `plan-mejora-prototipos-chiclayo.md`, priorizando rendimiento y una identidad distinta por negocio.

## Decisión

Se comparte la representación semántica de etapas en paso-progreso y el motor de render bajo demanda. La selección de barbero, fases y sesiones conserva los datos y restricciones de su rubro; no se añade una abstracción de tarjetas que imponga el mismo aspecto a todos.

## Verificación

Build, pruebas de interacción, Control a 360/1440 y hoja por ronda; evidencia en `docs/visual/REDISENO-2026-11-01.md`. La aceptación estética corresponde a Iván.
