// npm run a11y: audita con Axe (WCAG 2.1 A/AA + buenas prácticas) cada página construida.
//
// 1. Levanta `vite preview` sobre dist/ (npm run a11y construye antes).
// 2. Ejecuta @axe-core/cli sobre todas las carpetas con negocio.json.
// 3. Sale con código 1 si hay alguna violación, para que sirva como control antes de publicar.
//
// Axe necesita Chrome y un chromedriver de la misma versión. La primera vez, instalar con:
//   npx browser-driver-manager install chrome
// Eso deja las rutas en ~/.browser-driver-manager/.env, que este script lee solo.

import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { preview } from 'vite';

const raiz = resolve(import.meta.dirname, '..');
const ETIQUETAS = 'wcag2a,wcag2aa,wcag21a,wcag21aa,best-practice';

function cargarRutasChrome() {
  const archivo = join(homedir(), '.browser-driver-manager', '.env');
  if (process.env.CHROME_TEST_PATH || !existsSync(archivo)) return;
  for (const linea of readFileSync(archivo, 'utf8').split('\n')) {
    const [, clave, valor] = linea.match(/^(\w+)="?([^"]*)"?$/) ?? [];
    if (clave) process.env[clave] = valor;
  }
}

const paginas = readdirSync(raiz, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(raiz, d.name, 'negocio.json')))
  .map((d) => d.name);

cargarRutasChrome();
const servidor = await preview({ root: raiz, preview: { port: 4180, strictPort: false } });
const base = servidor.resolvedUrls.local[0];
const urls = paginas.map((p) => new URL(`${p}/`, base).href);

console.log(`Auditando con Axe (${ETIQUETAS}):\n  ${urls.join('\n  ')}\n`);

const axe = spawn(
  join(raiz, 'node_modules', '.bin', 'axe'),
  // Una URL por argumento: juntas con "," sin espacio, axe las toma como una sola
  [...urls, '--tags', ETIQUETAS, '--load-delay', '500', '--exit'],
  { stdio: 'inherit' },
);

axe.on('close', async (codigo) => {
  await servidor.close();
  process.exit(codigo ?? 1);
});
