import { html } from './html.js';

/**
 * <img> con ancho y alto reales (render.js los lee del archivo con sharp antes de llamar
 * a los componentes). Con width/height el navegador reserva el espacio y la página no
 * "salta" al cargar la foto (CLS).
 * Las imágenes de arriba (prioridad) se cargan ya; el resto, solo al acercarse (lazy).
 * srcset con varios tamaños queda para la fase 3 (rendimiento).
 */
export function imagen({ src, alt, ancho, alto }, { prioridad = false } = {}) {
  return html`<img
    src="${src}"
    alt="${alt}"
    width="${ancho}"
    height="${alto}"
    ${prioridad ? html`fetchpriority="high"` : html`loading="lazy"`}
    decoding="async"
  />`;
}
