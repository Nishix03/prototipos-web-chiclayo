import { html } from './html.js';
import { imagen } from './imagen.js';

export function editorial(negocio) {
  const e = negocio.imagenes.editorial;
  if (!e) return html``;
  return html`<section class="editorial" aria-labelledby="editorial-titulo">
    <figure class="editorial__foto">
      ${imagen(e.foto, { sizes: '(min-width: 60rem) 65vw, 100vw' })}
      <figcaption>
        Imagen generada con IA · ${negocio.rubro === 'restaurante' ? 'plato' : 'ambiente'}
        ilustrativo (demo).
      </figcaption>
    </figure>
    <div class="editorial__texto">
      <h2 class="seccion-titulo" id="editorial-titulo">${e.titulo}</h2>
      <p>${e.texto}</p>
      <a href="${e.enlace}">${e.accion}</a>
    </div>
  </section>`;
}
