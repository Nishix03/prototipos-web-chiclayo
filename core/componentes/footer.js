import { html } from './html.js';
import { enlaceWhatsapp } from '../whatsapp.js';

const NOMBRE_RED = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };

export function footer(negocio) {
  const { nombre, contacto, ubicacion, redes = {}, demo } = negocio;
  const anio = new Date().getFullYear(); // se fija al construir

  return html`
    <footer class="pie">
      <div class="contenedor pie__rejilla">
        <div class="pila">
          <p class="pie__nombre">${nombre}</p>
          <p>${ubicacion.direccion}, ${ubicacion.distrito}, ${ubicacion.ciudad}</p>
        </div>

        <ul class="pie__enlaces" role="list">
          <li>
            <a href="${enlaceWhatsapp(contacto.whatsapp)}" target="_blank" rel="noopener"
              >WhatsApp</a
            >
          </li>
          ${contacto.telefono ? html`<li><a href="tel:+51${contacto.telefono}">Llamar</a></li>` : ''}
          ${contacto.correo ? html`<li><a href="mailto:${contacto.correo}">${contacto.correo}</a></li>` : ''}
          ${Object.entries(redes).map(
            ([red, url]) =>
              html`<li><a href="${url}" target="_blank" rel="noopener">${NOMBRE_RED[red]}</a></li>`,
          )}
        </ul>
      </div>
      <div class="contenedor pie__legal">
        <p>© ${anio} ${nombre}${demo ? ' · Sitio de demostración con datos ficticios' : ''}</p>
      </div>
    </footer>
  `;
}
