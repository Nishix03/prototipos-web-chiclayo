// Componentes propios del spa. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { cabecera, portada } from './portada.js';
import { servicios, paquetes } from './servicios.js';
import { cita } from './cita.js';
import { comparador, equipo, horario } from './extras.js';

export const componentes = {
  cabecera,
  portada,
  servicios,
  paquetes,
  cita,
  comparador,
  equipo,
  horario,
};
