// Prueba de teclado E2E de la veterinaria (ADR 006): la función estrella, la barra de urgencias,
// siempre al alcance; el calendario de vacunas y la cita hasta el mensaje literal de WhatsApp.
import { test, expect } from '@playwright/test';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'veterinaria/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

test('Tab: «Llamar ahora» es lo primero después del salto, con foco visible', async ({ page }) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 3);
  const textos = visitados.map((v) => v.texto);
  expect(textos[0]).toBe('Saltar a la cita');
  expect(textos[1]).toBe('Llamar ahora');
  await expect(page.locator('[data-estrella]')).toHaveAttribute('href', 'tel:+51995258351');
  await page.keyboard.press('Shift+Tab');
  await esperarFocoVisible(page);
});

test('la barra de urgencias sigue a la vista al bajar hasta el final', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('.urgencias__llamar')).toBeInViewport();
  const whatsapp = page.locator('.urgencias__whatsapp');
  await expect(whatsapp).toHaveAttribute(
    'href',
    `https://wa.me/51995258351?text=${encodeURIComponent('Hola, es una urgencia en Trufa Veterinaria:')}`,
  );
});

test('calendario de vacunas: con la fecha de nacimiento marca la próxima y la agenda', async ({
  page,
}) => {
  await page.goto(URL);
  // El reloj está en el martes 3/11/2026. Un cachorro nacido el 1/9/2026 tiene 9 semanas:
  // ya pasaron la de 6 y la de 9 (justo hoy no cuenta como pasada: 3/11 es la semana 9)
  const especie = page.locator('#vacunas-especie');
  await tabularHasta(page, especie);
  await esperarFocoVisible(page);
  await page.locator('#vacunas-nacimiento').fill('2026-09-01');
  await page.locator('#vacunas-nacimiento').dispatchEvent('change');
  const tabla = page.locator('.vacunas__tabla[data-especie="perro"]');
  await expect(tabla.locator('tr[data-semanas="6"]')).toHaveAttribute('data-estado', 'paso');
  await expect(tabla.locator('tr[data-semanas="9"]')).toHaveAttribute('data-estado', 'proxima');
  await expect(page.locator('[data-vacunas-resumen]')).toContainText(
    'La próxima: Polivalente, 1.ª dosis, el 3 de noviembre de 2026.',
  );
  await expect(page.locator('.vacunas__tabla[data-especie="gato"]')).toBeHidden();

  const agendar = page.locator('[data-agendar-vacuna]');
  await tabularHasta(page, agendar);
  await page.keyboard.press('Enter');
  await expect(page.locator('#cita-motivo')).toHaveValue('vacuna');
  await expect(page.locator('#cita-especie')).toHaveValue('Perro');
  await expect(page.locator('#cita-mascota')).toBeFocused();
});

test('cita con teclado: el domingo en la tarde avisa y el mensaje sale literal', async ({
  page,
}) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  await page.locator('#cita-mascota').fill('Trufa');
  await page.locator('#cita-especie').selectOption('Gato');
  await page.locator('#cita-motivo').selectOption('bano');
  await page.locator('#cita-dia').fill('2026-11-08'); // domingo
  await page.locator('#cita-dia').dispatchEvent('change');
  await page.locator('#cita-turno').selectOption('Tarde');
  await page.locator('#cita-nombre').fill('Dueño de prueba');
  await page.locator('#cita-nombre').press('Enter');
  await expect(page.locator('#cita-turno')).toBeFocused();
  await expect(page.locator('#cita-turno-error')).toHaveText(
    'Los domingos atendemos solo en la mañana. Elige la mañana u otro día.',
  );

  await page.locator('#cita-turno').selectOption('Mañana');
  await page.locator('#cita-nombre').press('Enter');
  await expect(page.locator('#form-cita .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
  );
  const esperado = [
    'Hola, quiero agendar una cita:',
    '• Nombre de tu mascota: Trufa',
    '• Especie: Gato',
    '• Motivo: Baño y corte',
    '• Día: 08/11/2026',
    '• Turno: Mañana',
    '• Tu nombre: Dueño de prueba',
  ].join('\n');
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});
