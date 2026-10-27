// Llega con import() solo si el dispositivo puede con el 3D (ADR 008).
import { montarEscena } from '../../core/escena3d.js';
import { crearPulso } from './pulso.js';

export function montar(contenedor, avance, opciones) {
  return montarEscena(contenedor, crearPulso(), avance, opciones);
}
