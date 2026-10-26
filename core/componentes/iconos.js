// Íconos SVG en línea: sin peticiones extra y heredan el color del texto (currentColor).
// Son decorativos: el texto o el aria-label del enlace ya dice qué hacen.

import { crudo } from './html.js';

const svg = (contenido) =>
  crudo(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${contenido}</svg>`,
  );

export const iconos = {
  chat: svg(
    '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9L3 20.5l1.5-4.5a8 8 0 0 1-1-4.5 8.5 8.5 0 0 1 17.5 0Z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
  ),
  ubicacion: svg(
    '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  ),
  reloj: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  telefono: svg(
    '<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
  ),
  estrella: crudo(
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9Z"/></svg>',
  ),
};
