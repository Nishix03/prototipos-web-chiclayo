// Hoja de contactos del storyboard de un rubro: filas = variantes (a, b, c), columnas = los 3
// cuadros (inicio, mitad, función estrella). Lee las capturas de scripts/control.mjs.
//
//   node scripts/hoja.mjs barberia
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const raiz = resolve(import.meta.dirname, '..');
const rubro = process.argv[2];
const carpeta = resolve(raiz, 'docs/visual/control', rubro);
const cuadros = ['1-inicio', '2-mitad', '3-estrella'];
const variantes = ['a', 'b', 'c'].filter((v) => existsSync(resolve(carpeta, v)));

for (const [ancho, alto, escala] of [
  [1440, 900, 0.33],
  [360, 780, 0.6],
]) {
  const w = Math.round(ancho * escala);
  const h = Math.round(alto * escala);
  const hueco = 12;
  const piezas = [];
  for (const [fila, v] of variantes.entries()) {
    for (const [col, c] of cuadros.entries()) {
      const img = await sharp(resolve(carpeta, v, `${c}-${ancho}.png`))
        .resize(w, h)
        .toBuffer();
      piezas.push({ input: img, left: col * (w + hueco), top: fila * (h + hueco) });
    }
  }
  await sharp({
    create: {
      width: 3 * w + 2 * hueco,
      height: variantes.length * h + (variantes.length - 1) * hueco,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(piezas)
    .png()
    .toFile(resolve(carpeta, `hoja-${ancho}.png`));
}
console.log(`hojas de ${rubro}: ${variantes.join(', ')}`);
