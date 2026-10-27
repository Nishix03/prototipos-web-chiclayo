// Junta los 9 cuadros de un ancho en una sola imagen (filas: direcciones; columnas: cuadros)
//   node docs/visual/restaurante-cocina-abierta/hoja.mjs 1440 | 360
import { resolve } from 'node:path';
import sharp from 'sharp';

const aqui = import.meta.dirname;
const ancho = Number(process.argv[2] ?? 1440);
const escala = ancho === 1440 ? 0.33 : 0.6;
const cuadros = ['1-inicio', '2-mitad', '3-estrella'];
const dirs = ['a', 'b', 'c'];
const w = Math.round(ancho * escala);
const h = Math.round((ancho === 1440 ? 900 : 780) * escala);
const hueco = 12;
const piezas = [];
for (const [fila, d] of dirs.entries()) {
  for (const [col, c] of cuadros.entries()) {
    const img = await sharp(resolve(aqui, 'storyboard', `${d}-${c}-${ancho}.png`))
      .resize(w, h)
      .toBuffer();
    piezas.push({ input: img, left: col * (w + hueco), top: fila * (h + hueco) });
  }
}
await sharp({
  create: {
    width: 3 * w + 2 * hueco,
    height: 3 * h + 2 * hueco,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite(piezas)
  .png()
  .toFile(resolve(aqui, 'storyboard', `hoja-${ancho}.png`));
