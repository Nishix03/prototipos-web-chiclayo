// Imagen fija (LCP) de la escena 3D de un rubro, renderizada desde la misma escena (ADR 008).
//
//   node scripts/poster.js restaurante
//
// Abre la página del rubro con ?poster en un Chromium sin interfaz; la página dibuja la escena
// quieta en sus encuadres y los deja en window.__posters. Aquí se convierten a WebP en varios
// anchos y se verifica el presupuesto: ninguna pesa más que la foto de portada de la v1 del
// restaurante en ese ancho (35 KB hasta 640 px, 60 KB hasta 960 px, 111 KB más grande).
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { createServer } from 'vite';

const raiz = resolve(import.meta.dirname, '..');
const rubro = process.argv[2];
if (!rubro) {
  console.error('Uso: node scripts/poster.js <carpeta-del-rubro>');
  process.exit(1);
}

const ANCHOS = { horizontal: [1440, 960], vertical: [900, 600] };
const limite = (ancho) => (ancho <= 640 ? 35 : ancho <= 960 ? 60 : 111) * 1024;

const servidor = await createServer({ root: raiz, logLevel: 'error', server: { port: 5190 } });
await servidor.listen();
const url = new URL(`${rubro}/?poster`, servidor.resolvedUrls.local[0]).href;

const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const pagina = await navegador.newPage();
const errores = [];
pagina.on('pageerror', (e) => errores.push(e.message));
await pagina.goto(url);
const datos = await pagina
  .waitForFunction(() => window.__posters, null, { timeout: 90_000 })
  .catch(() => null);
const posters = datos ? await datos.jsonValue() : null;
await navegador.close();
await servidor.close();
if (!posters) {
  console.error(`\n✘ La página no generó las imágenes fijas. ${errores.join(' | ')}\n`);
  process.exit(1);
}

let excedido = false;
for (const { nombre, fondo, png } of posters) {
  const imagen = Buffer.from(png.split(',')[1], 'base64');
  const { width, height } = await sharp(imagen).metadata();
  const anchos = width > height ? ANCHOS.horizontal : ANCHOS.vertical;
  for (const ancho of anchos) {
    const salida = resolve(raiz, rubro, 'img', `${nombre}-${ancho}.webp`);
    await sharp(imagen)
      .resize(ancho)
      .flatten({ background: fondo })
      .webp({ quality: 74, effort: 6, smartSubsample: true })
      .toFile(salida);
    const peso = statSync(salida).size;
    const ok = peso <= limite(ancho);
    excedido ||= !ok;
    console.log(
      `${ok ? '✔' : '✘'} ${rubro}/img/${nombre}-${ancho}.webp: ${(peso / 1024).toFixed(1)} KB (límite ${limite(ancho) / 1024} KB)`,
    );
  }
}
if (excedido) {
  console.error(
    '\n✘ Una imagen fija pesa más de lo permitido: baja la calidad o simplifica la escena (ADR 008).\n',
  );
  process.exit(1);
}
