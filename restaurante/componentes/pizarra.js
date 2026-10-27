import { html } from '../../core/componentes/html.js';
import { soles } from '../../core/dinero.js';
import { resumenHorario } from '../../core/horario.js';

/**
 * La pizarra de la cocina (componente propio del rubro): el menú del día y el horario de toda
 * la semana, escritos con tiza. El estado de la portada enlaza aquí (#horario).
 */
export function pizarra(negocio) {
  const { menuDelDia: m, horario } = negocio;
  return html`
    <section class="pizarra-seccion" aria-label="Menú del día y horario">
      <div class="pizarra">
        <div class="pizarra__menu" id="menu-hoy">
          <!-- "del día" y no "de hoy": el menú no se sirve todos los días (copy-proof-check) -->
          <h2 class="pizarra__titulo" data-armar>Menú del día</h2>
          <p class="pizarra__precio">${soles(m.precio)}</p>
          <p class="pizarra__cuando">${m.dias}, de ${m.horario.replace(' – ', ' a ')}</p>
          <dl class="pizarra__lista">
            <dt>${m.entradas.length > 1 ? 'Entrada (elige una)' : 'Entrada'}</dt>
            <dd>${m.entradas.join(' o ')}</dd>
            <dt>${m.fondos.length > 1 ? 'Fondo (elige uno)' : 'Fondo'}</dt>
            <dd>${m.fondos.join(' o ')}</dd>
            <dt>Incluye</dt>
            <dd>${m.incluye}</dd>
          </dl>
        </div>
        <div class="pizarra__horario" id="horario">
          <h2 class="pizarra__titulo" data-armar>Horario</h2>
          <dl class="pizarra__dias">
            ${resumenHorario(horario).map(
              ({ dias, horas }) =>
                html`<div>
                  <dt>${dias}</dt>
                  <dd>${horas}</dd>
                </div>`,
            )}
          </dl>
        </div>
      </div>
    </section>
  `;
}
