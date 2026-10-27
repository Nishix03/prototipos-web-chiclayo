// Prueba de teclado E2E del gimnasio (ADR 006): la función estrella, el horario de clases con la
// clase en curso y la siguiente; filtros, promoción, IMC y la clase de prueba hasta el mensaje
// literal de WhatsApp. El reloj está en el martes 3/11/2026 a las 13:00 de Lima.
import { test, expect } from '@playwright/test';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'gimnasio/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort());
});

test('Tab: saltar al horario, horario y «Ver las clases de hoy» al empezar, con foco visible', async ({
  page,
}) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 4);
  const textos = visitados.map((v) => v.texto);
  expect(textos[0]).toBe('Saltar al horario de clases');
  expect(textos).toContain('Horario');
  expect(textos).toContain('Ver las clases de hoy');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    await esperarFocoVisible(page);
  }
});

test('marca la clase en curso y la siguiente, y la portada la nombra', async ({ page }) => {
  await page.goto(URL);
  const martes = page.locator('[data-dia="mar"]');
  const enCurso = martes.locator('[data-estado="en-curso"]');
  await expect(enCurso).toHaveAttribute('data-inicio', '12:30');
  await expect(enCurso).toContainText('En curso');
  await expect(martes.locator('[data-estado="siguiente"]')).toHaveAttribute('data-inicio', '19:00');
  await expect(page.locator('[data-ahora]')).toHaveText(
    'Ahora: Funcional con Ana (demo), hasta las 13:20.',
  );
  await expect(martes).toHaveAttribute('data-hoy', '');
});

test('filtro de clases con teclado: «Box» deja solo el box y la siguiente cambia', async ({
  page,
}) => {
  await page.goto(URL);
  const box = page.locator('[data-filtro="box"]');
  await tabularHasta(page, box);
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
  await expect(box).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\?clase=box/);
  await expect(page.locator('[data-clase][data-tipo="funcional"]').first()).toBeHidden();
  // Sin el funcional, no hay clase en curso; la siguiente es el box del martes a las 20:00
  await expect(page.locator('[data-estado="en-curso"]')).toHaveCount(0);
  await expect(page.locator('[data-dia="mar"] [data-estado="siguiente"]')).toHaveAttribute(
    'data-inicio',
    '20:00',
  );
  await expect(page.locator('[data-ahora]')).toHaveText(
    'Próxima clase: Box con Rafa (demo), hoy a las 20:00.',
  );
});

test('la promoción cuenta hacia atrás hasta su fecha de fin', async ({ page }) => {
  await page.goto(URL);
  // Del martes 3/11 13:00 al 30/11 23:59: 27 días, 10 h y 59 min
  // El reloj sigue corriendo: puede haber pasado un minuto desde las 13:00
  await expect(page.locator('[data-cuenta]')).toHaveText(/^27 d · 10 h · 5[89] min$/);
  await expect(page.locator('.promocion__fin')).toHaveText(
    'Termina el 30 de noviembre a las 23:59.',
  );
});

test('IMC con teclado: el error dice qué falta y el resultado invita a la clase de prueba', async ({
  page,
}) => {
  await page.goto(URL);
  const peso = page.locator('#imc-peso');
  await tabularHasta(page, peso, { maximo: 120 });
  await page.keyboard.type('70');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-imc-resultado]')).toHaveText(
    'Escribe tu talla en centímetros, entre 100 y 230.',
  );
  await expect(page.locator('#imc-talla')).toBeFocused();
  await page.keyboard.type('175');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-imc-resultado]')).toContainText(
    'Tu IMC es 22.9: según la OMS, está en el rango «normal» (de 18.5 a 24.9).',
  );
});

test('clase de prueba con teclado: error claro y mensaje literal a WhatsApp', async ({ page }) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  const enviar = page.locator('#form-prueba button[type="submit"]');
  await tabularHasta(page, enviar, { maximo: 150 });
  await page.keyboard.press('Enter');
  await expect(page.locator('#prueba-nombre')).toBeFocused();
  await expect(page.locator('#prueba-nombre-error')).toHaveText(
    'Completa este dato para continuar.',
  );

  await page.locator('#prueba-nombre').fill('Socio de prueba');
  await page.locator('#prueba-clase').selectOption('Spinning');
  await page.locator('#prueba-objetivo').selectOption('Mejorar mi resistencia');
  await page.locator('#prueba-horario').selectOption('Mediodía');
  await page.locator('#prueba-nombre').press('Enter');
  await expect(page.locator('#form-prueba .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu pedido listo. Solo falta que lo envíes.',
  );
  const esperado = [
    'Hola, quiero mi clase de prueba gratis:',
    '• Tu nombre: Socio de prueba',
    '• Clase que quieres probar: Spinning',
    '• Qué buscas: Mejorar mi resistencia',
    '• Horario preferido: Mediodía',
  ].join('\n');
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});
