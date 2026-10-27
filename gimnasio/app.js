// Mejoras en el navegador para el gimnasio. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { avanceHasta, iniciarEscena } from '../core/escena-cliente.js';
import { iniciarClases, iniciarPromocion, iniciarImc } from './clases-cliente.js';

seguro('clases', iniciarClases);
seguro('promoción', iniciarPromocion);
seguro('IMC', iniciarImc);
seguro('escena', () =>
  iniciarEscena({
    escena: () => import('./escena/montar.js'),
    coreografias: () => import('./escena/coreografias.js'),
    avance: avanceHasta('#prueba'),
    posters: [
      ['pulso', 1440, 900],
      ['pulso-movil', 900, 1948],
    ],
  }),
);
iniciarNucleo();
