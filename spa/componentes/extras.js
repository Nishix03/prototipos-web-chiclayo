import { html } from '../../core/componentes/html.js';
import { comparador as comparadorNucleo } from '../../core/componentes/comparador.js';
import { resumenHorario } from '../../core/horario.js';

export function comparador(negocio) {
  return html`
    <section class="antes-despues" aria-labelledby="comparador-titulo">
      <h2 class="seccion-titulo" id="comparador-titulo" data-armar>Antes y después</h2>
      <p class="seccion-intro">${negocio.textos.introComparador}</p>
      ${comparadorNucleo(negocio.comparador)}
    </section>
  `;
}

export function equipo(negocio) {
  return html`
    <section class="equipo" aria-labelledby="equipo-titulo">
      <h2 class="seccion-titulo" id="equipo-titulo" data-armar>Quiénes te atienden</h2>
      <ul class="equipo__lista" role="list">
        ${negocio.equipo.map(
          (p) => html`
            <li class="persona">
              <h3 class="persona__nombre">${p.nombre}</h3>
              <p>${p.especialidad}</p>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

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
