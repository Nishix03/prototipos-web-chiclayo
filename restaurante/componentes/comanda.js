import { html } from '../../core/componentes/html.js';
import { campo } from '../../core/componentes/formulario.js';

/**
 * Barra de pedido + la comanda (momento firma). Las líneas del pedido las pinta carrito.js;
 * aquí va solo el armazón. La comanda es un <dialog> nativo: showModal() le da gratis el
 * foco atrapado, el fondo inerte y el cierre con Escape.
 */
export function comanda(negocio) {
  const { entrega, notaDelivery } = negocio.pedidos;
  const opcion = (valor, texto, marcada) => html`
    <label class="opcion">
      <input
        type="radio"
        name="entrega"
        value="${valor}"
        ${marcada ? html`checked` : ''}
        required
      />
      ${texto}
    </label>
  `;

  return html`
    <aside class="barra-pedido" data-barra aria-label="Tu pedido">
      <p class="barra-pedido__resumen" data-resumen></p>
      <button class="boton barra-pedido__boton" type="button" data-abrir-comanda>
        Ver mi pedido
      </button>
    </aside>

    <dialog class="comanda" aria-labelledby="comanda-titulo" data-comanda>
      <form
        class="comanda__papel"
        id="form-comanda"
        data-whatsapp
        data-saludo="Hola, quiero pedir:"
        data-confirmacion="Abrimos WhatsApp con tu pedido listo. Solo falta que lo envíes."
        novalidate
      >
        <button
          class="comanda__cerrar"
          type="button"
          data-cerrar-comanda
          aria-label="Cerrar tu pedido"
        >
          ×
        </button>
        <h2 class="comanda__titulo" id="comanda-titulo">Tu pedido</h2>

        <ul class="comanda__lineas" role="list" data-lineas></ul>
        <div class="comanda__vacia" data-vacia hidden>
          <p>Tu pedido está vacío. Agrega platos desde la carta.</p>
          <button class="boton boton--secundario" type="button" data-cerrar-comanda>
            Volver a la carta
          </button>
        </div>
        <p class="comanda__total"><span>Total</span><span class="precio" data-total></span></p>

        <fieldset class="comanda__entrega" data-omitir>
          <legend>¿Cómo lo recibes?</legend>
          <div class="opciones">
            ${entrega.includes('delivery') ? opcion('delivery', 'Delivery', true) : ''}
            ${entrega.includes('recojo') ? opcion('recojo', 'Recojo', !entrega.includes('delivery')) : ''}
          </div>
          ${notaDelivery ? html`<p class="comanda__nota-delivery" data-nota-delivery>${notaDelivery}</p>` : ''}
        </fieldset>

        <div data-campo-direccion>
          ${campo({ id: 'direccion', etiqueta: 'Dirección de entrega', requerido: true, atributos: { autocomplete: 'street-address' } })}
        </div>
        ${campo({
          id: 'nota',
          etiqueta: 'Nota para la cocina',
          ayuda: 'Por ejemplo: sin cebolla, o sin ají.',
        })}

        <p class="formulario__estado" role="status" aria-live="polite"></p>
        <button class="boton boton--principal comanda__enviar" type="submit">
          Enviar pedido por WhatsApp
        </button>
      </form>
    </dialog>
  `;
}
