// Componentes propios del gimnasio. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { cabecera, portada } from './portada.js';
import { clases } from './clases.js';
import { planes, promocion, imc, entrenadores, prueba, horario } from './secciones.js';

export const componentes = {
  cabecera,
  portada,
  clases,
  planes,
  promocion,
  imc,
  entrenadores,
  prueba,
  horario,
};
