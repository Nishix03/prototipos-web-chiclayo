// Navegador: la parte liviana de «La mesa norteña». Decide si llega el 3D y las coreografías (ADR 008),
// hace volar el papel del plato hasta la barra al agregarlo.
// No importa Three.js ni GSAP: esos llegan con import() solo si hacen falta.
import { puede3d, cuandoEsteLibre } from '../../core/carga3d.js';

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 0 en la portada, 1 cuando la carta llega arriba: el recorrido sobre la mesa termina. */
export function avanceDelScroll() {
  const carta = document.getElementById('carta');
  const fin = Math.max(1, carta.offsetTop - innerHeight * 0.25);
  return Math.min(1, Math.max(0, scrollY / fin));
}

// El plato «sale volando» del botón hasta la barra del pedido (con el nombre del plato).
// Con teclado (detail 0) o movimiento reducido no vuela: el cambio se ve en la barra.
function volar(e) {
  const boton = e.target.closest('[data-accion="agregar"], [data-accion="sumar"]');
  if (!boton || e.detail === 0 || reducido()) return;
  const barra = document.querySelector('[data-barra]');
  const nombre = boton.closest('[data-plato]')?.dataset.nombre;
  if (!barra || !nombre) return;
  requestAnimationFrame(() => {
    const desde = boton.getBoundingClientRect();
    const hasta = barra.getBoundingClientRect();
    const papel = Object.assign(document.createElement('div'), {
      className: 'plato-volador',
      textContent: nombre,
    });
    papel.setAttribute('aria-hidden', 'true');
    Object.assign(papel.style, { left: `${desde.left}px`, top: `${desde.top}px` });
    document.body.append(papel);
    const dx = hasta.left + 24 - desde.left;
    const dy = hasta.top - desde.top;
    const vuelo = papel.animate(
      [
        { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
        {
          transform: `translate(${dx * 0.35}px, ${Math.min(dy, 0) - 50}px) rotate(-6deg)`,
          opacity: 1,
          offset: 0.35,
        },
        { transform: `translate(${dx}px, ${dy}px) rotate(4deg) scale(0.6)`, opacity: 0.4 },
      ],
      { duration: 480, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' }, // ya está en pantalla: ease-in-out
    );
    vuelo.onfinish = () => {
      papel.remove();
      barra.removeAttribute('data-latido');
      void barra.offsetWidth; // reinicia el latido si llegan dos platos seguidos
      barra.setAttribute('data-latido', '');
    };
  });
}

// Modo imagen fija (scripts/poster.js): dibuja la escena quieta en los dos encuadres
async function generarImagenesFijas() {
  const { montar } = await import('./montar.js');
  const fondo = getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim();
  const originales = [
    ['mesa-nortena', 1440, 900],
    ['mesa-nortena-movil', 900, 1948],
  ];
  window.__posters = originales.map(([nombre, ancho, alto]) => ({
    nombre,
    fondo,
    png: montar(null, () => 0, { fija: true, ancho, alto }).canvas.toDataURL('image/png'),
  }));
}

export function iniciarPase() {
  if (new URLSearchParams(location.search).has('poster')) return generarImagenesFijas();
  document.getElementById('carta')?.addEventListener('click', volar);
  document.querySelectorAll('[data-plato-portada]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      const plato = document.getElementById(enlace.hash.slice(1));
      if (plato?.closest('.categoria')?.hidden)
        document.querySelector('[data-filtro="todo"]')?.click();
    });
  });

  const mejorar = () =>
    cuandoEsteLibre(async () => {
      if (puede3d()) {
        const { montar } = await import('./montar.js');
        montar(document.querySelector('[data-escena]'), avanceDelScroll);
      }
    });
  if (new URLSearchParams(location.search).get('3d') === 'forzar') mejorar();
  else {
    // El póster ya muestra la mesa exacta. También en escritorio, el motor llega
    // al explorar; el formulario y el pedido no dependen de esta mejora visual.
    const eventos = new AbortController();
    const iniciar = () => {
      eventos.abort();
      mejorar();
    };
    for (const evento of ['pointermove', 'pointerdown', 'keydown', 'scroll']) {
      addEventListener(evento, iniciar, { once: true, passive: true, signal: eventos.signal });
    }
  }
}
