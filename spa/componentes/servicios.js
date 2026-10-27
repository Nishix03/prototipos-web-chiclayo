import { html } from '../../core/componentes/html.js';
import { soles } from '../../core/dinero.js';
import { enlaceWhatsapp } from '../../core/whatsapp.js';

/**
 * Revisa las referencias al construir: cada servicio está en una categoría que existe y cada
 * paquete incluye servicios que existen. Un error de datos detiene el build con un mensaje claro.
 */
export function revisarReferencias({ categorias, servicios, paquetes }) {
  const cats = new Set(categorias.map((c) => c.id));
  const ids = new Set(servicios.map((s) => s.id));
  const errores = [
    ...servicios
      .filter((s) => !cats.has(s.categoria))
      .map((s) => `el servicio «${s.id}» está en la categoría «${s.categoria}», que no existe`),
    ...paquetes.flatMap((p) =>
      p.incluye
        .filter((id) => !ids.has(id))
        .map((id) => `el paquete «${p.id}» incluye «${id}», que no es un servicio`),
    ),
  ];
  if (errores.length) throw new Error(`Servicios de negocio.json:\n  ${errores.join('\n  ')}`);
}

/** Minutos de un paquete: la suma de sus servicios. */
export const minutosPaquete = (p, servicios) =>
  p.incluye.reduce((t, id) => t + servicios.find((s) => s.id === id).minutos, 0);

/**
 * Los servicios como una carta de spa: nombre, duración y precio, agrupados por categoría.
 * Los filtros solo aparecen con JavaScript (sin JS se ve la carta completa).
 * «Reservar» deja el servicio elegido en la cita.
 */
export function servicios(negocio) {
  const { categorias, servicios: lista, textos } = negocio;
  revisarReferencias(negocio);
  return html`
    <section class="servicios" id="servicios" aria-labelledby="servicios-titulo">
      <h2 class="seccion-titulo" id="servicios-titulo" data-armar>Servicios y precios</h2>
      <p class="seccion-intro">${textos.introServicios}</p>
      <div class="filtros" role="group" aria-label="Filtrar los servicios" data-filtros>
        <button type="button" aria-pressed="true" data-filtro="todo">Todos</button>
        ${categorias.map(
          (c) =>
            html`<button type="button" aria-pressed="false" data-filtro="${c.id}">
              ${c.nombre}
            </button>`,
        )}
      </div>
      <ul class="servicios__lista" role="list">
        ${lista.map(
          (s) => html`
            <li class="servicio" data-servicio="${s.id}" data-categoria="${s.categoria}">
              <h3 class="servicio__nombre">${s.nombre}</h3>
              <p class="servicio__datos">
                <span class="servicio__minutos">${s.minutos} min</span>
                <span class="servicio__precio">${soles(s.precio)}</span>
              </p>
              <p class="servicio__descripcion">${s.descripcion}</p>
              <a class="servicio__reservar" href="#cita" data-reservar="${s.id}"
                >Reservar <span class="solo-lector">${s.nombre}</span></a
              >
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/** Paquetes (servicios combinados) y la tarjeta de regalo por WhatsApp. */
export function paquetes(negocio) {
  const { paquetes: lista, servicios: todos, regalo, contacto, textos } = negocio;
  const nombre = (id) => todos.find((s) => s.id === id).nombre;
  return html`
    <section class="paquetes" id="paquetes" aria-labelledby="paquetes-titulo">
      <h2 class="seccion-titulo" id="paquetes-titulo" data-armar>Paquetes</h2>
      <p class="seccion-intro">${textos.introPaquetes}</p>
      <ul class="paquetes__lista" role="list">
        ${lista.map(
          (p) => html`
            <li class="paquete">
              <h3 class="paquete__nombre">${p.nombre}</h3>
              <p class="paquete__datos">
                ${minutosPaquete(p, todos)} min · <strong>${soles(p.precio)}</strong>
              </p>
              <p class="paquete__incluye">${p.incluye.map(nombre).join(' + ')}</p>
              <a class="servicio__reservar" href="#cita" data-reservar="paquete-${p.id}"
                >Reservar <span class="solo-lector">${p.nombre}</span></a
              >
            </li>
          `,
        )}
      </ul>
      <div class="regalo">
        <h3 class="regalo__titulo">${regalo.titulo}</h3>
        <p>${regalo.texto}</p>
        <a
          class="regalo__enlace"
          href="${enlaceWhatsapp(contacto.whatsapp, regalo.mensaje)}"
          target="_blank"
          rel="noopener"
          >Pedir una tarjeta de regalo por WhatsApp</a
        >
      </div>
    </section>
  `;
}
