// Prueba de teclado E2E de la barbería (ADR 006): la función estrella, el turno en la silla,
// solo con teclado, hasta el mensaje literal de WhatsApp.
import { test, expect } from '@playwright/test';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'barberia/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

test('Tab: saltar al turno, horario y «Pedir mi turno» al empezar, con foco visible', async ({
  page,
}) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 4);
  const textos = visitados.map((v) => v.texto);
  expect(textos[0]).toBe('Saltar al turno');
  expect(textos).toContain('Horario');
  expect(textos).toContain('Pedir mi turno');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    await esperarFocoVisible(page);
  }
});

test('«Pedir este corte» deja el corte elegido y lleva el foco al día', async ({ page }) => {
  await page.goto(URL);
  const pedir = page.locator('[data-pedir="low-fade"]');
  await tabularHasta(page, pedir);
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#turno-corte')).toHaveValue('low-fade');
  await expect(page.locator('#turno-dia')).toBeFocused();
});

test('el día filtra a los barberos: un miércoles no aparece Marco', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#turno-dia').fill('2026-11-04'); // miércoles
  await page.locator('#turno-dia').dispatchEvent('change');
  await expect(page.locator('#turno-barbero option[value="marco"]')).toBeDisabled();
  await expect(page.locator('#turno-barbero option[value="luis"]')).toBeEnabled();
  await expect(page.locator('#turno-barbero option[value="andres"]')).toBeEnabled();
});

test('turno completo con teclado: error claro y mensaje literal a WhatsApp', async ({ page }) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  const enviar = page.locator('#form-turno button[type="submit"]');
  await tabularHasta(page, enviar, { maximo: 120 });
  await page.keyboard.press('Enter');
  // Sin datos: el foco va al primer campo con error y el error está escrito junto a él
  await expect(page.locator('#turno-corte')).toBeFocused();
  await expect(page.locator('#turno-corte-error')).toHaveText('Completa este dato para continuar.');

  await page.locator('#turno-corte').selectOption('low-fade');
  await page.locator('#turno-dia').fill('2026-11-10'); // martes
  await page.locator('#turno-dia').dispatchEvent('change');
  await page.locator('#turno-barbero').selectOption('luis');
  await page.locator('#turno-hora').selectOption('16:30');
  await page.locator('#turno-nombre').fill('Cliente de prueba');
  await page.locator('#turno-nombre').press('Enter');

  await expect(page.locator('#form-turno .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu turno listo. Solo falta que lo envíes.',
  );
  // Texto literal: es lo que leerá el dueño. Intl separa «S/» del número con U+00A0.
  const esperado = [
    'Hola, quiero un turno:',
    '• Corte: Low fade (S/ 30, 40 min)',
    '• Día: 10/11/2026',
    '• Barbero: Luis (demo)',
    '• Hora: 16:30',
    '• Tu nombre: Cliente de prueba',
  ].join('\n');
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});

test('filtros de cortes con teclado, con el filtro en la URL', async ({ page }) => {
  await page.goto(URL);
  const degradados = page.locator('[data-filtro="degradado"]');
  await tabularHasta(page, degradados);
  await page.keyboard.press('Enter');
  await expect(degradados).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-corte="clasico"]')).toBeHidden();
  await expect(page.locator('[data-corte="low-fade"]')).toBeVisible();
  await expect(page).toHaveURL(/\?estilo=degradado/);
});
