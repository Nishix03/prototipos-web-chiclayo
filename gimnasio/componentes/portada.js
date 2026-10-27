import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';

export function cabecera(negocio) {
  const [marca, sufijo] = negocio.nombre.split(' · ');
  return html`
    <header class="cabecera">
      <p class="cabecera__nombre">
        <span translate="no">${marca}</span>
        ${sufijo ? html`<span class="cabecera__demo">${sufijo.toLowerCase()}</span>` : ''}
      </p>
      <a class="cabecera__enlace" href="#prueba">Clase de prueba gratis</a>
    </header>
  `;
}

/** Escena «Pulso» detrás de toda la página (ADR 008): imagen fija primero. */
function escena() {
  return html`
    <div class="escena" data-escena aria-hidden="true">
      <picture class="escena__fija">
        <source
          media="(max-aspect-ratio: 1/1)"
          srcset="img/pulso-movil-600.webp 600w, img/pulso-movil-900.webp 900w"
          sizes="100vw"
        />
        <img
          src="img/pulso-1440.webp"
          srcset="img/pulso-960.webp 960w, img/pulso-1440.webp 1440w"
          sizes="100vw"
          width="1440"
          height="900"
          alt=""
          fetchpriority="high"
          decoding="async"
        />
      </picture>
    </div>
  `;
}

/**
 * Portada: el titular, el estado de hoy, la clase que está en curso ahora (la escribe
 * clases-cliente.js; el espacio ya está reservado) y el llamado al horario de clases.
 */
export function portada(negocio) {
  const { textos } = negocio;
  return html`
    ${escena()}
    <section class="portada" aria-labelledby="titular">
      <h1 class="titular" id="titular">${textos.titular}</h1>
      <p class="bajada">${textos.bajada}</p>
      ${estadoHorario({ enlace: '#horario' })}
      <p class="ahora" data-ahora aria-live="polite"></p>
      <a class="llamado" href="#clases" data-estrella>Ver las clases de hoy</a>
    </section>
  `;
}
