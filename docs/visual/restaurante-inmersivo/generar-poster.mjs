// Genera el póster (LCP) desde la misma escena 3D y verifica el presupuesto del ADR 008:
// cada tamaño del póster no puede pesar más que la foto actual del hero en ese tamaño.
//   node docs/visual/restaurante-inmersivo/generar-poster.mjs
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { createServer } from 'vite';

const aqui = import.meta.dirname;
const repo = resolve(aqui, '../../..');
// Tamaño del póster → foto de la v1 con la que compite
const PRESUPUESTO = { 640: 'hero-640.webp', 960: 'hero-960.webp', 1280: 'hero.webp' };

const servidor = await createServer({
  configFile: resolve(aqui, 'vite.config.js'),
  logLevel: 'error',
});
await servidor.listen();
const url = servidor.resolvedUrls.local[0];

const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
await pagina.goto(`${url}?poster`);
const datos = await pagina.waitForFunction(() => window.__poster, null, { timeout: 60000 });
const { png: dataUrl, fondo } = await datos.jsonValue(); // fondo = --color-fondo de la página
const png = Buffer.from(dataUrl.split(',')[1], 'base64');
await navegador.close();
await servidor.close();

// --vista <archivo.png>: el póster sobre el fondo adobe, para revisarlo a ojo
const vista = process.argv.indexOf('--vista');
if (vista > 0)
  await sharp(png)
    .flatten({ background: fondo })
    .resize(640)
    .toFile(process.argv[vista + 1]);

let excedido = false;
for (const [lado, foto] of Object.entries(PRESUPUESTO)) {
  const salida = resolve(aqui, 'poster', `olla-${lado}.webp`);
  await sharp(png)
    .resize(Number(lado))
    .flatten({ background: fondo })
    .webp({ quality: 72, effort: 6, smartSubsample: true })
    .toFile(salida);
  const peso = statSync(salida).size;
  const limite = statSync(resolve(repo, 'restaurante/img', foto)).size;
  const ok = peso <= limite;
  excedido ||= !ok;
  console.log(
    `${ok ? '✔' : '✘'} olla-${lado}.webp: ${(peso / 1024).toFixed(1)} KB (límite ${(limite / 1024).toFixed(1)} KB, ${foto})`,
  );
}
if (excedido) {
  console.error(
    '\n✘ El póster pesa más que la foto actual: baja la calidad o simplifica la escena (ADR 008).\n',
  );
  process.exit(1);
}
