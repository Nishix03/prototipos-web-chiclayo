import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';

/** Cabecera tranquila: el nombre y un solo acceso, la evaluación. */
export function cabecera(negocio) {
  const [marca, sufijo] = negocio.nombre.split(' · ');
  return html`
    <header class="cabecera">
      <p class="cabecera__nombre">
        <span translate="no">${marca}</span>
        ${sufijo ? html`<span class="cabecera__demo">${sufijo.toLowerCase()}</span>` : ''}
      </p>
      <a class="cabecera__enlace" href="#evaluacion">Agendar evaluación</a>
    </header>
  `;
}

/** Escena «Calma clínica» detrás de toda la página (ADR 008): imagen fija primero. */
function escena() {
  return html`
    <div class="escena" data-escena aria-hidden="true">
      <picture class="escena__fija">
        <source
          media="(max-aspect-ratio: 1/1)"
          srcset="img/calma-movil-600.webp 600w, img/calma-movil-900.webp 900w"
          sizes="100vw"
        />
        <img
          src="img/calma-1440.webp"
          srcset="img/calma-960.webp 960w, img/calma-1440.webp 1440w"
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

/** Portada: la pregunta del titular, el estado de hoy y el llamado al cuestionario. */
export function portada(negocio) {
  const { textos } = negocio;
  return html`
    ${escena()}
    <section class="portada" aria-labelledby="titular">
      <h1 class="titular" id="titular">${textos.titular}</h1>
      <p class="bajada">${textos.bajada}</p>
      ${estadoHorario({ enlace: '#horario' })}
      <a class="llamado" href="#cuestionario" data-estrella>Empezar el cuestionario</a>
    </section>
  `;
}
