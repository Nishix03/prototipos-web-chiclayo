// Video del recorrido de un rubro (paso 5 del brief: hero vivo), a 360 y 1440 px, sobre la
// versión de producción: portada, scroll hasta la función estrella y la acción estrella.
//
//   npm run build && node scripts/video.mjs restaurante
//
// Con la variable FFMPEG=<ruta a ffmpeg> deja MP4 livianos (H.264); si no, WebM.
// Se graba en Chromium sin GPU: el 3D se dibuja por software y se ve con menos cuadros.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const raiz = resolve(import.meta.dirname, '..');
const rubro = process.argv[2];
const config = JSON.parse(readFileSync(resolve(raiz, rubro, 'control.json'), 'utf8'));
const salida = resolve(raiz, 'docs/visual/control', rubro);
const temporal = resolve(salida, 'tmp-video');
mkdirSync(temporal, { recursive: true });

const servidor = await preview({
  root: raiz,
  logLevel: 'error',
  preview: { port: 4199, strictPort: true },
});
const url = `${servidor.resolvedUrls.local[0]}${rubro}/?3d=forzar`;
const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

for (const [ancho, alto] of [
  [360, 780],
  [1440, 900],
]) {
  const ctx = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    timezoneId: 'America/Lima',
    locale: 'es-PE',
    recordVideo: { dir: temporal, size: { width: ancho, height: alto } },
  });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-11-03T13:00:00-05:00') });
  await p.clock.resume();
  await p.route('**/maps.google.com/**', (r) => r.abort());
  await p.goto(url);
  await p.waitForSelector('[data-escena][data-viva]', { timeout: 60_000 }).catch(() => {});
  await p.waitForTimeout(1500);
  // Scroll suave hasta la función estrella: la escena cambia en el camino
  const destino = await p.evaluate((sel) => document.querySelector(sel).offsetTop, config.seccion);
  for (let i = 1; i <= 40; i++) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), (destino * i) / 40);
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(1200);
  for (const sel of config.clics ?? []) {
    await p.locator(sel).first().click();
    await p.waitForTimeout(700);
  }
  if (config.abrir) {
    await p.locator(config.abrir).click();
    await p.waitForTimeout(1500);
  }
  if (config.final) {
    await p.locator(config.final).click();
    await p.waitForTimeout(1500);
  }
  const archivo = await p.video().path();
  await ctx.close();
  renameSync(archivo, resolve(salida, `recorrido-${ancho}.webm`));
}
await navegador.close();
await servidor.close();
rmSync(temporal, { recursive: true, force: true });

if (process.env.FFMPEG) {
  for (const ancho of [360, 1440]) {
    const webm = resolve(salida, `recorrido-${ancho}.webm`);
    execFileSync(process.env.FFMPEG, [
      '-y',
      '-loglevel',
      'error',
      '-i',
      webm,
      '-c:v',
      'libx264',
      '-crf',
      '30',
      '-preset',
      'slow',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      resolve(salida, `recorrido-${ancho}.mp4`),
    ]);
    rmSync(webm);
  }
}
console.log(
  readdirSync(salida)
    .filter((f) => f.startsWith('recorrido'))
    .join(', '),
);
