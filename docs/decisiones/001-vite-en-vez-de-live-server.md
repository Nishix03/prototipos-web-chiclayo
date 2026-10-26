# 001 – Vite en vez de Live Server

- **Estado:** aceptada
- **Fecha:** 2026-10-25
- **Fase:** 1

## Contexto

Necesitamos un entorno de desarrollo para 6 prototipos que comparten un núcleo (`core/`) y que deben:

- usar módulos ES (`import`/`export`) para separar el código por responsabilidad;
- generar el HTML desde `negocio.json` al construir (ver [ADR 002](002-prerender-en-vez-de-render-en-navegador.md));
- salir optimizados a producción (CSS y JS minificados, imágenes WebP/AVIF) para cargar en menos de 2 s en 4G;
- publicarse como archivos estáticos en GitHub Pages.

## Opciones consideradas

1. **Live Server (extensión de VS Code).** Cero configuración, ya la conocemos. Pero solo sirve archivos tal cual: no tiene paso de build, no minifica, no optimiza imágenes y no puede convertir JSON en HTML. Habría que publicar el código fuente sin optimizar.
2. **Un framework (Astro, Next, Eleventy).** Resuelven el prerender, pero añaden su propio lenguaje de plantillas y conceptos que ocultan cómo funciona la web, y el objetivo de aprendizaje es practicar DOM y ES6 directamente.
3. **Vite.** Un servidor de desarrollo que entiende módulos ES de forma nativa y recarga al instante, más un build de producción que minifica y empaqueta. Se extiende con plugins escritos en JavaScript normal, así que el prerender lo programamos nosotros.

## Decisión

Usamos **Vite** en modo multipágina: cada carpeta de rubro (y `_ejemplo/`) es una página de entrada con su propio `index.html`.

## Consecuencias

- `npm run dev` recarga al guardar; `npm run build` deja en `dist/` solo archivos estáticos listos para GitHub Pages.
- El prerender es un plugin propio (`core/render.js`): se aprende cómo funciona un build por dentro, a cambio de mantener ese código.
- Hay que configurar `base: '/prototipos-web-chiclayo/'`, porque GitHub Pages sirve el sitio en una subcarpeta.
- Añadimos Node y npm como requisito para trabajar (no para ver la web publicada).
