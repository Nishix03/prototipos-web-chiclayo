import { html } from '../../core/componentes/html.js';

/**
 * El riel de comandas (componente propio del rubro): una barra de acero fija arriba de la que
 * cuelga todo lo que se lee. Es decorativo; el nombre del negocio va en la comanda de portada.
 */
export function cabecera() {
  return html`<div class="riel" aria-hidden="true"></div>`;
}
