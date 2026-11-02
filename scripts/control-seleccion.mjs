// Graba elecciones reales en las seis marcas y conserva capturas por ronda.
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fijarHora } from '../pruebas/teclado/ayudas.js';

const ronda = process.argv[2] ?? 'selecciones-2026-11-02';
if (!/^[a-z0-9-]+$/.test(ronda)) throw new Error('Nombre de ronda no válido.');
const salida = `docs/visual/rondas/${ronda}`;
mkdirSync(salida, { recursive: true });
const server = await preview({ preview: { host: '127.0.0.1', port: 4210 }, logLevel: 'error' });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const contexto = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: `${salida}/video`, size: { width: 1440, height: 900 } },
  reducedMotion: 'no-preference',
});
const pagina = await contexto.newPage();
await fijarHora(pagina);
const control = {};

async function desplegable(p, selector) {
  const campo = p.locator(selector);
  await campo.locator('..').scrollIntoViewIfNeeded();
  await p.waitForTimeout(450);
  const valor = await campo.locator('option:not([disabled])').last().getAttribute('value');
  await campo.selectOption(valor);
  await p.waitForTimeout(400);
}

async function recorrer(p, rubro, ancho) {
  await p.goto(`${server.resolvedUrls.local[0]}${rubro}/?3d=0`);
  await p.evaluate(() => document.fonts.ready);
  if (rubro !== 'dental' && rubro !== 'veterinaria') {
    const filtros = p.locator('[data-filtros]').first();
    await filtros.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1100);
    await filtros.locator('button').nth(1).click();
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${salida}/${rubro}-filtro-${ancho}.png` });
    await filtros.locator('button').first().click();
    await p.waitForTimeout(500);
  }
  if (rubro === 'restaurante') {
    await p.locator('[data-accion="agregar"]').first().click();
    await p.waitForTimeout(500);
    await p.locator('[data-abrir-comanda]').click();
    await p.waitForTimeout(600);
    await p.locator('input[name="entrega"]:not(:checked)').first().check();
    await p.waitForTimeout(400);
  } else if (rubro === 'barberia') {
    await p.locator('[data-elegir-barbero]').first().click();
    await p.waitForTimeout(700);
    await desplegable(p, '#turno-corte');
  } else if (rubro === 'spa') {
    await desplegable(p, '#cita-servicio');
    await p.locator('[data-siguiente]').first().click();
    await p.locator('#cita-dia').fill('2026-11-04');
    await p.locator('[data-fase="tarde"]').click();
    await p.waitForTimeout(400);
    await desplegable(p, '#cita-hora');
  } else if (rubro === 'dental') {
    for (const opcion of ['No me duele', 'No', 'Que estén más alineados']) {
      await p.getByRole('button', { name: opcion, exact: true }).click();
      await p.waitForTimeout(800);
    }
    await p.locator('[data-agendar]').click();
    await p.waitForTimeout(800);
    await p.locator('#evaluacion-motivo').locator('..').scrollIntoViewIfNeeded();
  } else if (rubro === 'gimnasio') {
    await p.locator('[data-guardar-sesion]').first().click();
    await p.waitForTimeout(450);
  } else {
    await desplegable(p, '#vacunas-especie');
    await p.locator('#vacunas-nacimiento').fill('2026-09-01');
    await p.locator('#vacunas-nacimiento').blur();
    await p.waitForTimeout(450);
  }
  await p.screenshot({ path: `${salida}/${rubro}-eleccion-${ancho}.png` });
  return p.evaluate(() => ({
    desborde: document.documentElement.scrollWidth > innerWidth,
    rotas: [...document.images]
      .filter((i) => i.complete && !i.naturalWidth)
      .map((i) => i.getAttribute('src')),
  }));
}

try {
  for (const rubro of ['restaurante', 'barberia', 'spa', 'dental', 'gimnasio', 'veterinaria']) {
    control[rubro] = {};
    for (const ancho of [1440, 360]) {
      const p =
        ancho === 1440
          ? pagina
          : await browser.newPage({
              viewport: { width: 360, height: 780 },
              reducedMotion: 'no-preference',
            });
      if (ancho !== 1440) await fijarHora(p);
      const errores = [];
      const registrar = (e) => errores.push(e.message);
      p.on('pageerror', registrar);
      await p.route('**/maps.google.com/**', (r) => r.abort());
      control[rubro][ancho] = { ...(await recorrer(p, rubro, ancho)), errores };
      p.off('pageerror', registrar);
      console.log(rubro, ancho, JSON.stringify(control[rubro][ancho]));
      if (ancho !== 1440) await p.close();
    }
  }
  writeFileSync(`${salida}/control.json`, JSON.stringify(control, null, 2));
} finally {
  const grabacion = pagina.video();
  await contexto.close();
  await grabacion.saveAs(`${salida}/selecciones-seis-marcas.webm`);
  await grabacion.delete();
  await browser.close();
  await server.close();
}
