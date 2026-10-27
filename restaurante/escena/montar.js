// Llega con import() solo si el dispositivo puede con el 3D (ver cliente.js y ADR 008).
// Junta el motor común (core/escena3d.js) con la escena de este rubro.
import { montarEscena } from '../../core/escena3d.js';
import { pase } from './pase.js';

export const montar = (contenedor, avance, opciones) =>
  montarEscena(contenedor, pase, avance, opciones);
