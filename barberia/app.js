// Mejoras en el navegador para la barbería. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { avanceHasta, iniciarEscena } from '../core/escena-cliente.js';
import { iniciarTurno, iniciarFiltrosCortes } from './turno-cliente.js';

seguro('turno', iniciarTurno);
seguro('filtros de cortes', iniciarFiltrosCortes);
seguro('escena', () =>
  iniciarEscena({
    escena: () => import('./escena/montar.js'),
    coreografias: () => import('./escena/coreografias.js'),
    avance: avanceHasta('#turno'),
    posters: [
      ['filo', 1440, 900],
      ['filo-movil', 900, 1948],
    ],
  }),
);
iniciarNucleo();
