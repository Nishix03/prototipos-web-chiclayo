import { imagen } from '../../core/componentes/imagen.js';
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
                        data-sesion="${c.dia}-${c.inicio}-${c.tipo}"
                        data-tipo="${c.tipo}"
                        data-inicio="${c.inicio}"
                        data-minutos="${c.minutos}"
                      >
                        <span class="clase__hora">${c.inicio.replace(/^0/, '')}–${fin(c)}</span>
                        <span class="clase__tipo">${nombreTipo[c.tipo]}</span>
                        <span class="clase__entrenador">${c.entrenador}</span>
                        <span class="clase__marca" data-marca></span>
                        <span class="clase__intensidad">Intensidad ${c.intensidad}/5 · demo</span>
                        <button
                          class="clase__guardar transition-transform duration-150 motion-reduce:transition-none active:scale-[0.98]"
                          type="button"
                          data-guardar-sesion
                          aria-pressed="false"
                          aria-label="Añadir a mi plan: ${nombreTipo[c.tipo]}, ${nombreDia(c.dia)}, ${c.inicio}"
                        >
                          Añadir a mi plan
                        </button>
                      </li>
                    `,
                  )}
              </ul>
            </div>
          `,
        )}
      </div>
      <aside class="plan-semanal" aria-labelledby="plan-semanal-titulo">
        <h3 id="plan-semanal-titulo">Mi plan semanal</h3>
        <p>Elige sesiones del horario. Se guardan solo en este navegador.</p>
        <p data-plan-vacio>Todavía no has elegido sesiones.</p>
        <ul class="plan-semanal__lista" data-plan-lista aria-live="polite"></ul>
      </aside>
    </section>
  `;
}

export function disciplinas(negocio) {
  return html`<section class="disciplinas" aria-labelledby="disciplinas-titulo">
    <h2 class="seccion-titulo" id="disciplinas-titulo">Encuentra tu disciplina</h2>
    <p class="muestra-ia">Imágenes generadas con IA · espacios ilustrativos (demo).</p>
    <ul class="disciplinas__lista" role="list">
      ${negocio.tiposClase.map(
        (t) =>
          html`<li class="disciplina">
            ${t.foto ? imagen(t.foto, { sizes: '(min-width: 60rem) 50vw, 100vw' }) : ''}
            <a href="?clase=${t.id}#clases">Ver clases de ${t.nombre}</a>
          </li>`,
      )}
    </ul>
  </section>`;
}
