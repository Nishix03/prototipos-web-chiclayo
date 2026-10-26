// Navegador: el carrito de la carta, la barra de pedido y la comanda.
//
// Estado: un Map id → { plato, cantidad }. Cada cambio pasa por cambiar(), que actualiza el
// estado y vuelve a pintar todo lo que depende de él (controles, barra, comanda). Es el mismo
// patrón que un modelo + vista: el DOM nunca es la fuente de verdad, el Map sí.

import { soles } from '../core/dinero.js';
import { lineas, totalPlatos, totalSoles, textoPlatos, mensajePedido } from './pedido.js';

const ESCALONADO_MS = 100; // entre líneas que se "imprimen" (make-interfaces-feel-better)
const MAX_ESCALONADAS = 4;
const movimientoReducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarCarrito() {
  const items = document.querySelectorAll('[data-plato]');
  if (!items.length) return null;

  const $ = (selector) => document.querySelector(selector);
  const barra = $('[data-barra]');
  const resumen = $('[data-resumen]');
  const dialogo = $('[data-comanda]');
  const lista = $('[data-lineas]');
  const vacia = $('[data-vacia]');
  const total = $('[data-total]');
  const form = $('#form-comanda');

  // Un solo anuncio para lectores de pantalla, en vez de uno por contador
  const anuncio = Object.assign(document.createElement('p'), { className: 'solo-lector' });
  anuncio.setAttribute('aria-live', 'polite');
  document.body.append(anuncio);

  /** @type {Map<string, {plato: {id: string, nombre: string, precio: number}, cantidad: number}>} */
  const pedido = new Map();
  const itemPorId = new Map();
  items.forEach((li) => {
    const { plato: id, nombre, precio } = li.dataset;
    itemPorId.set(id, li);
    pedido.set(id, { plato: { id, nombre, precio: Number(precio) }, cantidad: 0 });
  });

  // ── Pintar ────────────────────────────────────────────────
  function pintarPlato(id) {
    const li = itemPorId.get(id);
    const { cantidad } = pedido.get(id);
    li.querySelector('.cantidad__agregar').hidden = cantidad > 0;
    li.querySelector('.cantidad__control').hidden = cantidad === 0;
    li.querySelector('.cantidad__valor').value = cantidad;
    li.classList.toggle('plato--en-pedido', cantidad > 0);
  }

  function lineaComanda({ plato, cantidad }) {
    const li = document.createElement('li');
    li.className = 'linea';
    li.dataset.id = plato.id;
    li.innerHTML = `
      <span class="linea__nombre"></span><span class="precio linea__precio"></span>
      <div class="cantidad__control">
        <button class="cantidad__boton" type="button" data-accion="quitar"></button>
        <output class="cantidad__valor"></output>
        <button class="cantidad__boton" type="button" data-accion="sumar"></button>
      </div>`;
    // textContent (no innerHTML) para los datos: un nombre con "<" no puede romper la página
    li.querySelector('.linea__nombre').textContent = plato.nombre;
    li.querySelector('.linea__precio').textContent = soles(cantidad * plato.precio);
    li.querySelector('.cantidad__valor').value = cantidad;
    li.querySelector('.cantidad__valor').setAttribute('aria-label', `Cantidad de ${plato.nombre}`);
    li.querySelector('[data-accion="quitar"]').setAttribute(
      'aria-label',
      `Quitar un ${plato.nombre}`,
    );
    li.querySelector('[data-accion="sumar"]').setAttribute(
      'aria-label',
      `Agregar un ${plato.nombre}`,
    );
    li.querySelector('[data-accion="quitar"]').textContent = '−';
    li.querySelector('[data-accion="sumar"]').textContent = '+';
    return li;
  }

  /** Repinta la comanda. `nuevo` es el id de una línea recién agregada, que se "imprime". */
  function pintarComanda(nuevo) {
    const actuales = lineas(pedido);
    lista.replaceChildren(...actuales.map(lineaComanda));
    if (nuevo) lista.querySelector(`[data-id="${nuevo}"]`)?.classList.add('linea--imprimir');
    total.textContent = soles(totalSoles(pedido));
    vacia.hidden = actuales.length > 0;
  }

  function pintarBarra() {
    const n = totalPlatos(pedido);
    const texto = `${textoPlatos(n)} · ${soles(totalSoles(pedido))}`;
    barra.classList.toggle('barra-pedido--visible', n > 0);
    document.body.classList.toggle('con-pedido', n > 0);
    resumen.textContent = texto;
  }

  // ── Cambiar el estado ─────────────────────────────────────
  function cambiar(id, delta) {
    const linea = pedido.get(id);
    const antes = linea.cantidad;
    linea.cantidad = Math.max(0, antes + delta);
    // Reordenar: lo recién agregado va al final, como en una comanda escrita a mano
    if (antes === 0 && linea.cantidad > 0) {
      pedido.delete(id);
      pedido.set(id, linea);
    }
    pintarPlato(id);
    pintarBarra();
    if (dialogo.open) pintarComanda(antes === 0 ? id : null);
    // Texto para leer en voz alta: sin "·" ni "S/", que el lector de pantalla pronuncia mal
    const verbo = delta > 0 ? 'Agregaste' : 'Quitaste';
    const n = totalPlatos(pedido);
    anuncio.textContent = n
      ? `${verbo} un ${linea.plato.nombre}. Llevas ${textoPlatos(n)}, ${totalSoles(pedido)} soles.`
      : `${verbo} un ${linea.plato.nombre}. Tu pedido está vacío.`;
  }

  // ── Eventos (un solo listener por zona: delegación) ───────
  document.querySelector('#carta').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const li = boton.closest('[data-plato]');
    const id = li.dataset.plato;
    cambiar(id, boton.dataset.accion === 'quitar' ? -1 : 1);
    // El botón pulsado pudo ocultarse: el foco no debe perderse
    if (boton.dataset.accion === 'agregar') li.querySelector('[data-accion="sumar"]').focus();
    if (pedido.get(id).cantidad === 0) li.querySelector('[data-accion="agregar"]').focus();
  });

  lista.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = boton.closest('[data-id]').dataset.id;
    const accion = boton.dataset.accion;
    cambiar(id, accion === 'quitar' ? -1 : 1);
    // La línea se volvió a pintar: devolver el foco al mismo botón, o a algo cercano
    const mismo = lista.querySelector(`[data-id="${id}"] [data-accion="${accion}"]`);
    (
      mismo ??
      lista.querySelector('[data-accion="quitar"]') ??
      vacia.querySelector('button')
    ).focus();
  });

  // ── Comanda: abrir y cerrar ───────────────────────────────
  // El cierre es animado y por eso asíncrono: si se reabre a mitad de camino, hay que
  // cancelar el cierre pendiente (su transitionend y su temporizador), o cerraría la
  // comanda recién abierta. La prueba de teclado E2E encontró justo ese error.
  let cierrePendiente = null;

  function cancelarCierre() {
    cierrePendiente?.abort();
    cierrePendiente = null;
    dialogo.classList.remove('comanda--cerrando');
  }

  function abrir() {
    cancelarCierre();
    pintarComanda();
    lista.querySelectorAll('.linea').forEach((li, i) => {
      li.classList.add('linea--imprimir');
      li.style.setProperty('--retraso', `${Math.min(i, MAX_ESCALONADAS) * ESCALONADO_MS}ms`);
    });
    if (!dialogo.open) dialogo.showModal();
  }

  function cerrar() {
    if (!dialogo.open || cierrePendiente) return;
    if (movimientoReducido()) return dialogo.close();
    const control = new AbortController();
    cierrePendiente = control;
    // Termina por transitionend o por el temporizador, lo que llegue primero; abort()
    // cancela al otro para que no cierre después una comanda reabierta
    const terminar = () => {
      if (control.signal.aborted) return;
      control.abort();
      cierrePendiente = null;
      dialogo.close();
    };
    dialogo.classList.add('comanda--cerrando');
    dialogo.addEventListener('transitionend', terminar, { once: true, signal: control.signal });
    const respaldo = setTimeout(terminar, 400); // por si no llega transitionend
    control.signal.addEventListener('abort', () => clearTimeout(respaldo));
  }

  barra.querySelector('[data-abrir-comanda]').addEventListener('click', abrir);
  dialogo.addEventListener('click', (e) => {
    if (e.target.closest('[data-cerrar-comanda]') || e.target === dialogo) cerrar(); // clic en el velo
  });
  dialogo.addEventListener('cancel', (e) => {
    e.preventDefault(); // Escape: cerrar con la misma animación
    cerrar();
  });
  dialogo.addEventListener('close', () => dialogo.classList.remove('comanda--cerrando'));

  // ── Entrega: la dirección solo se pide con delivery ───────
  const campoDireccion = form.querySelector('[data-campo-direccion]');
  const notaDelivery = form.querySelector('[data-nota-delivery]');
  function pintarEntrega() {
    const delivery = form.elements.entrega.value === 'delivery';
    campoDireccion.hidden = !delivery;
    form.elements.direccion.required = delivery;
    if (notaDelivery) notaDelivery.hidden = !delivery;
  }
  form.addEventListener('change', (e) => e.target.name === 'entrega' && pintarEntrega());
  pintarEntrega();

  // Pedido vacío: el botón de envío sigue habilitado (un botón deshabilitado no se puede
  // enfocar ni explica por qué). Al pulsarlo, se avisa y el foco va a "Volver a la carta".
  // Fase de captura: corre antes que la validación de core/formulario-whatsapp.js.
  form.addEventListener(
    'submit',
    (e) => {
      if (totalPlatos(pedido) > 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      vacia.querySelector('button').focus();
    },
    true,
  );

  // ── Filtros de la carta (Array.filter sobre las categorías) ──
  // El filtro elegido queda en la URL (?categoria=marinos): se puede compartir o recargar.
  const filtros = document.querySelector('[data-filtros]');
  const categorias = [...document.querySelectorAll('[data-categoria]')];

  function filtrar(filtro) {
    const existe = filtro === 'todo' || categorias.some((c) => c.dataset.categoria === filtro);
    const elegido = existe ? filtro : 'todo';
    filtros
      .querySelectorAll('[data-filtro]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === elegido)));
    const visibles = categorias.filter(
      (c) => elegido === 'todo' || c.dataset.categoria === elegido,
    );
    categorias.forEach((c) => (c.hidden = !visibles.includes(c)));
    return elegido;
  }

  filtros.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-filtro]');
    if (!boton) return;
    const elegido = filtrar(boton.dataset.filtro);
    const url = new URL(location.href);
    if (elegido === 'todo') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', elegido);
    history.replaceState(null, '', url);
  });
  filtrar(new URLSearchParams(location.search).get('categoria') ?? 'todo');

  return {
    mensaje: (f) =>
      mensajePedido(pedido, {
        entrega: f.elements.entrega.value,
        direccion: f.elements.direccion.value,
        nota: f.elements.nota.value,
      }),
  };
}
