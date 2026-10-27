// Componentes propios de la barbería. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { letrero, portada } from './portada.js';
import { cortes } from './cortes.js';
import { barberos } from './barberos.js';
import { turno } from './turno.js';
import { fidelidad, horario } from './extras.js';

export const componentes = { letrero, portada, cortes, barberos, turno, fidelidad, horario };
