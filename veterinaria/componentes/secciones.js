import { html } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { soles } from '../../core/dinero.js';
import { resumenHorario } from '../../core/horario.js';

/** Servicios con precio «desde», como una ficha de consultorio. */
export function servicios(negocio) {
  const { servicios: lista, textos } = negocio;
  return html`
    <section class="servicios" id="servicios" aria-labelledby="servicios-titulo">
      <h2 class="seccion-titulo" id="servicios-titulo" data-armar>Servicios y precios</h2>
      <p class="seccion-intro">${textos.introServicios}</p>
      <ul class="servicios__lista" role="list">
        ${lista.map(
          (s) => html`
            <li class="servicio">
              <h3 class="servicio__nombre">${s.nombre}</h3>
              <p class="servicio__precio">Desde ${soles(s.desde)}</p>
              <p class="servicio__descripcion">${s.descripcion}</p>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/**
 * Calendario de vacunas por especie (componente propio del rubro). Sin JavaScript se ve la tabla
 * de cada especie con la edad de cada dosis; con JavaScript (vacunas-cliente.js), al poner la
 * fecha de nacimiento aparece la fecha de cada dosis y cuál toca ahora.
 */
export function vacunas(negocio) {
  const { vacunas: v, textos } = negocio;
  const edad = (semanas) =>
    semanas % 52 === 0 ? `${semanas / 52} año${semanas > 52 ? 's' : ''}` : `${semanas} semanas`;
  return html`
    <section class="vacunas" id="vacunas" aria-labelledby="vacunas-titulo">
      <h2 class="seccion-titulo" id="vacunas-titulo" data-armar>Calendario de vacunas</h2>
      <p class="seccion-intro">${textos.introVacunas}</p>
      <div class="vacunas__datos" data-vacunas>
        <div class="campo">
          <label class="campo__etiqueta" for="vacunas-especie">Especie</label>
          <select id="vacunas-especie">
            ${v.especies.map((e) => html`<option value="${e.id}">${e.nombre}</option>`)}
          </select>
        </div>
        <div class="campo">
          <label class="campo__etiqueta" for="vacunas-nacimiento">Fecha de nacimiento</label>
          <input id="vacunas-nacimiento" type="date" />
        </div>
      </div>
      <p class="vacunas__resumen" data-vacunas-resumen aria-live="polite"></p>
      ${v.especies.map(
        (e) => html`
          <table class="vacunas__tabla" data-especie="${e.id}">
            <caption>
              ${e.nombre}
            </caption>
            <thead>
              <tr>
                <th scope="col">Edad</th>
                <th scope="col">Vacuna</th>
                <th scope="col" data-columna-fecha>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${e.dosis.map(
                (d) => html`
                  <tr data-semanas="${d.semanas}">
                    <td>${edad(d.semanas)}</td>
                    <td>${d.vacuna}</td>
                    <td data-fecha>—</td>
                  </tr>
                `,
              )}
            </tbody>
          </table>
        `,
      )}
      <p class="vacunas__nota">${v.nota}</p>
    </section>
  `;
}

/** Cita para consulta, vacuna o baño (no urgencias): sale por WhatsApp. */
export function cita(negocio) {
  const { servicios: lista, vacunas: v, contacto, textos } = negocio;
  const campos = [
    campo({ id: 'cita-mascota', etiqueta: 'Nombre de tu mascota', requerido: true }),
    campo({
      id: 'cita-especie',
      etiqueta: 'Especie',
      tipo: 'select',
      requerido: true,
      opciones: [...v.especies.map((e) => e.nombre), 'Otra'],
    }),
    campo({
      id: 'cita-motivo',
      etiqueta: 'Motivo',
      tipo: 'select',
      requerido: true,
      opciones: lista.map((s) => ({ valor: s.id, texto: s.nombre })),
    }),
    campo({ id: 'cita-dia', etiqueta: 'Día', tipo: 'date', requerido: true }),
    campo({
      id: 'cita-turno',
      etiqueta: 'Turno',
      tipo: 'select',
      requerido: true,
      opciones: ['Mañana', 'Tarde'],
    }),
    campo({
      id: 'cita-nombre',
      etiqueta: 'Tu nombre',
      requerido: true,
      atributos: { autocomplete: 'given-name' },
    }),
  ];
  return html`
    <section class="cita" id="cita" aria-labelledby="cita-titulo">
      <div>
        <h2 class="seccion-titulo" id="cita-titulo" data-armar>Agenda una cita</h2>
        <p class="seccion-intro">${textos.introCita}</p>
      </div>
      ${formularioWhatsapp({
        id: 'form-cita',
        saludo: 'Hola, quiero agendar una cita:',
        boton: 'Agendar por WhatsApp',
        confirmacion: 'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
        telefono: contacto.whatsapp,
        campos,
        clase: 'cita__ficha',
      })}
    </section>
  `;
}

export function equipo(negocio) {
  return html`
    <section class="equipo" aria-labelledby="equipo-titulo">
      <h2 class="seccion-titulo" id="equipo-titulo" data-armar>Quiénes los atienden</h2>
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

export function consejos(negocio) {
  return html`
    <section class="consejos" aria-labelledby="consejos-titulo">
      <h2 class="seccion-titulo" id="consejos-titulo" data-armar>Consejos de cuidado</h2>
      ${negocio.consejos.map(
        (c) => html`
          <article class="consejo">
            <h3 class="consejo__titulo">${c.titulo}</h3>
            <p>${c.texto}</p>
          </article>
        `,
      )}
    </section>
  `;
}

export function horario(negocio) {
  return html`
    <section class="horario-semana" id="horario" aria-labelledby="horario-titulo">
      <h2 class="seccion-titulo" id="horario-titulo" data-armar>Horario de consultas</h2>
      <dl class="horario-semana__dias">
        ${resumenHorario(negocio.horario).map(
          ({ dias, horas }) =>
            html`<div>
              <dt>${dias}</dt>
              <dd>${horas}</dd>
            </div>`,
        )}
      </dl>
      <p class="horario-semana__urgencias">
        Urgencias: las 24 horas, por teléfono.
        <a href="tel:${negocio.urgencias.telefono.replace(/\s/g, '')}">Llamar</a>
      </p>
    </section>
  `;
}
