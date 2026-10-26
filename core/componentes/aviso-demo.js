import { html } from './html.js';

/**
 * Franja visible en todo sitio con "demo": true. render.js la inserta sola al inicio del
 * <body>, así que no puede olvidarse: el contenido de demostración nunca pasa por real.
 */
export function avisoDemo() {
  return html`
    <aside class="aviso-demo" aria-label="Aviso de demostración">
      <p>Sitio de demostración: nombre, reseñas y datos de contacto son ficticios.</p>
    </aside>
  `;
}
