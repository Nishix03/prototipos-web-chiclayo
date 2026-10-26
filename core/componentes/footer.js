import { html } from './html.js';
import { enlaceWhatsapp } from '../whatsapp.js';

const NOMBRE_RED = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };

const LICENCIAS = {
  cc0: ['CC0', 'https://creativecommons.org/publicdomain/zero/1.0/'],
  by: ['CC BY', 'https://creativecommons.org/licenses/by/{v}/'],
  'by-sa': ['CC BY-SA', 'https://creativecommons.org/licenses/by-sa/{v}/'],
};

/** Lista de atribuciones que exigen las licencias Creative Commons de las fotos de stock. */
function creditosFotos(creditos) {
  if (!creditos.length) return '';
  return html`
    <details class="pie__creditos">
      <summary>Créditos fotográficos</summary>
      <ul role="list">
        ${creditos.map(({ titulo, autor, licencia, version = '4.0', urlFuente }) => {
          const [nombreLicencia, urlLicencia] = LICENCIAS[licencia];
          return html`<li>
            <a href="${urlFuente}" target="_blank" rel="noopener">${titulo}</a>, de ${autor} ·
            <a href="${urlLicencia.replace('{v}', version)}" target="_blank" rel="noopener"
              >${nombreLicencia}${licencia.startsWith('by') ? ` ${version}` : ''}</a
            >
          </li>`;
        })}
      </ul>
    </details>
  `;
}

export function footer(negocio, { creditos = [] } = {}) {
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
        ${creditosFotos(creditos)}
      </div>
    </footer>
  `;
}
