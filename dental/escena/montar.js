// Llega con import() solo si el dispositivo puede con el 3D (ADR 008).
import { montarEscena } from '../../core/escena3d.js';
import { crearCalma } from './calma.js';

export function montar(contenedor, avance, opciones) {
  return montarEscena(contenedor, crearCalma(), avance, opciones);
}
