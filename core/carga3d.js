// Cuándo y si se carga el 3D (ADR 008). Común a todos los rubros.
//
// La página ya está completa con la imagen fija de la escena (que es el LCP). El 3D llega con
// import() cuando la página terminó de cargar y el navegador está libre, y no llega nunca si
// hay movimiento reducido, ahorro de datos, poca memoria o falta WebGL2.

const parametros = () => new URLSearchParams(location.search);

/** ¿Este dispositivo debe recibir la escena 3D? `?3d=0` la apaga, `?3d=forzar` la fuerza. */
export function puede3d() {
  const p = parametros().get('3d');
  if (p === '0') return false;
  if (p === 'forzar') return true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.deviceMemory ?? 8) < 4) return false;
  return !!document.createElement('canvas').getContext('webgl2');
}

/** Corre `fn` después de `load`, en un momento libre del hilo principal. */
export function cuandoEsteLibre(fn) {
  const correr = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(fn, { timeout: 1500 })
      : setTimeout(fn, 200);
  if (document.readyState === 'complete') correr();
  else addEventListener('load', correr, { once: true });
}
