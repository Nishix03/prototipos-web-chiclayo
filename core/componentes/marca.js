import { html } from './html.js';
import { imagen } from './imagen.js';

// El nombre permanece como texto real; el símbolo contiguo es decorativo para el lector.
export function marca(negocio) {
  const logo = negocio.imagenes.logo;
  if (!logo) return html``;
  return html`<span class="marca-simbolo" aria-hidden="true"
    >${imagen({ ...logo, alt: '' }, { prioridad: true, sizes: '40px' })}</span
  >`;
}
