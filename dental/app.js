// Mejoras en el navegador para la clínica dental. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { avanceHasta, iniciarEscena } from '../core/escena-cliente.js';
import { iniciarCuestionario } from './cuestionario-cliente.js';

seguro('cuestionario', iniciarCuestionario);
seguro('escena', () =>
  iniciarEscena({
    escena: () => import('./escena/montar.js'),
    coreografias: () => import('./escena/coreografias.js'),
    // La sonrisa termina de ordenarse un poco antes de que el cuestionario llegue arriba
    avance: (
      (hasta) => () =>
        Math.min(1, hasta() * 1.35)
    )(avanceHasta('#cuestionario')),
    posters: [
      ['calma', 1440, 900],
      ['calma-movil', 900, 1948],
    ],
  }),
);
iniciarNucleo();
