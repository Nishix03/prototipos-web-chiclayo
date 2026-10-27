import { html } from '../../core/componentes/html.js';

const ORDEN = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const ABREV = {
  lun: 'Lun',
  mar: 'Mar',
  mie: 'Mié',
  jue: 'Jue',
  vie: 'Vie',
  sab: 'Sáb',
  dom: 'Dom',
};

/**
 * Los barberos con su especialidad y una fila de los 7 días donde se marcan los que atiende
 * (como el tablero de turnos colgado en la barbería). Cada día dice su estado en texto.
 */
export function barberos(negocio) {
  const { barberos: lista, textos } = negocio;
  return html`
    <section class="barberos" id="barberos" aria-labelledby="barberos-titulo">
      <h2 class="seccion-titulo" id="barberos-titulo" data-armar>Nuestros barberos</h2>
      <p class="seccion-intro">${textos.introBarberos}</p>
      <ul class="barberos__lista" role="list">
        ${lista.map(
          (b) => html`
            <li class="barbero" data-barbero="${b.id}">
              <h3 class="barbero__nombre">${b.nombre}</h3>
              <p class="barbero__especialidad">${b.especialidad}</p>
              <ul class="barbero__dias" role="list" aria-label="Días que atiende ${b.nombre}">
                ${ORDEN.map((d) =>
                  b.dias.includes(d)
                    ? html`<li class="dia dia--si">
                        ${ABREV[d]}<span class="solo-lector">: atiende</span>
                      </li>`
                    : html`<li class="dia">
                        ${ABREV[d]}<span class="solo-lector">: no atiende</span>
                      </li>`,
                )}
              </ul>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}
