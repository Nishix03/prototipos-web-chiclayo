// Valida un negocio.json contra core/negocio.schema.json durante el build.
// El esquema es la única fuente de verdad: aquí no se repite ninguna regla de forma,
// solo se traducen los errores de ajv a mensajes en español que se entiendan.
// La única comprobación extra es el contraste de colores, que JSON Schema no puede expresar.

import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { contraste, textoLegibleSobre, CONTRASTE_MINIMO, CONTRASTE_NO_TEXTO } from './contraste.js';

const esquema = JSON.parse(readFileSync(new URL('./negocio.schema.json', import.meta.url), 'utf8'));

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validarEsquema = ajv.compile(esquema);

function traducir(error) {
  const p = error.params;
  switch (error.keyword) {
    case 'required':
      return `falta el campo obligatorio "${p.missingProperty}"`;
    case 'additionalProperties':
      return `campo desconocido "${p.additionalProperty}" (¿error de tipeo?)`;
    case 'type':
      return `debe ser de tipo ${p.type}`;
    case 'enum':
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
 * @returns {string[]}  lista de errores legibles; vacía si es válido
 */
export function validarNegocio(negocio) {
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
