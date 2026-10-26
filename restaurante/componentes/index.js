// Componentes propios del restaurante. render.js los suma a los del núcleo
// (y falla si alguno repite un nombre de core/componentes).

import { cabecera } from './cabecera.js';
import { portada } from './portada.js';
import { carta } from './carta.js';
import { comanda } from './comanda.js';
import { reservas } from './reservas.js';
import { elLocal } from './el-local.js';
import { qrCarta } from './qr-carta.js';

export const componentes = {
  cabecera,
  portada,
  carta,
  comanda,
  reservas,
  'el-local': elLocal,
  'qr-carta': qrCarta,
};
