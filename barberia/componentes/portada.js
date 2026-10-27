import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';

/**
 * Letrero fijo arriba (componente propio del rubro): el nombre y el tiempo de espera de hoy,
 * siempre a la vista mientras se baja por la página. La espera la actualiza el dueño en
 * negocio.json; la fase de chatbots la llevará el bot.
 */
export function letrero(negocio) {
  const [marca, sufijo] = negocio.nombre.split(' · ');
  return html`
    <header class="letrero">
      <p class="letrero__nombre">
        <span translate="no">${marca}</span>
        ${sufijo ? html`<span class="letrero__demo">${sufijo.toLowerCase()}</span>` : ''}
      </p>
      <p class="letrero__espera" data-espera>
        <span class="letrero__etiqueta">Espera hoy</span>
        <strong>${negocio.espera}</strong>
      </p>
    </header>
  `;
}

/**
 * Escena «Filo» detrás de toda la página (ADR 008): primero la imagen fija (LCP), el cromo
 * líquido se monta encima cuando la página ya cargó.
 */
function escena() {
  return html`
    <div class="escena" data-escena aria-hidden="true">
      <picture class="escena__fija">
        <source
          media="(max-aspect-ratio: 1/1)"
          srcset="img/filo-movil-600.webp 600w, img/filo-movil-900.webp 900w"
          sizes="100vw"
        />
        <img
          src="img/filo-1440.webp"
          srcset="img/filo-960.webp 960w, img/filo-1440.webp 1440w"
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

/** Portada: titular corto, estado de hoy con enlace al horario y el llamado al turno. */
export function portada(negocio) {
  const { textos } = negocio;
  return html`
    ${escena()}
    <section class="portada" aria-labelledby="titular">
      <div class="portada__placa">
        <h1 class="titular" id="titular">${textos.titular}</h1>
        <p class="bajada">${textos.bajada}</p>
        ${estadoHorario({ enlace: '#horario' })}
        <a class="llamado" href="#turno" data-estrella>Pedir mi turno</a>
      </div>
    </section>
  `;
}
