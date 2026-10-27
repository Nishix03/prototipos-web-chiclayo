import { html } from '../../core/componentes/html.js';
import { soles } from '../../core/dinero.js';

const ESTILOS = ['clásico', 'degradado', 'moderno', 'barba'];
const NOMBRE_ESTILO = {
  clásico: 'Clásicos',
  degradado: 'Degradados',
  moderno: 'Modernos',
  barba: 'Barba',
};

/**
 * Los cortes como una lista de precios de barbería: nombre, duración y precio en la misma
 * línea, y «Pedir este corte», que lo deja elegido en el turno. Los filtros por estilo solo
 * aparecen con JavaScript (sin JS se ve la lista completa).
 */
export function cortes(negocio) {
  const { cortes: lista, textos } = negocio;
  const estilos = ESTILOS.filter((e) => lista.some((c) => c.estilo === e));
  return html`
    <section class="cortes" id="cortes" aria-labelledby="cortes-titulo">
      <h2 class="seccion-titulo" id="cortes-titulo" data-armar>Cortes y precios</h2>
      <p class="seccion-intro">${textos.introCortes}</p>
      <div class="filtros" role="group" aria-label="Filtrar los cortes" data-filtros>
        <button type="button" aria-pressed="true" data-filtro="todo">Todos</button>
        ${estilos.map(
          (e) =>
            html`<button type="button" aria-pressed="false" data-filtro="${e}">
              ${NOMBRE_ESTILO[e]}
            </button>`,
        )}
      </div>
      <ol class="cortes__lista" role="list">
        ${lista.map(
          (c) => html`
            <li class="corte" data-corte="${c.id}" data-estilo="${c.estilo}">
              <div class="corte__cabeza">
                <h3 class="corte__nombre">${c.nombre}</h3>
                <span class="corte__guia" aria-hidden="true"></span>
                <p class="corte__precio">${soles(c.precio)}</p>
              </div>
              <p class="corte__descripcion">${c.descripcion}</p>
              <p class="corte__minutos">${c.minutos} min</p>
              <a class="corte__pedir" href="#turno" data-pedir="${c.id}"
                >Pedir este corte <span class="solo-lector">${c.nombre}</span></a
              >
            </li>
          `,
        )}
      </ol>
    </section>
  `;
}
