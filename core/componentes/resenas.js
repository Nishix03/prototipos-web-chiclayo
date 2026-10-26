import { html } from './html.js';
import { iconos } from './iconos.js';

const estrellas = (n) => html`
  <p class="resena__estrellas">
    <span class="solo-lector">${n} de 5 estrellas</span>
    ${Array.from(
      { length: 5 },
      (_, i) =>
        html`<span class="${i < n ? 'llena' : 'vacia'}" aria-hidden="true"
          >${iconos.estrella}</span
        >`,
    )}
  </p>
`;

export function resenas(negocio) {
  if (!negocio.resenas) return html``;
  const { fuente, items } = negocio.resenas;
  return html`
    <section class="seccion seccion--alterna resenas" aria-labelledby="resenas-titulo">
      <div class="contenedor">
        <h2 class="seccion__titulo" id="resenas-titulo">Lo que dicen nuestros clientes</h2>
        <ul class="resenas__lista" role="list">
          ${items.map(
            ({ texto, autor, estrellas: n }) => html`
              <li class="resena">
                <figure>
                  ${estrellas(n)}
                  <blockquote class="resena__texto"><p>${texto}</p></blockquote>
                  <figcaption class="resena__autor">${autor}</figcaption>
                </figure>
              </li>
            `,
          )}
        </ul>
        <p class="resenas__fuente">${fuente}</p>
      </div>
    </section>
  `;
}
