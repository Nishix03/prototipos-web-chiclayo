// Contraste de color según WCAG 2.1 (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio).
// Funciones puras: corren igual en Node (build) y en el navegador.

export const CONTRASTE_MINIMO = 4.5; // texto normal, nivel AA

function luminancia(hex) {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ratio entre 1 (sin contraste) y 21 (negro sobre blanco). */
export function contraste(hexA, hexB) {
  const [claro, oscuro] = [luminancia(hexA), luminancia(hexB)].sort((a, b) => b - a);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** El color de texto (blanco o casi negro) que mejor se lee sobre `fondo`. */
export function textoLegibleSobre(fondo) {
  const blanco = '#ffffff';
  const oscuro = '#111111';
  return contraste(blanco, fondo) >= contraste(oscuro, fondo) ? blanco : oscuro;
}
