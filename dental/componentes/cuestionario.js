import { html } from '../../core/componentes/html.js';
import { soles } from '../../core/dinero.js';

/**
 * Revisa el árbol al construir: cada «siguiente» apunta a una pregunta que existe y cada
 * «resultado» a un tratamiento que existe. Un error de datos detiene el build con un mensaje
 * claro, en vez de dejar un cuestionario que se rompe a mitad de camino.
 */
function revisarArbol({ inicio, preguntas }, tratamientos) {
  const ids = new Set(preguntas.map((p) => p.id));
  const trat = new Set(tratamientos.map((t) => t.id));
  const errores = [];
  if (!ids.has(inicio)) errores.push(`«inicio» apunta a «${inicio}», que no es una pregunta`);
  for (const p of preguntas) {
    for (const o of p.opciones) {
      if (o.siguiente && !ids.has(o.siguiente))
        errores.push(`«${p.id}»: «${o.texto}» sigue a «${o.siguiente}», que no es una pregunta`);
      if (o.resultado && !trat.has(o.resultado))
        errores.push(
          `«${p.id}»: «${o.texto}» recomienda «${o.resultado}», que no es un tratamiento`,
        );
    }
  }
  if (errores.length) throw new Error(`Cuestionario de negocio.json:\n  ${errores.join('\n  ')}`);
}

/**
 * La función estrella: «¿Qué tratamiento necesito?». Una pregunta a la vez, como un recorrido
 * (dental/cuestionario-cliente.js lo hace avanzar con View Transitions). Cada respuesta es un
 * botón y no un radio: con radios, las flechas del teclado elegirían y avanzarían sin querer.
 * Sin JavaScript el recorrido no se muestra y se manda a los tratamientos.
 */
export function cuestionario(negocio) {
  const { cuestionario: arbol, tratamientos, textos } = negocio;
  revisarArbol(arbol, tratamientos);
  return html`
    <section
      class="cuestionario"
      id="cuestionario"
      aria-labelledby="cuestionario-titulo"
      data-cuestionario
    >
      <h2 class="seccion-titulo" id="cuestionario-titulo" data-armar>Encuentra tu tratamiento</h2>
      <p class="seccion-intro">${textos.introCuestionario}</p>
      <noscript>
        <p class="seccion-intro">
          El cuestionario necesita JavaScript. Mientras, mira
          <a href="#tratamientos">los tratamientos y precios</a>.
        </p>
      </noscript>
      <div class="cuestionario__recorrido" data-inicio="${arbol.inicio}">
        ${arbol.preguntas.map(
          (p) => html`
            <fieldset
              class="paso"
              data-paso="${p.id}"
              tabindex="-1"
              ${p.id === arbol.inicio ? '' : html`hidden`}
            >
              <legend class="paso__pregunta">${p.texto}</legend>
              <div class="paso__opciones">
                ${p.opciones.map(
                  (o) => html`
                    <button
                      class="opcion"
                      type="button"
                      ${o.siguiente ? html`data-siguiente="${o.siguiente}"` : ''}
                      ${o.resultado ? html`data-resultado="${o.resultado}"` : ''}
                    >
                      ${o.texto}
                    </button>
                  `,
                )}
              </div>
              ${
                p.id === arbol.inicio
                  ? ''
                  : html`<button class="paso__volver" type="button" data-volver>
                      Volver a la pregunta anterior
                    </button>`
              }
            </fieldset>
          `,
        )}
        <div class="resultado" data-resultado-panel hidden tabindex="-1">
          <p class="resultado__antes">Podría servirte:</p>
          ${tratamientos.map(
            (t) => html`
              <div class="resultado__tratamiento" data-tratamiento="${t.id}" hidden>
                <h3 class="resultado__nombre" id="resultado-${t.id}">${t.nombre}</h3>
                <p class="resultado__datos">Desde ${soles(t.desde)} · ${t.duracion}</p>
                <p>${t.descripcion}</p>
              </div>
            `,
          )}
          <p class="resultado__aviso">${textos.avisoCuestionario}</p>
          <div class="resultado__acciones">
            <a class="llamado" href="#evaluacion" data-agendar>Agendar mi evaluación</a>
            <button class="paso__volver" type="button" data-reiniciar>Empezar de nuevo</button>
          </div>
        </div>
      </div>
    </section>
  `;
}
