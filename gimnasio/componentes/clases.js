import { html } from '../../core/componentes/html.js';
import { nombreDia } from '../../core/horario.js';

const ORDEN = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

const aMinutos = (hhmm) => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));
const aHora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
export const fin = (c) => aHora(aMinutos(c.inicio) + c.minutos);

/** Cada clase es de un tipo que existe: si no, el build se detiene con un mensaje claro. */
function revisarTipos({ tiposClase, clases }) {
  const tipos = new Set(tiposClase.map((t) => t.id));
  const malas = clases.filter((c) => !tipos.has(c.tipo));
  if (malas.length)
    throw new Error(
      `Clases de negocio.json:\n  ${malas.map((c) => `la clase del ${c.dia} a las ${c.inicio} es de tipo «${c.tipo}», que no existe`).join('\n  ')}`,
    );
}

/**
 * La función estrella: el horario semanal de clases, una columna por día. Con JavaScript
 * (clases-cliente.js) se filtra por tipo y se marcan en vivo la clase en curso y la siguiente,
 * con la hora de Lima. Sin JavaScript se ve el horario completo.
 */
export function clases(negocio) {
  revisarTipos(negocio);
  const { tiposClase, clases: lista, textos } = negocio;
  const nombreTipo = Object.fromEntries(tiposClase.map((t) => [t.id, t.nombre]));
  const dias = ORDEN.filter((d) => lista.some((c) => c.dia === d));
  return html`
    <section class="clases" id="clases" aria-labelledby="clases-titulo">
      <h2 class="seccion-titulo" id="clases-titulo" data-armar>Horario de clases</h2>
      <p class="seccion-intro">${textos.introClases}</p>
      <div class="filtros" role="group" aria-label="Filtrar las clases" data-filtros>
        <button type="button" aria-pressed="true" data-filtro="todo">Todas</button>
        ${tiposClase.map(
          (t) =>
            html`<button type="button" aria-pressed="false" data-filtro="${t.id}">
              ${t.nombre}
            </button>`,
        )}
      </div>
      <div class="semana">
        ${dias.map(
          (d) => html`
            <div class="dia" data-dia="${d}">
              <h3 class="dia__nombre">${nombreDia(d)}</h3>
              <ul class="dia__clases" role="list">
                ${lista
                  .filter((c) => c.dia === d)
                  .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio))
                  .map(
                    (c) => html`
                      <li
                        class="clase"
                        data-clase
                        data-tipo="${c.tipo}"
                        data-inicio="${c.inicio}"
                        data-minutos="${c.minutos}"
                      >
                        <span class="clase__hora">${c.inicio.replace(/^0/, '')}–${fin(c)}</span>
                        <span class="clase__tipo">${nombreTipo[c.tipo]}</span>
                        <span class="clase__entrenador">${c.entrenador}</span>
                        <span class="clase__marca" data-marca></span>
                      </li>
                    `,
                  )}
              </ul>
            </div>
          `,
        )}
      </div>
    </section>
  `;
}
