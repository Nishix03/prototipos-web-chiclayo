import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { prerenderNegocio } from './core/render.js';

const raiz = import.meta.dirname;

// Multipágina: cada carpeta con index.html + negocio.json es una página.
// Crear un rubro nuevo = copiar _ejemplo/; no hay que tocar este archivo.
const paginas = Object.fromEntries(
  readdirSync(raiz, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(raiz, d.name, 'negocio.json')))
    .map((d) => [d.name, resolve(raiz, d.name, 'index.html')]),
);

export default defineConfig({
  // GitHub Pages sirve el repo en https://nishix03.github.io/prototipos-web-chiclayo/
  base: '/prototipos-web-chiclayo/',
  plugins: [
    prerenderNegocio({ sitio: 'https://nishix03.github.io' }),
    ViteImageOptimizer({
      webp: { quality: 80 },
      avif: { quality: 60 },
    }),
  ],
  build: {
    rollupOptions: {
      input: { inicio: resolve(raiz, 'index.html'), ...paginas },
    },
  },
});
