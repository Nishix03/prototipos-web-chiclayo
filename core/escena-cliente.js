// Navegador: el arranque de la escena 3D de un rubro, igual en todos (ADR 008).
//
// - Con ?poster dibuja la escena quieta en sus encuadres para scripts/poster.js.
// - Si no, la escena llega al explorar (si puede3d()). El movimiento de interfaz
//   se inicia por separado desde cliente.js; no espera a Three.js.
import { puede3d, cuandoExplore } from './carga3d.js';

/** Avance del scroll entre la portada (0) y el momento en que `selector` llega arriba (1). */
export function avanceHasta(selector) {
  return () => {
    const destino = document.querySelector(selector);
    const fin = Math.max(1, destino.offsetTop - innerHeight * 0.25);
    return Math.min(1, Math.max(0, scrollY / fin));
  };
}

/**
 * @param {object} o
 * @param {() => Promise<{montar: Function}>} o.escena  import() del montaje del rubro
 * @param {() => number} o.avance
 * @param {Array<[string, number, number]>} o.posters  [nombre, ancho, alto] de cada encuadre
 * @param {(escena: object) => void} [o.alMontar]
 */
export function iniciarEscena({ escena, avance, posters, alMontar }) {
  if (new URLSearchParams(location.search).has('poster')) {
    escena().then(({ montar }) => {
      const fondo = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-fondo')
        .trim();
      window.__posters = posters.map(([nombre, ancho, alto]) => ({
        nombre,
        fondo,
        png: montar(null, () => 0, { fija: true, ancho, alto }).canvas.toDataURL('image/png'),
      }));
    });
    return;
  }
  cuandoExplore(async () => {
    if (puede3d()) {
      const { montar } = await escena();
      const montada = montar(document.querySelector('[data-escena]'), avance);
      alMontar?.(montada);
    }
  });
}
