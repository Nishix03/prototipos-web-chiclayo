// Control de exigencias (ADR 009) sobre la página construida de un rubro, a 360×780 y 1440×900:
// mide las exigencias 1, 2, 3 (cobertura de la escena) y 5, y captura los 3 cuadros
// (inicio, mitad del scroll, función estrella) con el 3D renderizado como prueba.
//
//   npm run build && node scripts/control.mjs restaurante [a|b|c]
// Con una variante (paso 2: storyboard), abre ?direccion=<variante> y guarda en <rubro>/<variante>/.
//
// La función estrella de cada rubro se describe en <rubro>/control.json:
//   { "seccion": "#carta", "clics": ["selector", ...], "abrir": "selector opcional" }
// Sale con código 1 si algún punto medible falla.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { preview } from 'vite';

const raiz = resolve(import.meta.dirname, '..');
const [rubro, variante] = process.argv.slice(2);
const config = JSON.parse(readFileSync(resolve(raiz, rubro, 'control.json'), 'utf8'));
const salida = resolve(raiz, 'docs/visual/control', rubro, variante ?? '');
mkdirSync(salida, { recursive: true });

const ANCHOS = { 360: 780, 1440: 900 };
const servidor = await preview({
  root: raiz,
  logLevel: 'error',
  preview: { port: 4198, strictPort: true },
});
const base = `${servidor.resolvedUrls.local[0]}${rubro}/?3d=forzar${variante ? `&direccion=${variante}` : ''}`;
const navegador = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

function medir() {
  const vp = { w: innerWidth, h: innerHeight };
  const visibleEnPantalla = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return (
      r.width > 0 &&
      r.top >= 0 &&
      r.bottom <= vp.h &&
      r.left >= -1 &&
      r.right <= vp.w + 1 &&
      s.visibility !== 'hidden'
    );
  };
  const palabras = (t) => t.trim().split(/\s+/).length;
  const h1 = document.querySelector('h1');
  const lh = parseFloat(getComputedStyle(h1).lineHeight);
  const estado = document.querySelector('[data-estado-texto]');
  const escena = document.querySelector('[data-escena]')?.getBoundingClientRect();
  const fuente = (el) => getComputedStyle(el).fontFamily.split(',')[0].replaceAll('"', '');
  const titulosSeccion = [...document.querySelectorAll('main h2')].map((h) => {
    const texto = (h.querySelector('.solo-lector')?.textContent ?? h.textContent).trim();
    return [texto, palabras(texto)];
  });
  return {
    e1: {
      nombre: visibleEnPantalla(
        document.querySelector('main [translate="no"], header [translate="no"]'),
      ),
      titular: visibleEnPantalla(h1),
      estadoConHorarioDeHoy: visibleEnPantalla(estado) && /hoy|abre/.test(estado.textContent),
      enlaceAlHorario: visibleEnPantalla(document.querySelector('a[href="#horario"]')),
      funcionEstrella: visibleEnPantalla(
        document.querySelector('[data-estrella], main a[href="#carta"]'),
      ),
    },
    e2: {
      palabrasTitular: palabras(h1.textContent),
      lineasTitular: Math.round(h1.getBoundingClientRect().height / lh),
      maxPalabrasSeccion: Math.max(...titulosSeccion.map(([, n]) => n)),
      titulosSeccion,
    },
    e3: {
      escenaCubrePantalla: escena
        ? Math.round(((escena.width * escena.height) / (vp.w * vp.h)) * 100)
        : 0,
      escenaViva: !!document.querySelector('[data-escena][data-viva] canvas'),
    },
    e5: {
      titular: fuente(h1),
      titulosSeccion: [...new Set([...document.querySelectorAll('main h2')].map(fuente))],
      texto: fuente(document.body),
    },
  };
}

const control = {};
let falla = false;
for (const [ancho, alto] of Object.entries(ANCHOS)) {
  const ctx = await navegador.newContext({
    viewport: { width: Number(ancho), height: alto },
    timezoneId: 'America/Lima',
    locale: 'es-PE',
  });
  const p = await ctx.newPage();
  // Martes 13:00 en Lima, con el reloj corriendo: GSAP mide el tiempo con Date.now(), y con
  // un reloj congelado sus animaciones se quedarían en el primer cuadro
  await p.clock.install({ time: new Date('2026-11-03T13:00:00-05:00') });
  await p.clock.resume();
  await p.route('**/maps.google.com/**', (r) => r.abort());
  await p.goto(base);
  await p.waitForSelector('[data-escena][data-viva]', { timeout: 60_000 }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const m = await p.evaluate(medir);
  control[ancho] = m;
  await p.screenshot({ path: `${salida}/1-inicio-${ancho}.png` });

  await p.evaluate((sel) => {
    const fin = document.querySelector(sel).offsetTop - innerHeight * 0.25;
    scrollTo({ top: fin * 0.5, behavior: 'instant' });
  }, config.seccion);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${salida}/2-mitad-${ancho}.png` });

  await p.evaluate(
    (sel) => document.querySelector(sel).scrollIntoView({ behavior: 'instant' }),
    config.seccion,
  );
  await p.waitForTimeout(1200);
  for (const sel of config.clics ?? []) {
    await p.locator(sel).first().click();
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(700);
  if (config.abrir) {
    await p.locator(config.abrir).click();
    await p.waitForTimeout(900);
  }
  await p.screenshot({ path: `${salida}/3-estrella-${ancho}.png` });
  await ctx.close();

  const max = Number(ancho) >= 1000 ? 2 : 3;
  const fallas = [
    ...Object.entries(m.e1)
      .filter(([, v]) => !v)
      .map(([k]) => `1 · ${k}`),
    ...(m.e2.palabrasTitular > 6 ? ['2 · titular de más de 6 palabras'] : []),
    ...(m.e2.lineasTitular > max
      ? [`2 · titular en ${m.e2.lineasTitular} líneas (máx. ${max})`]
      : []),
    ...(m.e2.maxPalabrasSeccion > 5 ? ['2 · título de sección de más de 5 palabras'] : []),
    ...(m.e3.escenaCubrePantalla < 95 ? ['3 · la escena no cubre la pantalla'] : []),
    ...(m.e5.titulosSeccion.length > 1 || m.e5.titulosSeccion[0] !== m.e5.titular
      ? ['5 · la portada y las secciones usan tipografías distintas']
      : []),
  ];
  console.log(
    `${ancho}px: ${fallas.length ? `✘ ${fallas.join(' | ')}` : '✔ pasa lo medible'} (3D vivo: ${m.e3.escenaViva})`,
  );
  falla ||= fallas.length > 0;
}
writeFileSync(resolve(salida, 'control.json'), JSON.stringify(control, null, 2));
await navegador.close();
await servidor.close();
process.exit(falla ? 1 : 0);
