import { html } from './html.js';
import { imagen } from './imagen.js';

export function galeria(negocio) {
  const fotos = negocio.imagenes.galeria ?? [];
  if (!fotos.length) return html``;
  return html`
    <section class="seccion galeria" aria-labelledby="galeria-titulo">
      <div class="contenedor">
        <h2 class="seccion__titulo" id="galeria-titulo">Conoce el lugar</h2>
        <ul class="galeria__rejilla" role="list">
          ${fotos.map((foto) => html` <li class="galeria__item">${imagen(foto)}</li> `)}
        </ul>
      </div>
    </section>
  `;
}
