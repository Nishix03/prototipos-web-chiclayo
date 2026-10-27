import { html, crudo } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { soles } from '../../core/dinero.js';
import { horasPosibles } from '../../core/horario.js';
import { minutosPaquete } from './servicios.js';

const PASOS = ['Servicio', 'Día y hora', 'Tus datos'];

/**
 * La función estrella: armar la cita en 3 pasos, sin apuro. Servicio → día y franja (solo las
 * que caben antes de cerrar; si es hoy, las que no pasaron) → nombre, y la cita sale por
 * WhatsApp. Con JavaScript (cita-cliente.js) se ve un paso a la vez, al ritmo de una
 * respiración; sin JavaScript es un formulario normal con los 3 pasos a la vista.
 */
export function cita(negocio) {
  const { servicios, paquetes, horario, contacto, textos, cita: conf } = negocio;
  const opciones = [
    ...servicios.map((s) => ({
      valor: s.id,
      texto: `${s.nombre} (${soles(s.precio)}, ${s.minutos} min)`,
      minutos: s.minutos,
    })),
    ...paquetes.map((p) => ({
      valor: `paquete-${p.id}`,
      texto: `Paquete ${p.nombre} (${soles(p.precio)}, ${minutosPaquete(p, servicios)} min)`,
      minutos: minutosPaquete(p, servicios),
    })),
  ];
  const pasos = [
    [
      campo({
        id: 'cita-servicio',
        etiqueta: 'Servicio',
        tipo: 'select',
        requerido: true,
        opciones,
      }),
    ],
    [
      campo({ id: 'cita-dia', etiqueta: 'Día', tipo: 'date', requerido: true }),
      campo({
        id: 'cita-hora',
        etiqueta: 'Hora',
        tipo: 'select',
        requerido: true,
        ayuda: 'Solo aparecen las horas en que tu servicio termina antes de cerrar.',
        opciones: horasPosibles(horario, conf.minutosEntreFranjas),
      }),
    ],
    [
      campo({
        id: 'cita-nombre',
        etiqueta: 'Tu nombre',
        requerido: true,
        atributos: { autocomplete: 'given-name' },
      }),
      html`<p class="cita__resumen" data-resumen aria-live="polite"></p>`,
    ],
  ];
  const campos = pasos.map(
    (contenido, i) => html`
      <fieldset class="cita__paso" data-paso="${i}">
        <legend class="cita__paso-titulo">
          <span class="cita__numero">${i + 1}</span> ${PASOS[i]}
        </legend>
        ${contenido}
        ${
          i < PASOS.length - 1
            ? html`<button class="cita__siguiente" type="button" data-siguiente>Continuar</button>`
            : ''
        }
        ${i > 0 ? html`<button class="cita__volver" type="button" data-volver>Volver</button>` : ''}
      </fieldset>
    `,
  );
  // Isla de datos para cita-cliente.js («<» escapado: un dato no puede cerrar el <script>)
  const datos = JSON.stringify({
    paso: conf.minutosEntreFranjas,
    horario,
    minutos: Object.fromEntries(opciones.map((o) => [o.valor, o.minutos])),
  }).replace(/</g, '\\u003c');
  return html`
    <script type="application/json" id="datos-cita">
      ${crudo(datos)}
    </script>
    <section class="cita" id="cita" aria-labelledby="cita-titulo">
      <div class="cita__texto">
        <h2 class="seccion-titulo" id="cita-titulo" data-armar>Arma tu cita</h2>
        <p class="seccion-intro">${textos.introCita}</p>
        <div class="respiracion" aria-hidden="true">
          <span class="respiracion__anillo"></span>
        </div>
        <p class="cita__progreso" data-progreso aria-live="polite"></p>
      </div>
      ${formularioWhatsapp({
        id: 'form-cita',
        saludo: 'Hola, quiero una cita:',
        boton: 'Pedir cita por WhatsApp',
        confirmacion: 'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
        telefono: contacto.whatsapp,
        campos,
        clase: 'cita__ficha',
      })}
    </section>
  `;
}
