import { html } from './html.js';

/**
 * <img> con ancho y alto reales (render.js los lee del archivo con sharp antes de llamar
 * a los componentes). Con width/height el navegador reserva el espacio y la página no
 * "salta" al cargar la foto (CLS).
 * Las imágenes de arriba (prioridad) se cargan ya; el resto, solo al acercarse (lazy).
 * Si la imagen trae variantes más pequeñas, se arma srcset + sizes: el celular elige la
 * que necesita en vez de descargar la de escritorio.
 *
 * @param {object} [opciones]
 * @param {string} [opciones.sizes]  ancho con que se muestra, p. ej. "(min-width: 60rem) 40vw, 100vw"
 */
export function imagen(
  { src, alt, ancho, alto, variantes = [] },
  { prioridad = false, sizes = '100vw' } = {},
) {
  const srcset = variantes.length
    ? [...variantes, { src, ancho }]
        .sort((a, b) => a.ancho - b.ancho)
        .map((v) => `${v.src} ${v.ancho}w`)
        .join(', ')
    : '';
  return html`<img
    src="${src}"
    ${srcset ? html`srcset="${srcset}" sizes="${sizes}"` : ''}
    alt="${alt}"
    width="${ancho}"
    height="${alto}"
    ${prioridad ? html`fetchpriority="high"` : html`loading="lazy"`}
    decoding="async"
  />`;
}
