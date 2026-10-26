import { html } from './html.js';
import { enlaceWhatsapp } from '../whatsapp.js';

/**
 * Un campo de formulario accesible: etiqueta visible, ayuda opcional y un espacio para el
 * error que core/formulario-whatsapp.js rellena. La etiqueta (o data-etiqueta) se usa
 * también como nombre del dato en el mensaje de WhatsApp.
 *
 * @param {object} c
 * @param {string} c.id  id único en la página; también es el name
 * @param {string} c.etiqueta
 * @param {'text'|'tel'|'date'|'time'|'number'|'select'|'textarea'} [c.tipo]
 * @param {Array<string|{valor: string, texto: string}>} [c.opciones]  solo para select
 */
export function campo({
  id,
  etiqueta,
  tipo = 'text',
  requerido = false,
  ayuda,
  opciones = [],
  atributos = {},
}) {
  const describe = [ayuda && `${id}-ayuda`, `${id}-error`].filter(Boolean).join(' ');
  const extra = Object.entries(atributos).map(([k, v]) => html` ${k}="${v}"`);
  const comunes = html`id="${id}" name="${id}" aria-describedby="${describe}"
  ${requerido ? html`required` : ''}${extra}`;

  let control;
  if (tipo === 'select') {
    control = html`<select ${comunes}>
      <option value="">Elige una opción</option>
      ${opciones.map((o) => {
        const { valor, texto } = typeof o === 'string' ? { valor: o, texto: o } : o;
        return html`<option value="${valor}">${texto}</option>`;
      })}
    </select>`;
  } else if (tipo === 'textarea') {
    control = html`<textarea ${comunes} rows="3"></textarea>`;
  } else {
    control = html`<input type="${tipo}" ${comunes} />`;
  }

  return html`
    <div class="campo">
      <label class="campo__etiqueta" for="${id}"
        >${etiqueta}${requerido ? '' : html` <span class="campo__opcional">(opcional)</span>`}</label
      >
      ${ayuda ? html`<p class="campo__ayuda" id="${id}-ayuda">${ayuda}</p>` : ''} ${control}
      <p class="campo__error" id="${id}-error" hidden></p>
    </div>
  `;
}

/**
 * <form> que termina en WhatsApp. Sin JavaScript queda un enlace directo de respaldo.
 * @param {object} f
 * @param {string} f.id
 * @param {string} f.saludo  primera línea del mensaje, p. ej. "Hola, quiero reservar una mesa:"
 * @param {string} f.boton  texto del botón de envío
 * @param {string} [f.confirmacion]  aviso tras abrir WhatsApp (por defecto, uno genérico)
 */
export function formularioWhatsapp({
  id,
  saludo,
  boton,
  telefono,
  campos,
  confirmacion,
  clase = '',
}) {
  return html`
    <form
      class="formulario ${clase}"
      id="${id}"
      data-whatsapp
      data-saludo="${saludo}"
      ${confirmacion ? html`data-confirmacion="${confirmacion}"` : ''}
      novalidate
    >
      ${campos}
      <p class="formulario__estado" role="status" aria-live="polite"></p>
      <button class="boton boton--principal" type="submit">${boton}</button>
      <noscript>
        <p class="formulario__respaldo">
          <a href="${enlaceWhatsapp(telefono, saludo)}" target="_blank" rel="noopener"
            >Escríbenos directamente por WhatsApp</a
          >
        </p>
      </noscript>
    </form>
  `;
}
