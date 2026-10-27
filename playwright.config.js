// Pruebas end-to-end (ADR 006): Playwright abre el sitio construido en un Chromium real
// y lo usa como una persona, solo con el teclado.
import { defineConfig, devices } from '@playwright/test';

const PUERTO = 4176;

export default defineConfig({
  testDir: 'pruebas',
  fullyParallel: true,
  // Cada página dibuja su escena 3D por software (Chromium sin GPU): con más de 4 navegadores
  // a la vez el CPU se satura y el teclado responde tarde. 4 mantiene las pruebas estables.
  workers: 4,
  // El pedido completo son ~150 pulsaciones con desplazamiento suave: 30 s no alcanzan con carga
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PUERTO}/prototipos-web-chiclayo/`,
    // Hora fija (un martes a las 13:00 en Lima) para que "abierto/cerrado" no dependa del reloj
    timezoneId: 'America/Lima',
    locale: 'es-PE',
  },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  // Sirve dist/ (lo construye "npm run test:teclado" antes de llamar a Playwright)
  webServer: {
    command: `npx vite preview --port ${PUERTO} --strictPort`,
    port: PUERTO,
    reuseExistingServer: !process.env.CI,
  },
});
