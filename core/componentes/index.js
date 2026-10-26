// Registro de componentes: el nombre que se escribe en el HTML → la función que lo genera.
// <!-- @componente galeria --> en un index.html llama a galeria(negocio).
// Los rubros podrán sumar los suyos (carta, servicios…) en la fase 2.

import { hero } from './hero.js';
import { galeria } from './galeria.js';
import { resenas } from './resenas.js';
import { mapa } from './mapa.js';
import { footer } from './footer.js';
import { botonFlotante } from './boton-flotante.js';

export const componentes = {
  hero,
  galeria,
  resenas,
  mapa,
  footer,
  'boton-flotante': botonFlotante,
};

export { avisoDemo } from './aviso-demo.js';
