import { html } from '../../core/componentes/html.js';
import { imagen } from '../../core/componentes/imagen.js';
import { soles } from '../../core/dinero.js';

const todosLosPlatos = (carta) => carta.flatMap((categoria) => categoria.platos);

/** Columna lateral: el menú del día con su sello de precio. */
function menuHoy({ dias, horario, precio, entradas, fondos, incluye }) {
  return html`
    <aside class="menu-hoy" id="menu-hoy" aria-labelledby="menu-hoy-titulo">
      <p class="menu-hoy__sello" aria-hidden="true">${soles(precio)}</p>
      <!-- "del día" y no "de hoy": el menú no se sirve todos los días (copy-proof-check) -->
      <h2 class="menu-hoy__titulo" id="menu-hoy-titulo">Menú del día</h2>
      <p class="menu-hoy__cuando">${dias}, de ${horario.replace(' – ', ' a ')}</p>
      <dl class="menu-hoy__lista">
        <dt>${entradas.length > 1 ? 'Entradas (elige una)' : 'Entrada'}</dt>
        ${entradas.map((e) => html`<dd>${e}</dd>`)}
        <dt>${fondos.length > 1 ? 'Fondos (elige uno)' : 'Fondo'}</dt>
        ${fondos.map((f) => html`<dd>${f}</dd>`)}
        <dt>Incluye</dt>
        <dd>${incluye}</dd>
      </dl>
    </aside>
  `;
}

/** Franja inferior: los platos marcados "de la casa", como la fila de "más noticias". */
function deLaCasa(carta) {
  const platos = todosLosPlatos(carta)
    .filter((p) => p.etiquetas?.includes('de la casa'))
    .slice(0, 3);
  if (!platos.length) return '';
  return html`
    <section class="de-la-casa" aria-labelledby="de-la-casa-titulo">
      <h2 class="de-la-casa__titulo" id="de-la-casa-titulo">De la casa</h2>
      <ul class="de-la-casa__lista" role="list">
        ${platos.map(
          (p) => html`
            <li>
              <a class="de-la-casa__enlace" href="#plato-${p.id}">
                <span class="de-la-casa__nombre">${p.nombre}</span>
                <span class="precio">${soles(p.precio)}</span>
              </a>
              <p>${p.descripcion}</p>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/** Portada del diario: foto, titular con los dos botones, menú de hoy y "De la casa". */
export function portada(negocio) {
  const { textos, imagenes, menuDelDia, carta } = negocio;
  return html`
    <section class="portada contenedor" aria-labelledby="titular">
      <!-- El titular va primero en el DOM (un lector de pantalla lo lee antes que la foto);
           en celular la foto sube solo visualmente con order: -1 -->
      <div class="portada__nota">
        <h1 class="titular" id="titular">${textos.titular}</h1>
        <p class="bajada">${textos.bajada}</p>
        <div class="grupo-botones">
          <a class="boton boton--principal" href="#carta">Armar mi pedido</a>
          <a class="boton boton--secundario" href="#reservas">Reservar mesa</a>
        </div>
      </div>
      <figure class="portada__foto">${imagen(imagenes.hero, { prioridad: true })}</figure>
      ${menuHoy(menuDelDia)} ${deLaCasa(carta)}
    </section>
  `;
}
