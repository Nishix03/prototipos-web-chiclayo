import { html } from '../../core/componentes/html.js';
import { estadoHorario } from '../../core/componentes/hero.js';
import { soles } from '../../core/dinero.js';

/**
 * Cabecera del diario: el nombre como cabecera de periódico y una línea de "fecha" con datos
 * vivos (menú de hoy, abierto/cerrado). No se escribe la fecha del día: quedaría fija al
 * construir y sería falsa al día siguiente.
 */
export function cabecera(negocio) {
  const { nombre, eslogan, menuDelDia, pedidos } = negocio;
  const [marca, sufijo] = nombre.split(' · ');
  const entrega = pedidos.entrega.includes('delivery') ? 'Delivery y recojo' : 'Recojo en el local';

  return html`
    <header class="cabecera contenedor">
      <p class="cabecera__nombre">
        ${marca}
        <span class="cabecera__lema">${eslogan}${sufijo ? ` · ${sufijo}` : ''}</span>
      </p>
      <div class="fecha">
        <a href="#menu-hoy">Menú de hoy: ${soles(menuDelDia.precio)}</a>
        ${estadoHorario()}
        <span class="fecha__extra">${entrega} por WhatsApp</span>
      </div>
    </header>
  `;
}
