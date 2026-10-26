import { html } from './html.js';
import { iconos } from './iconos.js';
import { resumenHorario } from '../horario.js';
import { estadoHorario } from './hero.js';

/** Horario y ubicación: el horario completo va en el HTML; JS solo añade "Abierto ahora". */
export function mapa(negocio) {
  const { nombre, ubicacion, horario } = negocio;
  const { direccion, referencia, distrito, ciudad, lat, lng } = ubicacion;
  const coordenadas = `${lat},${lng}`;

  return html`
    <section class="seccion mapa" id="ubicacion" aria-labelledby="ubicacion-titulo">
      <div class="contenedor mapa__rejilla">
        <div class="mapa__info pila">
          <h2 class="seccion__titulo" id="ubicacion-titulo">Horario y cómo llegar</h2>

          <address class="mapa__direccion">
            ${iconos.ubicacion}
            <span>
              ${direccion}, ${distrito}, ${ciudad}
              ${referencia ? html`<br /><span class="mapa__referencia">${referencia}</span>` : ''}
            </span>
          </address>

          <div class="mapa__horario">
            <h3 class="mapa__subtitulo">${iconos.reloj} Horario de atención</h3>
            ${estadoHorario()}
            <dl class="horario">
              ${resumenHorario(horario).map(
                ({ dias, horas }) => html`
                  <div class="horario__fila">
                    <dt>${dias}</dt>
                    <dd>${horas}</dd>
                  </div>
                `,
              )}
            </dl>
            <p class="mapa__nota">Hora de Lima.</p>
          </div>

          <a
            class="boton boton--principal"
            href="https://www.google.com/maps/dir/?api=1&destination=${coordenadas}"
            target="_blank"
            rel="noopener"
            >${iconos.ubicacion} Abrir en Google Maps</a
          >
        </div>

        <div class="mapa__marco">
          <iframe
            title="Mapa con la ubicación de ${nombre}"
            src="https://maps.google.com/maps?q=${coordenadas}&z=16&hl=es&output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  `;
}
