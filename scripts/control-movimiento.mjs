import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
// Capturas de interfaz sin WebGL y vídeo de las seis marcas, conservados por ronda.
// node scripts/control-movimiento.mjs movimiento-de-marca-2026-11-02
const ronda = process.argv[2] ?? 'movimiento-de-marca-2026-11-02';
if (!/^[a-z0-9-]+$/.test(ronda)) throw new Error('Nombre de ronda no válido.');
const salida = `docs/visual/rondas/${ronda}`;
mkdirSync(salida, { recursive: true });
const server = await preview({ preview: { host: '127.0.0.1', port: 4210 }, logLevel: 'error' });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const video = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: `${salida}/video`, size: { width: 1440, height: 900 } },
  reducedMotion: 'no-preference',
});
const pagina = await video.newPage();
const resumen = {};
try {
  await pagina.route('**/maps.google.com/**', (r) => r.abort());
  for (const rubro of ['restaurante', 'barberia', 'spa', 'dental', 'gimnasio', 'veterinaria']) {
    resumen[rubro] = {};
    for (const width of [1440, 360]) {
      const p =
        width === 1440
          ? pagina
          : await browser.newPage({
              viewport: { width, height: 780 },
              reducedMotion: 'no-preference',
            });
      const errores = [];
      p.on('pageerror', (e) => errores.push(e.message));
      await p.goto(`${server.resolvedUrls.local[0]}${rubro}/?3d=0`);
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(1250);
      await p.screenshot({ path: `${salida}/${rubro}-hero-${width}.png` });
      await p
        .locator('.editorial')
        .evaluate((e) => e.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await p.waitForTimeout(1600);
      await p.screenshot({ path: `${salida}/${rubro}-editorial-${width}.png` });
      const seccion = {
        restaurante: '#carta',
        barberia: '#cortes',
        spa: '#servicios',
        dental: '#tratamientos',
        gimnasio: '.disciplinas',
        veterinaria: '#servicios',
      }[rubro];
      await p
        .locator(seccion)
        .evaluate((e) => e.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `${salida}/${rubro}-servicios-${width}.png` });
      resumen[rubro][width] = await p.evaluate(() => ({
        desborde: document.documentElement.scrollWidth > innerWidth,
        rotas: [...document.images]
          .filter((i) => i.complete && !i.naturalWidth)
          .map((i) => i.getAttribute('src')),
      }));
      resumen[rubro][width].errores = errores;
      console.log(rubro, width, JSON.stringify(resumen[rubro][width]));
      if (width !== 1440) await p.close();
    }
  }
  writeFileSync(`${salida}/control.json`, JSON.stringify(resumen, null, 2));
} finally {
  const grabacion = pagina.video();
  await video.close();
  await grabacion.saveAs(`${salida}/recorrido-desktop.webm`);
  await grabacion.delete();
  await browser.close();
  await server.close();
}
