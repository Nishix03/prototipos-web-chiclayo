import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';
import { iconos } from '../../core/componentes/iconos.js';
import { enlaceWhatsapp } from '../../core/whatsapp.js';

/**
 * La función estrella: la barra de urgencias, fija arriba en toda la página. Un punto que late,
 * «Llamar ahora» (tel:) y WhatsApp directo. Se ve igual sin JavaScript.
 */
export function urgencias(negocio) {
  const { urgencias: u, contacto, nombre } = negocio;
  const marca = nombre.split(' · ')[0];
  return html`
    <div class="urgencias" role="region" aria-label="Urgencias">
      <p class="urgencias__texto">
        <span class="urgencias__pulso" aria-hidden="true"></span>
        <strong>${u.texto}</strong>
      </p>
      <a class="urgencias__llamar" href="tel:${u.telefono.replace(/\s/g, '')}" data-estrella
        >${iconos.telefono} Llamar ahora</a
      >
      <a
        class="urgencias__whatsapp"
        href="${enlaceWhatsapp(contacto.whatsapp, `Hola, es una urgencia en ${marca}:`)}"
        target="_blank"
        rel="noopener"
        >${iconos.chat}<span class="urgencias__whatsapp-texto">WhatsApp</span
        ><span class="solo-lector"> de urgencias</span></a
      >
    </div>
  `;
}

export function cabecera(negocio) {
  const [marca, sufijo] = negocio.nombre.split(' · ');
  return html`
    <header class="cabecera">
      <p class="cabecera__nombre">
        <span translate="no">${marca}</span>
        ${sufijo ? html`<span class="cabecera__demo">${sufijo.toLowerCase()}</span>` : ''}
      </p>
      <a class="cabecera__enlace" href="#cita">Agendar cita</a>
    </header>
  `;
}

/** Escena «Juego» detrás de toda la página (ADR 008): imagen fija primero. */
function escena() {
  return html`
    <div class="escena" data-escena aria-hidden="true">
      <picture class="escena__fija">
        <source
          media="(max-aspect-ratio: 1/1)"
          srcset="img/juego-movil-600.webp 600w, img/juego-movil-900.webp 900w"
          sizes="100vw"
        />
        <img
          src="img/juego-1440.webp"
          srcset="img/juego-960.webp 960w, img/juego-1440.webp 1440w"
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

export function portada(negocio) {
  const { textos } = negocio;
  return html`
    ${escena()}
    <section class="portada" aria-labelledby="titular">
      <h1 class="titular" id="titular">${textos.titular}</h1>
      <p class="bajada">${textos.bajada}</p>
      ${estadoHorario({ enlace: '#horario' })}
      <a class="llamado" href="#cita">Agendar consulta o baño</a>
    </section>
  `;
}
