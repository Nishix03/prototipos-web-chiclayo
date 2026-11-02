// Hoja de contactos del storyboard de un rubro: filas = variantes (a, b, c), columnas = los 3
// cuadros (inicio, mitad, función estrella). Lee las capturas de scripts/control.mjs.
//
//   node scripts/hoja.mjs barberia
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const raiz = resolve(import.meta.dirname, '..');
const rubro = process.argv[2];
// Hoja comparativa de los seis rubros, guardada por ronda sin reemplazar las anteriores.
if (rubro === '--todos') {
  const ronda = process.argv[3] ?? 'rediseno-2026-11-01';
  if (!/^[a-z0-9-]+$/.test(ronda)) throw new Error('Nombre de ronda no válido.');
  const salida = resolve(raiz, 'docs/visual/rondas', ronda);
  mkdirSync(salida, { recursive: true });
  const rubros = ['spa', 'dental', 'barberia', 'gimnasio', 'veterinaria', 'restaurante'];
  for (const ancho of [360, 1440]) {
    const w = ancho === 360 ? 360 : 576;
    const h = ancho === 360 ? 780 : 360;
    const piezas = [];
    for (const [i, r] of rubros.entries()) {
      piezas.push({
        input: await sharp(resolve(salida, r, `1-inicio-${ancho}.png`))
          .resize(w, h)
          .toBuffer(),
        left: (i % 2) * w,
        top: Math.floor(i / 2) * (h + 32) + 32,
      });
      const etiqueta = Buffer.from(
        `<svg width="${w}" height="32"><rect width="100%" height="100%" fill="#fff"/><text x="12" y="22" font-family="Arial" font-size="16" fill="#222">${r}</text></svg>`,
      );
      piezas.push({ input: etiqueta, left: (i % 2) * w, top: Math.floor(i / 2) * (h + 32) });
    }
    await sharp({ create: { width: w * 2, height: (h + 32) * 3, channels: 3, background: '#fff' } })
      .composite(piezas)
      .png()
      .toFile(resolve(salida, `hoja-${ancho}.png`));
  }
  console.log(`Hojas comparativas: ${salida}`);
  process.exit(0);
}
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
