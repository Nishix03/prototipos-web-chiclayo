// Precios en soles, como se escriben en Perú: "S/ 35" o "S/ 12.50".
// Función pura: la usan los componentes (build) y los carritos (navegador).

/** 35 → "S/ 35", 12.5 → "S/ 12.50" */
export function soles(monto) {
  const conDecimales = !Number.isInteger(monto);
  return `S/ ${monto.toFixed(conDecimales ? 2 : 0)}`;
}
