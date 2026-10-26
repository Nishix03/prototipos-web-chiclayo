// Recorre la maqueta construida (build + preview) como lo haría una persona y deja:
//   - el video del recorrido a 360 y 1440 px (paso 5 del brief),
//   - capturas de cada estado,
//   - el resultado de Axe con 3D y con movimiento reducido.
//   npm run maqueta:build && node docs/visual/restaurante-inmersivo/grabar.mjs
// Con FFMPEG=<ruta a ffmpeg>, además deja el video en MP4 liviano (H.264) y borra el .webm.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const aqui = import.meta.dirname;
const salida = resolve(aqui, 'capturas');
const videos = resolve(aqui, 'video');
mkdirSync(salida, { recursive: true });
mkdirSync(videos, { recursive: true });
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const servidor = await preview({ configFile: resolve(aqui, 'vite.config.js'), logLevel: 'error' });
const url = servidor.resolvedUrls.local[0];
const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function auditar(pagina, nombre) {
  await pagina.addScriptTag({ content: axe });
  const r = await pagina.evaluate(() =>
    window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }),
  );
  const v = r.violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes[0].target}`);
  console.log(`axe ${nombre}: ${v.length ? v.join(' | ') : '0 violaciones'}`);
}

async function suave(pagina, hasta, pasos = 24) {
  const desde = await pagina.evaluate(() => scrollY);
  for (let i = 1; i <= pasos; i++) {
    await pagina.evaluate((y) => scrollTo(0, y), desde + ((hasta - desde) * i) / pasos);
    await pagina.waitForTimeout(70);
  }
}

for (const ancho of [360, 1440]) {
  const alto = ancho === 360 ? 780 : 900;
  const ctx = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    hasTouch: ancho === 360,
    recordVideo: { dir: videos, size: { width: ancho, height: alto } },
  });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  await p.goto(`${url}?3d=forzar`);
  await p.waitForSelector('[data-olla][data-viva]', { timeout: 30000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${salida}/hero-${ancho}.png` });
  const cta = await p.locator('.portada .boton--principal').boundingBox();
  console.log(
    `«Armar mi pedido» a ${ancho}: termina en y=${Math.round(cta.y + cta.height)} de ${alto} → ${cta.y + cta.height <= alto ? 'en la primera pantalla' : 'BAJO EL PLIEGUE'}`,
  );
  // La brasa se aviva con el cursor (solo en escritorio)
  if (ancho === 1440) {
    const caja = await p.locator('[data-olla]').boundingBox();
    for (let i = 0; i <= 20; i++) {
      await p.mouse.move(caja.x + caja.width * (0.2 + i * 0.03), caja.y + caja.height * 0.75);
      await p.waitForTimeout(40);
    }
  }
  // Coreografía 1: la olla gira y la cámara se acerca
  const portada = await p.locator('[data-portada]').evaluate((el) => el.offsetHeight);
  await suave(p, portada * 0.6, 30);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${salida}/giro-${ancho}.png` });
  // Coreografías 2 y 3: título que se arma y capas de la pizarra
  await suave(p, await p.locator('#menu-del-dia').evaluate((el) => el.offsetTop - 40), 24);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${salida}/menu-${ancho}.png` });
  await suave(p, await p.locator('#carta').evaluate((el) => el.offsetTop - 20), 24);
  await p.waitForTimeout(900);
  // Función estrella: los platos caen a la barra
  for (const id of ['arroz-con-pato', 'cabrito', 'arroz-con-pato']) {
    await p.locator(`[data-plato="${id}"] [data-agregar]`).click();
    await p.waitForTimeout(700);
  }
  await p.screenshot({ path: `${salida}/carta-${ancho}.png` });
  // La barra se convierte en la comanda y el ticket se imprime
  await p.locator('[data-abrir-comanda]').click();
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${salida}/comanda-${ancho}.png` });
  await auditar(p, `${ancho} con 3D, comanda abierta`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(700);
  await auditar(p, `${ancho} con 3D, carta`);
  if (errores.length) console.log(`errores de página ${ancho}:`, errores);
  const video = await p.video().path();
  await ctx.close();
  renameSync(video, resolve(videos, `recorrido-${ancho}.webm`));

  // Movimiento reducido: póster fijo, nada se anima, el contenido igual
  const quieto = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    reducedMotion: 'reduce',
  });
  const q = await quieto.newPage();
  await q.goto(url);
  await q.waitForTimeout(2500);
  const hay3d = await q.locator('[data-olla] canvas').count();
  console.log(`movimiento reducido ${ancho}: canvas=${hay3d} (debe ser 0)`);
  await q.screenshot({ path: `${salida}/reducido-${ancho}.png`, fullPage: true });
  await auditar(q, `${ancho} movimiento reducido, página completa`);
  await quieto.close();
}

await navegador.close();
await servidor.close();
// Videos sueltos con nombre aleatorio que Playwright pudo dejar
for (const f of readdirSync(videos)) if (!f.startsWith('recorrido-')) rmSync(resolve(videos, f));
if (process.env.FFMPEG) {
  for (const ancho of [360, 1440]) {
    const webm = resolve(videos, `recorrido-${ancho}.webm`);
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
      resolve(videos, `recorrido-${ancho}.mp4`),
    ]);
    rmSync(webm);
  }
}
