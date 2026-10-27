// Storyboards de «La cocina abierta» (paso 2): 3 direcciones, cada una su página.
//   npm run storyboard → http://localhost:5182/a/  /b/  /c/
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const aqui = import.meta.dirname;
const repo = resolve(aqui, '../../..');

export default defineConfig({
  root: aqui,
  base: './',
  server: { port: 5182, host: true, strictPort: true, fs: { allow: [repo] } },
  preview: { port: 5183, host: true, strictPort: true },
  build: {
    outDir: resolve(repo, '.storyboard'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(['a', 'b', 'c'].map((d) => [d, resolve(aqui, d, 'index.html')])),
    },
  },
});
