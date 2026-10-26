import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/',
      '.maqueta/',
      'graphify-out/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
    ],
  },
  js.configs.recommended,
  {
    // Código que corre en el navegador: los app.js de cada página y los módulos de core/
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Código que corre en Node: build, scripts y pruebas E2E
    files: [
      'vite.config.js',
      'eslint.config.js',
      'playwright.config.js',
      'core/render.js',
      'core/validar.js',
      'scripts/**',
      'pruebas/**',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // Herramientas de las maquetas: corren en Node y mandan código al navegador (page.evaluate)
    files: ['docs/visual/**/*.mjs', 'docs/visual/**/vite.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  // Siempre al final: apaga las reglas de estilo que ya resuelve Prettier
  prettier,
];
