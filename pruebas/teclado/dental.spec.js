// Prueba de teclado E2E de la clínica dental (ADR 006): la función estrella, el cuestionario
// «¿Qué tratamiento necesito?», solo con teclado, hasta el mensaje literal de WhatsApp.
import { test, expect } from '@playwright/test';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'dental/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

/** Responde el cuestionario con teclado: Tab hasta la respuesta y Enter. */
async function responder(page, texto) {
  const opcion = page
    .locator('.paso:not([hidden])')
    .getByRole('button', { name: texto, exact: true });
  await tabularHasta(page, opcion);
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
}

test('Tab: saltar al cuestionario, horario y «Empezar el cuestionario» al empezar, con foco visible', async ({
  page,
}) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 4);
  const textos = visitados.map((v) => v.texto);
  expect(textos[0]).toBe('Saltar al cuestionario');
  expect(textos).toContain('Horario');
  expect(textos).toContain('Empezar el cuestionario');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    await esperarFocoVisible(page);
  }
});

test('cuestionario con teclado: cada respuesta lleva el foco a la pregunta siguiente', async ({
  page,
}) => {
  await page.goto(URL);
  await responder(page, 'No me duele');
  await expect(page.locator('[data-paso="pieza"]')).toBeFocused();
  await expect(page.locator('[data-paso="dolor"]')).toBeHidden();

  await responder(page, 'No');
  await expect(page.locator('[data-paso="mejorar"]')).toBeFocused();

  // «Volver» regresa a la pregunta anterior
  const volver = page.locator('[data-paso="mejorar"] [data-volver]');
  await tabularHasta(page, volver);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-paso="pieza"]')).toBeFocused();
  await responder(page, 'No');

  await responder(page, 'Que estén más alineados');
  const panel = page.locator('[data-resultado-panel]');
  await expect(panel).toBeFocused();
  await expect(panel.locator('[data-tratamiento="ortodoncia"]')).toBeVisible();
  await expect(panel.locator('[data-tratamiento="limpieza"]')).toBeHidden();
  await expect(panel).toHaveAttribute('aria-labelledby', 'resultado-ortodoncia');
  await expect(panel).toContainText('no un diagnóstico');

  // Escape vuelve un paso
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-paso="mejorar"]')).toBeFocused();
});

test('del resultado a la cita: error claro y mensaje literal a WhatsApp', async ({ page }) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  await responder(page, 'No me duele');
  await responder(page, 'No');
  await responder(page, 'Que estén más alineados');
  await expect(page.locator('#evaluacion-motivo')).toHaveValue('ortodoncia');

  const enviar = page.locator('#form-evaluacion button[type="submit"]');
  await tabularHasta(page, enviar, { maximo: 80 });
  await page.keyboard.press('Enter');
  // Faltan datos: el foco va al primer campo con error y el error está escrito junto a él
  await expect(page.locator('#evaluacion-fecha')).toBeFocused();
  await expect(page.locator('#evaluacion-fecha-error')).toHaveText(
    'Completa este dato para continuar.',
  );

  await page.locator('#evaluacion-fecha').fill('2026-11-10');
  await page.locator('#evaluacion-turno').selectOption('Tarde');
  await page.locator('#evaluacion-nombre').fill('Paciente de prueba');
  await page.locator('#evaluacion-nombre').press('Enter');

  await expect(page.locator('#form-evaluacion .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu cita lista. Solo falta que la envíes.',
  );
  // Texto literal: es lo que leerá la recepción de la clínica
  const esperado = [
    'Hola, quiero agendar una evaluación:',
    '• Motivo: Ortodoncia',
    '• Fecha preferida: 10/11/2026',
    '• Turno: Tarde',
    '• Tu nombre: Paciente de prueba',
    '• Resultado del cuestionario: Ortodoncia (orientación, por confirmar en la evaluación)',
  ].join('\n');
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});

test('«Empezar de nuevo» vuelve a la primera pregunta y borra el resultado de la cita', async ({
  page,
}) => {
  await page.goto(URL);
  await responder(page, 'Sí, un dolor fuerte o que no se pasa');
  await expect(page.locator('[data-tratamiento="endodoncia"]')).toBeVisible();
  const reiniciar = page.locator('[data-reiniciar]');
  await tabularHasta(page, reiniciar);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-paso="dolor"]')).toBeFocused();
  await expect(page.locator('[data-cuestionario-resultado]')).toHaveValue('');
});
