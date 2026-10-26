// Maqueta del hero vivo. El pedido es una versión mínima del de la v1 (restaurante/carrito.js
// no cambia); lo nuevo aquí es el plato que cae a la barra, la View Transition de la comanda
// y la carga diferida del 3D y de las coreografías (ADR 008).

const soles = (n) => `S/ ${n}`;
const reducido = matchMedia('(prefers-reduced-motion: reduce)');
const pedido = new Map(); // id → { nombre, precio, cantidad }

const barra = document.querySelector('[data-barra]');
const resumen = document.querySelector('[data-resumen]');
const comanda = document.querySelector('[data-comanda]');

function totales() {
  let platos = 0;
  let total = 0;
  for (const p of pedido.values()) {
    platos += p.cantidad;
    total += p.cantidad * p.precio;
  }
  return { platos, total };
}

function pintarBarra() {
  const { platos, total } = totales();
  barra.hidden = platos === 0;
  resumen.textContent = `${platos} ${platos === 1 ? 'plato' : 'platos'} · ${soles(total)}`;
}

// El plato «cae» en arco hasta la barra: X con ease-out, Y con caída (dos capas, una por eje)
function volar(foto) {
  const desde = foto.getBoundingClientRect();
  const hasta = barra.getBoundingClientRect();
  const capaX = document.createElement('div');
  const capaY = foto.cloneNode();
  capaX.className = 'plato-volador';
  capaY.removeAttribute('loading');
  Object.assign(capaY.style, {
    width: `${desde.width}px`,
    height: `${desde.height}px`,
    borderRadius: 'inherit',
  });
  Object.assign(capaX.style, { left: `${desde.left}px`, top: `${desde.top}px` });
  capaX.append(capaY);
  document.body.append(capaX);

  const dx = hasta.left + 24 - desde.left;
  const dy = hasta.top + hasta.height / 2 - desde.top - desde.height / 2;
  const duracion = 520;
  capaX.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], {
    duration: duracion,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  });
  const vuelo = capaY.animate(
    [
      { transform: 'translateY(0) scale(1) rotate(0)', opacity: 1 },
      {
        transform: `translateY(${Math.min(dy, 0) - 60}px) scale(0.8) rotate(-8deg)`,
        opacity: 1,
        offset: 0.3,
      },
      { transform: `translateY(${dy}px) scale(0.3) rotate(6deg)`, opacity: 0.6 },
    ],
    { duration: duracion, easing: 'cubic-bezier(0.55, 0, 0.75, 0.6)' }, // sube y cae: gana velocidad
  );
  vuelo.onfinish = () => {
    capaX.remove();
    barra.removeAttribute('data-latido');
    void barra.offsetWidth; // reinicia el latido si llegan dos platos seguidos
    barra.setAttribute('data-latido', '');
  };
}

document.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-agregar]');
  if (!boton) return;
  const plato = boton.closest('[data-plato]');
  const id = plato.dataset.plato;
  const actual = pedido.get(id) ?? {
    nombre: plato.dataset.nombre,
    precio: Number(plato.dataset.precio),
    cantidad: 0,
  };
  actual.cantidad += 1;
  pedido.set(id, actual);
  pintarBarra();
  // Con teclado (detail 0) o movimiento reducido, sin vuelo: la acción se ve en la barra
  if (!reducido.matches && e.detail > 0) volar(plato.querySelector('img'));
});

function pintarComanda() {
  const lineas = comanda.querySelector('[data-lineas]');
  lineas.replaceChildren(
    ...[...pedido.values()].map((p, i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', i);
      li.innerHTML = `<span>${p.cantidad}× ${p.nombre}</span><span>${soles(p.cantidad * p.precio)}</span>`;
      return li;
    }),
  );
  comanda.querySelector('[data-total]').textContent = `Total: ${soles(totales().total)}`;
}

// La barra se convierte en la comanda con una View Transition (si el navegador la tiene)
function transicion(cambio, deBarra) {
  if (!document.startViewTransition || reducido.matches) return cambio();
  const [antes, despues] = deBarra ? [barra, comanda] : [comanda, barra];
  antes.style.viewTransitionName = 'pedido';
  const vt = document.startViewTransition(() => {
    antes.style.viewTransitionName = '';
    despues.style.viewTransitionName = 'pedido';
    cambio();
  });
  vt.finished.finally(() => (despues.style.viewTransitionName = ''));
}

document.querySelector('[data-abrir-comanda]').addEventListener('click', () => {
  pintarComanda();
  transicion(() => comanda.showModal(), true);
});
document
  .querySelector('[data-cerrar-comanda]')
  .addEventListener('click', () => transicion(() => comanda.close(), false));
comanda.addEventListener('cancel', (e) => {
  e.preventDefault();
  transicion(() => comanda.close(), false);
});

// El vapor y la brasa (CSS infinito) se pausan cuando la portada sale de pantalla
const olla = document.querySelector('[data-olla]');
new IntersectionObserver(([e]) => olla.toggleAttribute('data-fuera', !e.isIntersecting)).observe(
  olla,
);

// ── ADR 008: el 3D y las coreografías llegan después del primer pintado ──
const parametros = new URLSearchParams(location.search);

function puede3d() {
  if (parametros.get('3d') === '0') return false; // para medir «antes del 3D»
  if (parametros.get('3d') === 'forzar') return true;
  if (reducido.matches) return false;
  if (navigator.connection?.saveData) return false;
  if ((navigator.deviceMemory ?? 8) < 4) return false;
  return !!document.createElement('canvas').getContext('webgl2');
}

function cuandoEsteLibre(fn) {
  const correr = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(fn, { timeout: 1500 })
      : setTimeout(fn, 200);
  if (document.readyState === 'complete') correr();
  else addEventListener('load', correr, { once: true });
}

// Modo póster: renderiza un cuadro fijo de la escena para generar la imagen del LCP
if (parametros.has('poster')) {
  import('./escena.js').then(({ montarEscena }) => {
    const canvas = montarEscena(document.querySelector('[data-olla]'), {
      poster: true,
      lado: 1280,
    });
    window.__poster = {
      png: canvas.toDataURL('image/png'),
      fondo: getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim(),
    };
  });
} else
  cuandoEsteLibre(async () => {
    if (!reducido.matches) {
      const { iniciarCoreografias } = await import('./coreografias.js');
      iniciarCoreografias();
    }
    if (puede3d()) {
      const { montarEscena } = await import('./escena.js');
      montarEscena(olla);
    }
  });
