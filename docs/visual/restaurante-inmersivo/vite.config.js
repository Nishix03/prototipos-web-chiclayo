// Maqueta del hero vivo: se sirve y se construye aparte del sitio, para medirla con Lighthouse
// igual que una página real (build + preview) sin meterla en dist/ ni en GitHub Pages.
//   npm run maqueta            → servidor de desarrollo
//   npm run maqueta:build      → construye en .maqueta/ (ignorado por git)
//   npm run maqueta:preview    → sirve esa versión de producción
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const aqui = import.meta.dirname;
const repo = resolve(aqui, '../../..');

export default defineConfig({
  root: aqui,
  base: './',
  server: { port: 5180, host: true, strictPort: true, fs: { allow: [repo] } },
  preview: { port: 5181, host: true, strictPort: true }, // todas las interfaces: se abre desde Windows
  build: { outDir: resolve(repo, '.maqueta'), emptyOutDir: true },
});
