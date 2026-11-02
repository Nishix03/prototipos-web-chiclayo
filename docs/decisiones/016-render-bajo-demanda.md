# 016 · Render 3D activado por interacción

Fecha: 2026-11-01. Estado: implementado para revisión visual.

## Contexto

Aplicación de `plan-mejora-prototipos-chiclayo.md`, priorizando rendimiento y una identidad distinta por negocio.

## Decisión

El bucle anterior evitaba dibujar cuando nada cambiaba, pero seguía ejecutando callbacks cada frame. Se sustituye por requestAnimationFrame bajo demanda, disparado por scroll, resize y puntero. La inercia pide frames solo hasta asentarse y la pestaña oculta cancela el pendiente. Se preservan la escena y su imagen fija.

## Verificación

Build, pruebas de interacción, Control a 360/1440 y hoja por ronda; evidencia en `docs/visual/REDISENO-2026-11-01.md`. La aceptación estética corresponde a Iván.

## Carga móvil

Una primera corrida local del spa dio 74 de rendimiento con LCP 2,09 s, CLS 0,00044 y TBT 1083 ms. El coste estaba en iniciar Three.js y GSAP sin interacción. En punteros táctiles se difieren esas mejoras hasta pointerdown, scroll o teclado; formularios y navegación siguen inmediatos. Escritorio y `?3d=forzar` conservan carga automática. Se comprueba con una prueba que el móvil empieza sin canvas y monta la escena al explorar.
