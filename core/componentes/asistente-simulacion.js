import { html } from './html.js';
import { iconos } from './iconos.js';
import { enlaceWhatsapp } from '../whatsapp.js';

// Simulación del asistente virtual (ADR 013). NO es un agente de IA: no entiende preguntas, no
// consulta ningún modelo y no guarda nada. Muestra 2 a 4 preguntas con respuestas escritas de
// antemano en negocio.json (bloque "agente"), siempre rotuladas como simulación.
//
// Estilos con Tailwind (ADR 015): este archivo está en los @source de core/tailwind.css, así que
// las clases deben escribirse completas, nunca armadas con concatenación.
//
// El HTML trae todo (preguntas y respuestas); app solo abre y cierra el <dialog> y alterna
// cuál respuesta se ve (core/asistente-cliente.js). El botón nace oculto y aparece cuando ese
// script está listo: sin JavaScript no se muestra un botón que no haría nada.

const FOCO =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-foco)';

export function asistenteSimulacion(negocio) {
  const agente = negocio.agente;
  if (!agente?.activo) return html``;
  const { whatsapp, mensajeWhatsapp } = negocio.contacto;
  const saludo = agente.saludo ?? 'Elige una pregunta para ver un ejemplo de respuesta.';

  return html`
    <aside aria-label="Asistente virtual (simulación)">
      <button
        type="button"
        data-asistente-abrir
        aria-haspopup="dialog"
        aria-label="Asistente · simulación: abrir el asistente virtual"
        class="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-(--capa-flotante) hidden min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-(--color-borde) bg-(--color-fondo) px-3 py-2 text-(length:--texto-sm) font-[600] text-(--color-texto) [box-shadow:var(--sombra-md)] transition-[scale,box-shadow] duration-(--duracion-rapida) ease-(--curva-salida) hover:[box-shadow:var(--sombra-lg)] active:scale-[0.96] motion-reduce:transition-none data-[listo]:inline-flex ${FOCO}"
      >
        <span class="size-6">${iconos.asistente}</span>
        <span class="hidden md:inline">Asistente · simulación</span>
      </button>

      <dialog
        data-asistente
        aria-labelledby="asistente-titulo"
        class="fixed inset-auto right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(9.5rem+env(safe-area-inset-bottom))] m-0 max-h-[calc(100dvh-11rem)] w-[min(24rem,calc(100vw-2rem))] translate-y-2 overflow-auto rounded-(--radio-lg) border border-(--color-borde) bg-(--color-fondo) p-0 text-(--color-texto) opacity-0 [box-shadow:var(--sombra-lg)] transition-[opacity,translate,overlay,display] transition-discrete duration-(--duracion-rapida) ease-(--curva-salida) backdrop:bg-[rgb(0_0_0/0.3)] open:translate-y-0 open:opacity-100 open:duration-(--duracion-media) starting:open:translate-y-2 starting:open:opacity-0 motion-reduce:transition-none"
      >
        <div class="flex items-start justify-between gap-3 border-b border-(--color-borde) p-4">
          <div>
            <p
              class="text-(length:--texto-sm) font-[600] tracking-[0.04em] text-(--color-texto-suave) uppercase"
            >
              Simulación · asistente virtual (próximamente)
            </p>
            <h2 id="asistente-titulo" class="mt-1 text-(length:--texto-lg) leading-snug font-[600]">
              ${agente.nombre}
            </h2>
          </div>
          <button
            type="button"
            data-asistente-cerrar
            aria-label="Cerrar el asistente"
            class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-(length:--texto-xl) leading-none text-(--color-texto) transition-[scale,background-color] duration-(--duracion-rapida) ease-(--curva-salida) hover:bg-(--color-superficie) active:scale-[0.96] motion-reduce:transition-none ${FOCO}"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div class="grid gap-4 p-4">
          <p data-asistente-saludo class="text-(--color-texto-suave)">${saludo}</p>

          <ul class="m-0 grid list-none gap-2 p-0">
            ${agente.simulacion.map(
              (chip, i) => html`
                <li>
                  <button
                    type="button"
                    data-chip="${i}"
                    aria-pressed="false"
                    class="min-h-11 w-full cursor-pointer rounded-(--radio-md) border border-(--color-borde) bg-(--color-superficie) px-3 py-2 text-left text-(--color-texto) transition-[background-color,scale] duration-(--duracion-rapida) ease-(--curva-salida) hover:bg-(--color-marca-suave) active:scale-[0.98] aria-pressed:border-(--color-marca) aria-pressed:bg-(--color-marca-suave) motion-reduce:transition-none ${FOCO}"
                  >
                    ${chip.pregunta}
                  </button>
                </li>
              `,
            )}
          </ul>

          <div aria-live="polite" class="grid gap-2">
            ${agente.simulacion.map(
              (chip, i) => html`
                <div data-respuesta="${i}" hidden class="grid gap-2">
                  <p
                    class="max-w-[85%] justify-self-end rounded-(--radio-md) bg-(--color-marca) px-3 py-2 text-(--color-sobre-marca) transition-[opacity,translate] duration-(--duracion-media) ease-(--curva-salida) starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
                  >
                    ${chip.pregunta}
                  </p>
                  <p
                    class="max-w-[85%] justify-self-start rounded-(--radio-md) border border-(--color-borde) bg-(--color-superficie) px-3 py-2 transition-[opacity,translate] duration-(--duracion-media) ease-(--curva-salida) starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none"
                  >
                    ${chip.respuesta}
                  </p>
                </div>
              `,
            )}
          </div>

          <p class="text-(length:--texto-sm) text-(--color-texto-suave)">
            Las respuestas están escritas de antemano. No es una conversación real ni usa
            inteligencia artificial.
          </p>

          <a
            href="${enlaceWhatsapp(whatsapp, mensajeWhatsapp)}"
            target="_blank"
            rel="noopener"
            class="inline-flex min-h-11 items-center justify-center rounded-(--radio-boton) bg-(--color-whatsapp) px-4 py-2 font-[600] text-[#fff] no-underline transition-[scale] duration-(--duracion-rapida) ease-(--curva-salida) active:scale-[0.98] motion-reduce:transition-none ${FOCO}"
          >
            Escribir por WhatsApp
          </a>
        </div>
      </dialog>
    </aside>
  `;
}
