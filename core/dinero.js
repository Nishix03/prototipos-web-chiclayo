// Precios en soles, como se escriben en Perú: "S/ 35" o "S/ 12.50".
// Usa Intl.NumberFormat (el formato oficial de es-PE) en vez de armar el texto a mano.
// Función pura: la usan los componentes (build) y los carritos (navegador).

const entero = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const conCentimos = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

/** 35 → "S/ 35", 12.5 → "S/ 12.50" (con espacio no separable entre S/ y el número) */
export function soles(monto) {
  return (Number.isInteger(monto) ? entero : conCentimos).format(monto);
}
