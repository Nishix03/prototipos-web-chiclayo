// Valida un negocio.json contra core/negocio.schema.json durante el build.
// El esquema es la única fuente de verdad: aquí no se repite ninguna regla de forma,
// solo se traducen los errores de ajv a mensajes en español que se entiendan.
// La única comprobación extra es el contraste de colores, que JSON Schema no puede expresar.

import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { contraste, CONTRASTE_MINIMO } from './contraste.js';

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

  const errores = [];
  const { fondo, texto } = negocio.tema;
  const ratio = contraste(texto, fondo);
  if (ratio < CONTRASTE_MINIMO) {
    errores.push(
      `/tema: el texto ${texto} sobre el fondo ${fondo} tiene contraste ${ratio.toFixed(2)}:1; ` +
        `WCAG AA pide al menos ${CONTRASTE_MINIMO}:1`,
    );
  }
  return errores;
}
