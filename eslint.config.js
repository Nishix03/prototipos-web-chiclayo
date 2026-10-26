import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'graphify-out/', 'node_modules/'] },
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
    // Código que corre en Node durante el build
    files: [
      'vite.config.js',
      'eslint.config.js',
      'core/render.js',
      'core/validar.js',
      'scripts/**',
    ],
    languageOptions: { globals: globals.node },
  },
  // Siempre al final: apaga las reglas de estilo que ya resuelve Prettier
  prettier,
];
