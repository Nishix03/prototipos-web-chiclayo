// Storyboard de 3 cuadros por dirección (inicio, mitad del scroll, función estrella) a 360 y
// 1440 px, con el 3D renderizado, y el Control de exigencias medido sobre las mismas páginas.
//   node docs/visual/restaurante-cocina-abierta/storyboard.mjs [a b c]
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const aqui = import.meta.dirname;
const direcciones = process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c'];
const ANCHOS = { 360: 780, 1440: 900 };
const salida = resolve(aqui, 'storyboard');
mkdirSync(salida, { recursive: true });

const servidor = await createServer({
  configFile: resolve(aqui, 'vite.config.js'),
  logLevel: 'error',
});
await servidor.listen();
const base = servidor.resolvedUrls.local[0];
const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

// Mide las exigencias 1, 2, 3 y 5 en la página abierta (4 y 3 «coherente» se juzgan con la captura)
function medir() {
  const vp = { w: innerWidth, h: innerHeight };
  const dentro = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return (
      r.width > 0 &&
      r.top >= 0 &&
      r.bottom <= vp.h &&
      r.left >= 0 &&
      r.right <= vp.w &&
      s.visibility !== 'hidden'
    );
  };
  const h1 = document.querySelector('h1');
  const lineas = (el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.getBoundingClientRect().height / lh);
  };
  const palabras = (t) => t.trim().split(/\s+/).length;
  const estado = document.querySelector('[data-estado]');
  const linkHorario = document.querySelector('a[href="#horario"]');
  const estrella = document.querySelector('a[href="#carta"], [data-estrella]');
  const negocio = document.querySelector('[translate="no"]');
  const canvas = document.querySelector('.escena canvas').getBoundingClientRect();
  const portada = document.querySelector('.portada, [data-portada]');
  const caja = portada
    .querySelector('h1')
    .closest('article, div, header, section')
    .getBoundingClientRect();
  const fuente = (sel) => getComputedStyle(document.querySelector(sel)).fontFamily.split(',')[0];
  return {
    e1: {
      nombre: dentro(negocio),
      titular: dentro(h1),
      estado: dentro(estado) && /hoy|abre/.test(estado.textContent),
      enlaceHorario: dentro(linkHorario),
      estrella: dentro(estrella),
    },
    e2: {
      palabrasTitular: palabras(h1.textContent),
      lineasTitular: lineas(h1),
      titulosSeccion: [...document.querySelectorAll('h2')].map((h) => [
        h.textContent.trim(),
        palabras(h.textContent),
      ]),
    },
    e3: {
      escenaCubrePantalla: Math.round(((canvas.width * canvas.height) / (vp.w * vp.h)) * 100),
      // la interfaz vive dentro de la escena: el bloque del titular está encima del canvas, no al lado
      interfazSobreEscena: caja.left >= canvas.left && caja.right <= canvas.right,
    },
    e5: {
      titulosPortada: fuente('h1'),
      titulosSecciones: fuente('h2'),
      texto: getComputedStyle(document.body).fontFamily.split(',')[0],
    },
  };
}

const control = {};
for (const d of direcciones) {
  control[d] = {};
  for (const [ancho, alto] of Object.entries(ANCHOS)) {
    const ctx = await navegador.newContext({
      viewport: { width: Number(ancho), height: alto },
      deviceScaleFactor: 1,
    });
    const p = await ctx.newPage();
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    await p.goto(`${base}${d}/`);
    await p.waitForFunction(() => window.__escena, null, { timeout: 60000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1200);
    control[d][ancho] = await p.evaluate(medir);
    await p.screenshot({ path: `${salida}/${d}-1-inicio-${ancho}.png` });

    // Mitad del recorrido: los ingredientes a medio ordenar
    await p.evaluate(() => {
      const carta = document.querySelector('#carta');
      scrollTo(0, (carta.offsetTop - innerHeight * 0.25) * 0.5);
      window.__escena.fijar(0.5);
    });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${salida}/${d}-2-mitad-${ancho}.png` });

    // Función estrella: carta formada y la comanda imprimiéndose
    await p.evaluate(() => {
      document.querySelector('#carta').scrollIntoView();
      window.__escena.fijar(1);
    });
    await p.waitForTimeout(500);
    for (const id of ['arroz-con-pato', 'ceviche', 'chicha-morada']) {
      await p.locator(`[data-agregar="${id}"]`).click();
      await p.waitForTimeout(120);
    }
    await p.evaluate(() => {
      document.querySelector('#carta').scrollIntoView({ block: 'start' });
      window.__escena.fijar(1);
    });
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${salida}/${d}-3-estrella-${ancho}.png` });
    if (errores.length) console.log(`errores ${d} ${ancho}:`, errores);
    await ctx.close();
  }
  console.log(d, JSON.stringify(control[d], null, 1));
}
writeFileSync(resolve(salida, 'control.json'), JSON.stringify(control, null, 2));
await navegador.close();
await servidor.close();
