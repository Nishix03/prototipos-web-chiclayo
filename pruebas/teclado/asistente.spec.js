// Prueba E2E de la simulación del asistente virtual (ADR 013), en el spa: se abre y se usa solo
// con teclado, siempre dice que es una simulación y no tiene campo de texto.
import { test, expect } from '@playwright/test';
import { fijarHora } from './ayudas.js';

const URL = 'spa/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

test('se abre con teclado, rotula la simulación, responde fijo y Esc devuelve el foco', async ({
  page,
}) => {
  await page.goto(URL);
  // El botón nace oculto y aparece cuando el script, que llega con la página libre, está listo
  const abrir = page.locator('[data-asistente-abrir]');
  await expect(abrir).toBeVisible();
  await abrir.focus();
  await page.keyboard.press('Enter');

  const dialogo = page.locator('dialog[data-asistente]');
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText('Simulación · asistente virtual (próximamente)');

  // Una pregunta con teclado: la respuesta es siempre la misma, escrita de antemano
  const chip = dialogo.locator('[data-chip="0"]');
  await chip.focus();
  await page.keyboard.press('Enter');
  const respuesta = dialogo.locator('[data-respuesta="0"]');
  await expect(respuesta).toBeVisible();
  await expect(respuesta).toContainText('Dura 60 minutos y cuesta S/ 90');
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  // El rótulo sigue a la vista después de preguntar
  await expect(dialogo).toContainText('Simulación · asistente virtual (próximamente)');

  // El enlace a WhatsApp es el del negocio
  await expect(dialogo.getByRole('link', { name: 'Escribir por WhatsApp' })).toHaveAttribute(
    'href',
    /wa\.me\/51995258351/,
  );

  // Esc cierra el diálogo y el foco vuelve al botón que lo abrió
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(abrir).toBeFocused();
});

test('no hay campo de texto: la simulación no puede responder a lo que se escriba', async ({
  page,
}) => {
  await page.goto(URL);
  await expect(page.locator('[data-asistente-abrir]')).toBeVisible();
  await expect(page.locator('dialog[data-asistente] :is(input, textarea)')).toHaveCount(0);
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no se muestra un botón que no haría nada', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('[data-asistente-abrir]')).toBeHidden();
  });
});
