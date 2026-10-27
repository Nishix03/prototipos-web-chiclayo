import { html } from '../../core/componentes/html.js';
import { resumenHorario } from '../../core/horario.js';

/** Tarjeta de fidelidad (informativa: los sellos se ponen en el local, no en la web). */
export function fidelidad(negocio) {
  const f = negocio.fidelidad;
  if (!f) return '';
  return html`
    <section class="fidelidad" aria-labelledby="fidelidad-titulo">
      <div class="fidelidad__tarjeta">
        <h2 class="seccion-titulo" id="fidelidad-titulo">${f.titulo}</h2>
        <p>${f.detalle}</p>
        <ol class="fidelidad__sellos" role="list" aria-label="5 sellos y el corte gratis">
          ${[1, 2, 3, 4, 5].map((n) => html`<li><span class="solo-lector">Sello ${n}</span></li>`)}
          <li class="fidelidad__gratis">Gratis</li>
        </ol>
      </div>
    </section>
  `;
}

/** El horario de toda la semana: a esta sección enlaza el estado de la portada (#horario). */
export function horario(negocio) {
  return html`
    <section class="horario-semana" id="horario" aria-labelledby="horario-titulo">
      <h2 class="seccion-titulo" id="horario-titulo" data-armar>Horario</h2>
      <dl class="horario-semana__dias">
        ${resumenHorario(negocio.horario).map(
          ({ dias, horas }) =>
            html`<div>
              <dt>${dias}</dt>
              <dd>${horas}</dd>
            </div>`,
        )}
      </dl>
    </section>
  `;
}
