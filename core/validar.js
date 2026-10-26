// Valida un negocio.json contra el rubro.schema.json de su carpeta durante el build.
// Ese esquema extiende core/negocio.schema.json (ADR 005). Los esquemas son la única fuente
// de verdad: aquí no se repite ninguna regla de forma, solo se traducen los errores de ajv
// a mensajes en español. La única comprobación extra es el contraste de colores, que
// JSON Schema no puede expresar.

import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { contraste, textoLegibleSobre, CONTRASTE_MINIMO, CONTRASTE_NO_TEXTO } from './contraste.js';

// URI ficticia que imita la estructura de carpetas, para que el $ref relativo
// "../core/negocio.schema.json" de cada rubro se resuelva igual que en VS Code.
const URI_RAIZ = 'https://prototipos.local/';
const archivoBase = new URL('./negocio.schema.json', import.meta.url);
const leerJson = (archivo) => JSON.parse(readFileSync(archivo, 'utf8'));

/** Compila el esquema de una página. Se compila en cada llamada para ver cambios en `npm run dev`. */
function compilar(archivoEsquema, raiz) {
  // verbose: incluye en cada error el valor que falló (para decir qué licencia se rechazó)
  const ajv = new Ajv2020({ allErrors: true, verbose: true });
  addFormats(ajv);
  ajv.addSchema(leerJson(archivoBase), `${URI_RAIZ}core/negocio.schema.json`);
  const ruta = relative(raiz, archivoEsquema).split('\\').join('/');
  return ajv.compile({ ...leerJson(archivoEsquema), $id: URI_RAIZ + ruta });
}

function traducir(error) {
  const p = error.params;
  switch (error.keyword) {
    case 'required':
      return `falta el campo obligatorio "${p.missingProperty}"`;
    case 'additionalProperties':
      return `campo desconocido "${p.additionalProperty}" (¿error de tipeo?)`;
    case 'unevaluatedProperties':
      return `campo desconocido "${p.unevaluatedProperty}" (¿error de tipeo o falta en rubro.schema.json?)`;
    case 'const':
      return `debe ser "${p.allowedValue}"`;
    case 'type':
      return `debe ser de tipo ${p.type}`;
    case 'enum':
      if (error.instancePath.endsWith('/credito/licencia')) {
        return (
          `licencia "${error.data}" no permitida en una web de negocio. ` +
          `Solo se aceptan: ${p.allowedValues.join(', ')}. ` +
          'Nada NC (no comercial) ni ND (sin derivadas): busca otra foto.'
        );
      }
      return `debe ser uno de: ${p.allowedValues.join(', ')}`;
    case 'pattern':
      return `no tiene el formato esperado (${p.pattern})`;
    case 'minLength':
      return `debe tener al menos ${p.limit} caracteres`;
    case 'maxLength':
      return `debe tener como máximo ${p.limit} caracteres`;
    case 'minItems':
      return `debe tener al menos ${p.limit} elementos`;
    case 'maxItems':
      return `debe tener como máximo ${p.limit} elementos`;
    case 'minimum':
    case 'maximum':
      return `debe ser ${error.keyword === 'minimum' ? '≥' : '≤'} ${p.limit}`;
    case 'format':
      return `no es un ${p.format} válido`;
    default:
      return error.message;
  }
}

/**
 * @param {unknown} negocio  contenido ya parseado de negocio.json
 * @param {string} archivoEsquema  ruta del rubro.schema.json de la página
 * @param {string} raiz  raíz del proyecto
 * @returns {string[]}  lista de errores legibles; vacía si es válido
 */
export function validarNegocio(negocio, archivoEsquema, raiz) {
  const validarEsquema = compilar(archivoEsquema, raiz);
  if (!validarEsquema(negocio)) {
    return validarEsquema.errors.map((e) => `${e.instancePath || '(raíz)'}: ${traducir(e)}`);
  }

  const { marca, fondo, texto } = negocio.tema;
  const pares = [
    // [descripción, color de texto, color de fondo, mínimo]
    ['el texto sobre el fondo', texto, fondo, CONTRASTE_MINIMO],
    ['el texto de los botones sobre la marca', textoLegibleSobre(marca), marca, CONTRASTE_MINIMO],
    ['el borde de foco (marca) sobre el fondo', marca, fondo, CONTRASTE_NO_TEXTO],
  ];
  return pares
    .map(([que, a, b, minimo]) => [que, a, b, minimo, contraste(a, b)])
    .filter(([, , , minimo, ratio]) => ratio < minimo)
    .map(
      ([que, a, b, minimo, ratio]) =>
        `/tema: ${que} (${a} / ${b}) tiene contraste ${ratio.toFixed(2)}:1; WCAG AA pide ${minimo}:1`,
    );
}
