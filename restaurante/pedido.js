// El pedido del restaurante como datos: funciones puras, sin DOM.
// carrito.js (navegador) las usa para pintar la barra y la comanda, y la prueba E2E
// comprueba que el mensaje que llega a WhatsApp es exactamente el que arman estas.

import { soles } from '../core/dinero.js';

/**
 * @typedef {{ id: string, nombre: string, precio: number }} Plato
 * @typedef {Map<string, { plato: Plato, cantidad: number }>} Pedido
 */

/** Líneas con cantidad > 0, en el orden en que se agregaron. */
export const lineas = (pedido) => [...pedido.values()].filter((l) => l.cantidad > 0);

export const totalPlatos = (pedido) => lineas(pedido).reduce((suma, l) => suma + l.cantidad, 0);

export const totalSoles = (pedido) =>
  lineas(pedido).reduce((suma, l) => suma + l.cantidad * l.plato.precio, 0);

/** "1 plato" / "3 platos" */
export const textoPlatos = (n) => `${n} ${n === 1 ? 'plato' : 'platos'}`;

/**
 * Mensaje para WhatsApp:
 *   Hola, quiero pedir:
 *   • 2x Ceviche de pescado (S/ 70)
 *   Total: S/ 70
 *   Entrega: Delivery
 *   Dirección: …
 */
export function mensajePedido(pedido, { entrega, direccion = '', nota = '' }) {
  const partes = [
    'Hola, quiero pedir:',
    ...lineas(pedido).map(
      ({ plato, cantidad }) => `• ${cantidad}x ${plato.nombre} (${soles(cantidad * plato.precio)})`,
    ),
    `Total: ${soles(totalSoles(pedido))}`,
    `Entrega: ${entrega === 'delivery' ? 'Delivery' : 'Recojo en el local'}`,
  ];
  if (entrega === 'delivery' && direccion.trim()) partes.push(`Dirección: ${direccion.trim()}`);
  if (nota.trim()) partes.push(`Nota: ${nota.trim()}`);
  return partes.join('\n');
}
