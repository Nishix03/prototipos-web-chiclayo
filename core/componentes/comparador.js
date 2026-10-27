import { html } from './html.js';
import { imagen } from './imagen.js';

/**
 * Comparador antes/después: dos imágenes superpuestas y un <input type="range"> que mueve el
 * corte (core/comparador.js). El rango es un control nativo: funciona con teclado (flechas,
 * Inicio, Fin) y con lector de pantalla. Sin JavaScript, el corte queda al medio.
 *
 * @param {{antes: object, despues: object, nota: string}} c  imágenes ya medidas por render.js
 * @param {string} id  único en la página
 */
export function comparador({ antes, despues, nota }, id = 'comparador') {
  return html`
    <figure class="comparador" data-comparador style="--corte: 50%">
      <div class="comparador__marco">
        <div class="comparador__capa">
          ${imagen(antes, { sizes: '(min-width: 60rem) 48rem, 100vw' })}
        </div>
        <div class="comparador__capa comparador__capa--despues">
          ${imagen(despues, { sizes: '(min-width: 60rem) 48rem, 100vw' })}
        </div>
        <span class="comparador__etiqueta comparador__etiqueta--antes" aria-hidden="true"
          >Antes</span
        >
        <span class="comparador__etiqueta comparador__etiqueta--despues" aria-hidden="true"
          >Después</span
        >
        <span class="comparador__linea" aria-hidden="true"></span>
      </div>
      <label class="comparador__control">
        <span class="solo-lector">Cuánto se ve de la imagen de después</span>
        <input type="range" id="${id}-corte" min="0" max="100" value="50" data-comparador-corte />
      </label>
      <figcaption class="comparador__nota">${nota}</figcaption>
    </figure>
  `;
}
