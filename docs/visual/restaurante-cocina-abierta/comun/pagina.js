// Lo común a las 3 direcciones del storyboard: el contenido sale de negocio.json
// (carta, menú del día, horario), el pedido imprime la comanda y el scroll mueve la escena.
import negocio from '../../../../restaurante/negocio.json';
import { montarEscena } from './escena.js';
import { GRUPOS } from './ingredientes.js';

const DIAS = [
  ['lun', 'Lunes'],
  ['mar', 'Martes'],
  ['mie', 'Miércoles'],
  ['jue', 'Jueves'],
  ['vie', 'Viernes'],
  ['sab', 'Sábado'],
  ['dom', 'Domingo'],
];
const soles = (n) => `S/ ${n}`;
const tramos = (t) => t.map(([a, b]) => `${a} a ${b}`).join(' y ');
const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

// Storyboard con hora fija (martes 13:00 en Lima): el sitio real usa core/horario.js
const HOY = 'mar';
export const estadoDeHoy = () => `Abierto · hoy de ${tramos(negocio.horario[HOY])}`;

export function pintarContenido() {
  for (const n of document.querySelectorAll('[data-estado]')) n.textContent = estadoDeHoy();

  const menu = document.querySelector('[data-menu]');
  if (menu) {
    const m = negocio.menuDelDia;
    menu.append(
      el(`<p class="menu__precio">${soles(m.precio)}</p>`),
      el(`<p class="menu__cuando">${m.dias}, ${m.horario.replace(' – ', ' a ')}</p>`),
      el(`<ul class="menu__platos">
        <li><span>Entrada</span> ${m.entradas.join(' o ')}</li>
        <li><span>Fondo</span> ${m.fondos.join(' o ')}</li>
        <li><span>Incluye</span> ${m.incluye}</li></ul>`),
    );
  }

  const horario = document.querySelector('[data-horario]');
  if (horario) {
    horario.replaceChildren(
      ...DIAS.map(([id, nombre]) =>
        el(`<li${id === HOY ? ' aria-current="date"' : ''}><span>${nombre}</span>
          <span>${negocio.horario[id].length ? tramos(negocio.horario[id]) : 'Cerrado'}</span></li>`),
      ),
    );
  }

  // La carta como comanda: cada categoría es un grupo de ingredientes de la escena
  const carta = document.querySelector('[data-carta]');
  if (carta) {
    for (const c of negocio.carta) {
      const g = GRUPOS.findIndex((x) => x.categoria === c.id);
      carta.append(
        el(`<li class="carta__categoria" id="cat-${c.id}" data-grupo="${g}">
          <h3>${c.nombre}</h3>
          <ul>${c.platos
            .map(
              (p) => `<li class="carta__plato">
                <span class="carta__nombre">${p.nombre}</span>
                <span class="carta__puntos" aria-hidden="true"></span>
                <span class="carta__precio">${soles(p.precio)}</span>
                <button type="button" class="carta__agregar" data-agregar="${p.id}"
                  aria-label="Agregar ${p.nombre}">+</button></li>`,
            )
            .join('')}</ul></li>`),
      );
    }
  }
}

// Pedido mínimo del storyboard (el de verdad es restaurante/carrito.js, que no cambia)
const pedido = new Map();
const platos = new Map(negocio.carta.flatMap((c) => c.platos.map((p) => [p.id, p])));

export function agregar(id) {
  const p = platos.get(id);
  const linea = pedido.get(id) ?? { ...p, cantidad: 0 };
  linea.cantidad += 1;
  pedido.set(id, linea);
  const ticket = document.querySelector('[data-comanda]');
  if (!ticket) return;
  ticket.hidden = false;
  const lineas = ticket.querySelector('[data-lineas]');
  lineas.replaceChildren(
    ...[...pedido.values()].map((l, i) =>
      el(
        `<li style="--i:${i}"><span>${l.cantidad}× ${l.nombre}</span><span>${soles(l.cantidad * l.precio)}</span></li>`,
      ),
    ),
  );
  const total = [...pedido.values()].reduce((s, l) => s + l.cantidad * l.precio, 0);
  ticket.querySelector('[data-total]').textContent = `Total ${soles(total)}`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-agregar]');
  if (b) agregar(b.dataset.agregar);
});

// Avance del scroll: 0 en la portada, 1 cuando la carta llega arriba
export function avanceDelScroll() {
  const carta = document.querySelector('#carta');
  const fin = Math.max(1, carta.offsetTop - innerHeight * 0.25);
  return Math.min(1, Math.max(0, scrollY / fin));
}

export function iniciar(direccion) {
  pintarContenido();
  const escena = montarEscena(document.querySelector('[data-escena]'), direccion, avanceDelScroll);
  window.__escena = escena;

  // Etiquetas de categoría ancladas al centro de cada grupo de ingredientes
  const capa = document.querySelector('[data-etiquetas]');
  if (capa) {
    const etiquetas = negocio.carta.map((c) => {
      const g = GRUPOS.findIndex((x) => x.categoria === c.id);
      const n = el(
        `<a class="etiqueta-grupo" href="#cat-${c.id}" data-grupo="${g}">${c.nombre}</a>`,
      );
      capa.append(n);
      return n;
    });
    const colocar = () => {
      const pos = escena.centros();
      const t = avanceDelScroll();
      capa.style.opacity = Math.min(1, Math.max(0, (t - 0.55) / 0.3));
      capa.style.visibility = t > 0.55 ? 'visible' : 'hidden';
      for (const n of etiquetas) {
        const p = pos[n.dataset.grupo];
        n.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
    };
    addEventListener('scroll', colocar, { passive: true });
    addEventListener('resize', colocar);
    colocar();
  }
}
