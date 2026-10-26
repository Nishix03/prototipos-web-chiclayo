import { html } from '../../core/componentes/html.js';
import { imagen } from '../../core/componentes/imagen.js';
import { soles } from '../../core/dinero.js';

const ETIQUETA = {
  picante: 'Picante',
  'para compartir': 'Para compartir',
  'de la casa': 'De la casa',
};

/**
 * Un plato. Nombre, descripción y precio están siempre en el HTML; los controles de cantidad
 * salen ocultos y carrito.js los muestra (sin JavaScript no habría cómo armar el pedido).
 * Los data-* llevan lo que el carrito necesita, para no repetir la carta en otra isla de datos.
 */
function plato(p) {
  return html`
    <li
      class="plato"
      id="plato-${p.id}"
      data-plato="${p.id}"
      data-nombre="${p.nombre}"
      data-precio="${p.precio}"
    >
      ${p.foto ? imagen({ ...p.foto, alt: '' }) : ''}
      <div class="plato__cuerpo">
        <h4 class="plato__cabeza">
          <span class="plato__nombre">${p.nombre}</span>
          <span class="precio">${soles(p.precio)}</span>
        </h4>
        <p class="plato__descripcion">${p.descripcion}</p>
        ${
          p.etiquetas?.length
            ? html`<p class="plato__etiquetas">
                ${p.etiquetas.map((e) => html`<span class="sello-texto">${ETIQUETA[e]}</span>`)}
              </p>`
            : ''
        }
        <div class="cantidad" data-cantidad hidden>
          <button
            class="boton boton--secundario cantidad__agregar"
            type="button"
            data-accion="agregar"
          >
            + Agregar <span class="solo-lector">${p.nombre}</span>
          </button>
          <div class="cantidad__control" hidden>
            <button
              class="cantidad__boton"
              type="button"
              data-accion="quitar"
              aria-label="Quitar un ${p.nombre}"
            >
              −
            </button>
            <output class="cantidad__valor" aria-label="Cantidad de ${p.nombre}">0</output>
            <button
              class="cantidad__boton"
              type="button"
              data-accion="sumar"
              aria-label="Agregar un ${p.nombre}"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  `;
}

export function carta(negocio) {
  const { carta: categorias, textos, contacto } = negocio;
  return html`
    <section class="carta contenedor" id="carta" aria-labelledby="carta-titulo">
      <h2 class="carta__titulo" id="carta-titulo">La carta</h2>
      <p class="carta__intro">${textos.introCarta}</p>
      <noscript>
        <p class="carta__sin-js">
          Para pedir, escríbenos los platos por
          <a href="https://wa.me/51${contacto.whatsapp}">WhatsApp</a>.
        </p>
      </noscript>

      <div class="filtros" role="group" aria-label="Filtrar la carta" data-filtros hidden>
        <button type="button" aria-pressed="true" data-filtro="todo">Todo</button>
        ${categorias.map(
          (c) =>
            html`<button type="button" aria-pressed="false" data-filtro="${c.id}">
              ${c.nombre}
            </button>`,
        )}
      </div>

      ${categorias.map(
        (c) => html`
          <section class="categoria" data-categoria="${c.id}" aria-labelledby="categoria-${c.id}">
            <h3 class="categoria__titulo" id="categoria-${c.id}">${c.nombre}</h3>
            <ul class="platos" role="list">
              ${c.platos.map(plato)}
            </ul>
          </section>
        `,
      )}
    </section>
  `;
}
