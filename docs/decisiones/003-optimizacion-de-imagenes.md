# 003 – Optimización de imágenes con vite-plugin-image-optimizer y sharp

- **Estado:** aceptada (corrige un supuesto del plan)
- **Fecha:** 2026-10-25
- **Fase:** 1

## Contexto

El plan decía que Vite "en producción minifica y optimiza imágenes". Vite sí minifica CSS y JS y pone un hash en el nombre de cada imagen, pero **no las comprime ni las convierte**. Las fotos son lo que más pesa en una web de negocio local y la meta es cargar en menos de 2 s en 4G.

## Opciones consideradas

1. **`vite-plugin-image-optimizer` + `sharp`.** Comprime en el build cada imagen que termina en `dist/`, sin cambiar el código. sharp es la librería de imágenes más usada en Node (rápida, basada en libvips).
2. **Un script propio con sharp** que convierte las originales a WebP/AVIF antes del build. Más control, pero es otro paso que recordar y código que mantener.
3. **No optimizar** y confiar en que las fotos ya vengan livianas. Con fotos tomadas por el dueño desde el celular (3–6 MB), no es realista.

## Decisión

Opción 1. sharp se reutiliza además en `core/render.js` para leer el ancho y alto real de cada foto y escribir `width`/`height` en el `<img>`.

## Consecuencias

- Las imágenes de `dist/` salen comprimidas (WebP calidad 80, AVIF 60) sin pasos manuales.
- El esquema solo acepta `.webp` y `.avif` en `negocio.json`: la conversión desde JPG/PNG se hace al recibir las fotos (con el script `webp_convert.py` de crear-web-como-servicio o con sharp), no en el build.
- Con `width`/`height` el navegador reserva el espacio de cada foto y la página no salta al cargar (CLS).
- Pendiente para la fase 3: generar varios tamaños por foto y servirlos con `srcset`, para que el celular no descargue la versión de escritorio.
- sharp trae binarios nativos por sistema operativo; `npm ci` en GitHub Actions (Linux) instala los correctos solo.
