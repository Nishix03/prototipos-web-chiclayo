// Mejoras en el navegador para la veterinaria. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { avanceHasta, iniciarEscena } from '../core/escena-cliente.js';
import { iniciarVacunas, iniciarCita } from './vacunas-cliente.js';

seguro('vacunas', iniciarVacunas);
seguro('cita', iniciarCita);
seguro('escena', () =>
  iniciarEscena({
    escena: () => import('./escena/montar.js'),
    coreografias: () => import('./escena/coreografias.js'),
    avance: avanceHasta('#vacunas'),
    posters: [
      ['juego', 1440, 900],
      ['juego-movil', 900, 1948],
    ],
  }),
);
iniciarNucleo();
