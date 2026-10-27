// Componentes propios de la clínica dental. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { cabecera, portada } from './portada.js';
import { cuestionario } from './cuestionario.js';
import { tratamientos, equipo, preguntas, evaluacion, horario } from './secciones.js';

export const componentes = {
  cabecera,
  portada,
  cuestionario,
  tratamientos,
  equipo,
  preguntas,
  evaluacion,
  horario,
};
