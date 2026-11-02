// Llega con import() solo si el dispositivo puede con el 3D (ADR 008).
import { montarEscena } from '../../core/escena3d.js';
import { crearFilo } from './filo.js';

export function montar(contenedor, avance, opciones) {
  return montarEscena(contenedor, crearFilo(), avance, opciones);
}
