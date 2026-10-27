// Componentes propios de la veterinaria. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { urgencias, cabecera, portada } from './portada.js';
import { servicios, vacunas, cita, equipo, consejos, horario } from './secciones.js';

export const componentes = {
  urgencias,
  cabecera,
  portada,
  servicios,
  vacunas,
  cita,
  equipo,
  consejos,
  horario,
};
