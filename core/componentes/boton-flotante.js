import { html } from './html.js';
import { iconos } from './iconos.js';
import { enlaceWhatsapp } from '../whatsapp.js';

/** Botón de WhatsApp fijo abajo a la derecha. En pantallas anchas muestra también el texto. */
export function botonFlotante(negocio) {
  const { whatsapp, mensajeWhatsapp } = negocio.contacto;
  return html`
    <a
      class="boton-flotante"
      href="${enlaceWhatsapp(whatsapp, mensajeWhatsapp)}"
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
    >
      ${iconos.chat}
      <span class="boton-flotante__texto" aria-hidden="true">WhatsApp</span>
    </a>
  `;
}
