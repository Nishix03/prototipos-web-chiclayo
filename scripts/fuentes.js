// Recorta las fuentes de un rubro a los caracteres del español y a los pesos que usa.
//
//   npm run fuentes
//
// Las fuentes de Fontsource traen todo el alfabeto latino (francés, alemán, nórdico…) y el
// rango completo de pesos y anchos. Aquí se quedan solo:
//   - los caracteres de ESPANOL: ASCII, tildes, ñ, ü, ¿, ¡ y la puntuación del texto;
//   - el tramo de cada eje variable que el CSS usa de verdad (por ejemplo, wght 500–900).
// Antes de escribir nada, revisa que cada carácter de negocio.json y de los componentes
// esté en el recorte: si falta uno, el script se detiene con un error en español.
//
// Las dos fuentes son SIL OFL 1.1 sin «Reserved Font Name»: se pueden recortar si la
// licencia viaja con ellas, por eso se copia junto a cada archivo.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import subsetFont from 'subset-font';

const raiz = resolve(import.meta.dirname, '..');
const fontsource = (paquete, archivo) =>
  resolve(raiz, 'node_modules/@fontsource-variable', paquete, archivo);

const ASCII = Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCodePoint(0x20 + i)).join(
  '',
);
// U+00A0 y U+202F: espacios duros que pone Intl entre «S/» y el monto.
// − × ©: símbolos de la interfaz (botón de cantidad, cerrar la comanda, pie de página).
const ESPACIOS_DUROS = String.fromCodePoint(0xa0, 0x202f);
export const ESPANOL = ASCII + 'ÁÉÍÓÚÜÑáéíóúüñ¿¡«»—–·…‘’“”•ºª°' + '−×©' + ESPACIOS_DUROS;

const FUENTES = [
  // Restaurante v2 «El pase»: Fraunces (titulares, blanda y con «wonk») + Figtree (texto)
  {
    carpeta: 'restaurante',
    paquete: 'fraunces',
    entrada: 'files/fraunces-latin-full-normal.woff2',
    salida: 'fraunces-titulos.woff2',
    ejes: { wght: { min: 600, max: 700 }, opsz: 72, SOFT: 100, WONK: 1 },
  },
  {
    carpeta: 'restaurante',
    paquete: 'figtree',
    entrada: 'files/figtree-latin-wght-normal.woff2',
    salida: 'figtree-texto.woff2',
    ejes: { wght: { min: 400, max: 700 } },
  },
  // Barbería «Filo» (dirección A «Espejo»): Big Shoulders Display + Manrope
  {
    carpeta: 'barberia',
    paquete: 'big-shoulders-display',
    entrada: 'files/big-shoulders-display-latin-wght-normal.woff2',
    salida: 'big-shoulders-titulos.woff2',
    ejes: { wght: { min: 700, max: 900 } },
  },
  {
    carpeta: 'barberia',
    paquete: 'manrope',
    entrada: 'files/manrope-latin-wght-normal.woff2',
    salida: 'manrope-texto.woff2',
    ejes: { wght: { min: 400, max: 700 } },
  },
];

function fallar(mensaje) {
  console.error(`\n✘ ${mensaje}\n`);
  process.exit(1);
}

// Texto que llega a la página: los datos del negocio y los componentes (núcleo y rubro)
function textoDeLaPagina(carpeta) {
  const archivos = [join(carpeta, 'negocio.json')];
  for (const dir of [join(carpeta, 'componentes'), 'core/componentes']) {
    for (const nombre of readdirSync(resolve(raiz, dir))) {
      if (nombre.endsWith('.js')) archivos.push(join(dir, nombre));
    }
  }
  // Los comentarios del código no llegan a la página: se quitan antes de revisar
  const sinComentarios = (texto) =>
    texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return archivos.map((a) => [a, sinComentarios(readFileSync(resolve(raiz, a), 'utf8'))]);
}

function revisarCobertura(carpeta) {
  const faltan = new Map();
  for (const [archivo, texto] of textoDeLaPagina(carpeta)) {
    for (const c of texto) {
      if (c === '\n' || c === '\r' || c === '\t' || ESPANOL.includes(c)) continue;
      if (!faltan.has(c)) faltan.set(c, archivo);
    }
  }
  if (faltan.size) {
    const lista = [...faltan]
      .map(
        ([c, archivo]) =>
          `  «${c}» (U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) en ${archivo}`,
      )
      .join('\n');
    fallar(
      `Estos caracteres de ${carpeta}/ no están en el recorte de fuentes y se verían con otra letra:\n${lista}\n` +
        `Agrégalos a ESPANOL en scripts/fuentes.js o cámbialos en el texto.`,
    );
  }
}

for (const carpeta of new Set(FUENTES.map((f) => f.carpeta))) revisarCobertura(carpeta);

for (const fuente of FUENTES) {
  const { carpeta, paquete, entrada, salida, ejes } = fuente;
  const original = readFileSync(fontsource(paquete, entrada));
  const recortada = await subsetFont(original, ESPANOL, {
    targetFormat: 'woff2',
    variationAxes: ejes,
  });
  // `destino` es opcional: por defecto, <carpeta>/fuentes
  const relativo = fuente.destino ?? join(carpeta, 'fuentes');
  const destino = resolve(raiz, relativo);
  mkdirSync(destino, { recursive: true });
  writeFileSync(join(destino, salida), recortada);
  copyFileSync(fontsource(paquete, 'LICENSE'), join(destino, `OFL-${paquete}.txt`));
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`✔ ${relativo}/${salida}: ${kb(original.length)} → ${kb(recortada.length)}`);
}
