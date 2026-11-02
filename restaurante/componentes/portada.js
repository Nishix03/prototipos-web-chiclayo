import { marca as simboloMarca } from '../../core/componentes/marca.js';
import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';
import { imagen } from '../../core/componentes/imagen.js';
import { soles } from '../../core/dinero.js';

/**
 * Escena de «La mesa norteña» detrás de toda la página (ADR 008): primero la imagen fija de la escena,
 * que es el LCP; el 3D se monta encima cuando la página ya cargó (escena/montar.js).
 * Hay dos encuadres: horizontal para escritorio y vertical para celular.
 */
function escena() {
  return html`
    <div class="escena" data-escena aria-hidden="true">
      <picture class="escena__fija">
        <source media="(max-width: 600px)" srcset="img/mesa-nortena-movil-v4-600.webp" />
        <source
          media="(max-aspect-ratio: 1/1)"
          srcset="img/mesa-nortena-movil-v4-600.webp 600w, img/mesa-nortena-movil-v4-900.webp 900w"
          sizes="100vw"
        />
        <img
          src="img/mesa-nortena-v4-1440.webp"
          srcset="img/mesa-nortena-v4-960.webp 960w, img/mesa-nortena-v4-1440.webp 1440w"
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
 * Portada: dos comandas colgadas del riel. La primera dice quién es, qué se pide y si está
 * abierto hoy (exigencia 1); la segunda es el llamado. «Reservar mesa» va como enlace aparte,
 * no como segundo botón (exigencia 4).
 */
export function portada(negocio) {
  const { nombre, textos } = negocio;
  const [marca, sufijo] = nombre.split(' · ');
  const carta = negocio.carta.flatMap((categoria) => categoria.platos);
  const destacados = ['arroz-con-pato', 'cabrito', 'ceviche']
    .map((id) => carta.find((plato) => plato.id === id))
    .filter(Boolean);
  return html`
    ${escena()}
    <section class="portada" aria-labelledby="titular" data-portada>
      <div class="portada__principal">
        <article class="comanda-colgada comanda-colgada--portada">
          <span class="pinza" aria-hidden="true"></span>
          <p class="comanda-colgada__negocio">
            ${simboloMarca(negocio)}
            <span translate="no">${marca}</span>
            ${sufijo ? html`<span class="comanda-colgada__demo">${sufijo.toLowerCase()}</span>` : ''}
          </p>
          <h1 class="titular" id="titular" data-texto="${textos.titular}">${textos.titular}</h1>
          <p class="bajada">${textos.bajada}</p>
          ${estadoHorario({ enlace: '#horario' })}
        </article>
        <div class="portada__llamados">
          <a class="comanda-colgada comanda-colgada--pedir" href="#carta">
            <span class="pinza" aria-hidden="true"></span>
            Armar mi pedido
          </a>
          <a class="portada__reservar" href="#reservas">Reservar mesa</a>
        </div>
      </div>
      <nav class="portada__platos" aria-label="Platos de nuestra cocina">
        <p class="portada__platos-titulo">De nuestra cocina</p>
        <ul role="list">
          ${destacados.map(
            (plato) =>
              html`<li>
                <a href="#plato-${plato.id}" data-plato-portada>
                  ${plato.foto ? imagen({ ...plato.foto, alt: '' }, { sizes: '(min-width: 60rem) 160px, 100px' }) : ''}
                  <span>${plato.nombre}</span><strong>${soles(plato.precio)}</strong>
                </a>
              </li>`,
          )}
        </ul>
      </nav>
    </section>
  `;
}
