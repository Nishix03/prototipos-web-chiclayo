// Mejoras en el navegador para el spa. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { avanceHasta, iniciarEscena } from '../core/escena-cliente.js';
import { iniciarCita, iniciarFiltrosServicios } from './cita-cliente.js';

seguro('cita', iniciarCita);
seguro('filtros de servicios', iniciarFiltrosServicios);
seguro('escena', () =>
  iniciarEscena({
    escena: () => import('./escena/montar.js'),
    coreografias: () => import('./escena/coreografias.js'),
    avance: avanceHasta('#cita'),
    posters: [
      ['agua', 1440, 900],
      ['agua-movil', 900, 1948],
    ],
  }),
);
iniciarNucleo();
