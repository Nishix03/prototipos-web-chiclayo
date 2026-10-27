import { html } from './html.js';
import { iconos } from './iconos.js';
import { enlaceWhatsapp } from '../whatsapp.js';
import { imagen } from './imagen.js';

/**
 * Indicador "Abierto · hoy de 12:00 a 16:30 / Cerrado · abre mañana…". Ocupa su espacio desde
 * el inicio pero es invisible hasta que horario.js lo rellena (ver hero.css): así no empuja la
 * página al aparecer. Con `enlace`, agrega un enlace al horario completo (exigencia 1).
 */
export const estadoHorario = ({ enlace } = {}) => html`
  <p class="estado-horario etiqueta" data-estado-horario>
    <span class="estado-horario__punto" aria-hidden="true"></span>
    <span data-estado-texto>&nbsp;</span>
    ${enlace ? html`<a class="estado-horario__enlace" href="${enlace}">Horario</a>` : ''}
  </p>
`;

export function hero(negocio) {
  const { nombre, eslogan, contacto, imagenes } = negocio;
  return html`
    <header class="hero">
      <div class="contenedor hero__rejilla">
        <div class="hero__texto pila">
          ${estadoHorario()}
          <h1 class="hero__titulo">${nombre}</h1>
          <p class="hero__eslogan">${eslogan}</p>
          <div class="grupo-botones">
            <a
              class="boton boton--principal"
              href="${enlaceWhatsapp(contacto.whatsapp, contacto.mensajeWhatsapp)}"
              target="_blank"
              rel="noopener"
              >${iconos.chat} Escríbenos por WhatsApp</a
            >
            <a class="boton boton--secundario" href="#ubicacion">${iconos.ubicacion} Cómo llegar</a>
          </div>
        </div>
        <figure class="hero__media">${imagen(imagenes.hero, { prioridad: true })}</figure>
      </div>
    </header>
  `;
}
