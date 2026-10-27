// Prueba de teclado E2E del spa (ADR 006): la función estrella, la cita en 3 pasos, solo con
// teclado, hasta el mensaje literal de WhatsApp.
import { test, expect } from '@playwright/test';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'spa/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

test('Tab: saltar a la cita, horario y «Armar mi cita» al empezar, con foco visible', async ({
  page,
}) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 4);
  const textos = visitados.map((v) => v.texto);
  expect(textos[0]).toBe('Saltar a la cita');
  expect(textos).toContain('Horario');
  expect(textos).toContain('Armar mi cita');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    await esperarFocoVisible(page);
  }
});

test('cita en 3 pasos con teclado: un paso a la vez, error claro y mensaje literal', async ({
  page,
}) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  // Paso 1: sin servicio, «Continuar» no avanza y dice por qué
  const continuar = page.locator('[data-paso="0"] [data-siguiente]');
  await tabularHasta(page, continuar, { maximo: 120 });
  await page.keyboard.press('Enter');
  await expect(page.locator('#cita-servicio')).toBeFocused();
  await expect(page.locator('#cita-servicio-error')).toHaveText(
    'Completa este dato para continuar.',
  );
  await expect(page.locator('[data-paso="1"]')).toBeHidden();

  await page.locator('#cita-servicio').selectOption('piedras');
  await page.keyboard.press('Enter');
  // Paso 2: el foco va al día
  await expect(page.locator('#cita-dia')).toBeFocused();
  await expect(page.locator('[data-progreso]')).toHaveText('Paso 2 de 3');

  // Un lunes no atienden: el error lo dice con el nombre del día
  await page.locator('#cita-dia').fill('2026-11-09');
  await page.locator('#cita-dia').dispatchEvent('change');
  await page.keyboard.press('Enter');
  await expect(page.locator('#cita-dia-error')).toHaveText(
    'Los lunes no atendemos. Elige otro día.',
  );

  // Martes: el masaje de 75 min no cabe a las 19:00 (cierran a las 20:00), a las 18:30 sí
  await page.locator('#cita-dia').fill('2026-11-10');
  await page.locator('#cita-dia').dispatchEvent('change');
  await expect(page.locator('#cita-hora option[value="19:00"]')).toBeDisabled();
  await expect(page.locator('#cita-hora option[value="18:30"]')).toBeEnabled();
  await page.locator('#cita-hora').selectOption('16:30');
  await page.keyboard.press('Enter');

  // Paso 3: nombre, resumen y envío
  await expect(page.locator('#cita-nombre')).toBeFocused();
  await expect(page.locator('[data-resumen]')).toContainText('Masaje con piedras calientes');
  await page.locator('#cita-nombre').fill('Clienta de prueba');
  await page.locator('#cita-nombre').press('Enter');

  await expect(page.locator('#form-cita .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
  );
  // Texto literal: es lo que leerá la recepción. Intl separa «S/» del número con U+00A0.
  const esperado = [
    'Hola, quiero una cita:',
    '• Servicio: Masaje con piedras calientes (S/ 140, 75 min)',
    '• Día: 10/11/2026',
    '• Hora: 16:30',
    '• Tu nombre: Clienta de prueba',
  ].join('\n');
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});

test('«Reservar» en un paquete lo deja elegido y abre el paso del día', async ({ page }) => {
  await page.goto(URL);
  const reservar = page.locator('[data-reservar="paquete-pausa"]');
  await tabularHasta(page, reservar, { maximo: 120 });
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#cita-servicio')).toHaveValue('paquete-pausa');
  await expect(page.locator('#cita-dia')).toBeFocused();
});

test('filtros de servicios con teclado, con el filtro en la URL', async ({ page }) => {
  await page.goto(URL);
  const faciales = page.locator('[data-filtro="faciales"]');
  await tabularHasta(page, faciales);
  await page.keyboard.press('Enter');
  await expect(faciales).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-servicio="relajante"]')).toBeHidden();
  await expect(page.locator('[data-servicio="limpieza-facial"]')).toBeVisible();
  await expect(page).toHaveURL(/\?categoria=faciales/);
});

test('comparador con teclado: las flechas mueven el corte', async ({ page }) => {
  await page.goto(URL);
  const rango = page.locator('[data-comparador-corte]');
  await rango.focus();
  await esperarFocoVisible(page);
  await page.keyboard.press('End');
  await expect(rango).toHaveValue('100');
  await expect(page.locator('[data-comparador]')).toHaveAttribute('style', /--corte: 100%/);
});
