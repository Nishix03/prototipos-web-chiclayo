import { html } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { soles } from '../../core/dinero.js';
import { resumenHorario } from '../../core/horario.js';

/** Precios «desde» con duración (componente propio del rubro): la duda «¿cuánto cuesta?». */
export function tratamientos(negocio) {
  const { tratamientos: lista, textos } = negocio;
  return html`
    <section class="tratamientos" id="tratamientos" aria-labelledby="tratamientos-titulo">
      <h2 class="seccion-titulo" id="tratamientos-titulo" data-armar>Tratamientos y precios</h2>
      <p class="seccion-intro">${textos.introTratamientos}</p>
      <dl class="tratamientos__lista">
        ${lista.map(
          (t) => html`
            <div class="tratamiento" data-tratamiento-fila="${t.id}">
              <dt class="tratamiento__nombre">${t.nombre}</dt>
              <dd class="tratamiento__precio">Desde ${soles(t.desde)}</dd>
              <dd class="tratamiento__duracion">${t.duracion}</dd>
              <dd class="tratamiento__descripcion">${t.descripcion}</dd>
            </div>
          `,
        )}
      </dl>
    </section>
  `;
}

/** El equipo con su colegiatura (COP). En la demo, «COP 00000 (demo)»: nunca una credencial inventada. */
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
              <p class="persona__colegiatura">${p.colegiatura}</p>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/** Preguntas frecuentes con <details>: abren y cierran sin JavaScript. */
export function preguntas(negocio) {
  return html`
    <section class="preguntas" aria-labelledby="preguntas-titulo">
      <h2 class="seccion-titulo" id="preguntas-titulo" data-armar>Preguntas frecuentes</h2>
      ${negocio.preguntas.map(
        (p) => html`
          <details class="pregunta">
            <summary>${p.pregunta}</summary>
            <p>${p.respuesta}</p>
          </details>
        `,
      )}
    </section>
  `;
}

/**
 * Agendar evaluación: termina en WhatsApp e incluye el resultado del cuestionario (si lo hubo)
 * en un campo oculto que cuestionario-cliente.js rellena.
 */
export function evaluacion(negocio) {
  const { tratamientos: lista, contacto, textos } = negocio;
  const campos = [
    campo({
      id: 'evaluacion-motivo',
      etiqueta: 'Motivo',
      tipo: 'select',
      requerido: true,
      opciones: [
        ...lista.map((t) => ({ valor: t.id, texto: t.nombre })),
        { valor: 'otra', texto: 'Otra consulta' },
      ],
    }),
    campo({ id: 'evaluacion-fecha', etiqueta: 'Fecha preferida', tipo: 'date', requerido: true }),
    campo({
      id: 'evaluacion-turno',
      etiqueta: 'Turno',
      tipo: 'select',
      requerido: true,
      opciones: ['Mañana', 'Tarde'],
    }),
    campo({
      id: 'evaluacion-nombre',
      etiqueta: 'Tu nombre',
      requerido: true,
      atributos: { autocomplete: 'name' },
    }),
    html`<input
      type="hidden"
      name="evaluacion-cuestionario"
      data-etiqueta="Resultado del cuestionario"
      data-cuestionario-resultado
    />`,
  ];
  return html`
    <section class="evaluacion" id="evaluacion" aria-labelledby="evaluacion-titulo">
      <div>
        <h2 class="seccion-titulo" id="evaluacion-titulo" data-armar>Agenda tu evaluación</h2>
        <p class="seccion-intro">${textos.introEvaluacion}</p>
      </div>
      ${formularioWhatsapp({
        id: 'form-evaluacion',
        saludo: 'Hola, quiero agendar una evaluación:',
        boton: 'Agendar por WhatsApp',
        confirmacion: 'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
        telefono: contacto.whatsapp,
        campos,
        clase: 'evaluacion__ficha',
      })}
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
