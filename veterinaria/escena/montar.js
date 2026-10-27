// Llega con import() solo si el dispositivo puede con el 3D (ADR 008).
import { montarEscena } from '../../core/escena3d.js';
import { crearJuego } from './juego.js';

export function montar(contenedor, avance, opciones) {
  return montarEscena(contenedor, crearJuego(), avance, opciones);
}
