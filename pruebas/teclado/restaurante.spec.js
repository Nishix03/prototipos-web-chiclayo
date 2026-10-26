// Prueba de teclado E2E del restaurante (ADR 006).
// Todo se hace como lo haría alguien sin mouse: Tab, Shift+Tab, Enter, Espacio y Escape.
import { test, expect } from '@playwright/test';
import { mensajePedido } from '../../restaurante/pedido.js';
import {
  tabularHasta,
  recorridoConTab,
  esperarFocoVisible,
  interceptarWindowOpen,
  fijarHora,
} from './ayudas.js';

const URL = 'restaurante/';

test.beforeEach(async ({ page }) => {
  await fijarHora(page);
  await page.route('**/maps.google.com/**', (r) => r.abort()); // sin red externa en la prueba
});

test('Tab recorre la página en orden y cada foco se ve', async ({ page }) => {
  await page.goto(URL);
  const visitados = await recorridoConTab(page, 6);
  // Orden esperado al empezar: saltar a la carta → menú de hoy → (portada) botones principales
  expect(visitados[0].texto).toBe('Saltar a la carta');
  expect(visitados.map((v) => v.texto)).toContain('Armar mi pedido');
  expect(visitados.map((v) => v.texto).indexOf('Armar mi pedido')).toBeLessThan(
    visitados.map((v) => v.texto).indexOf('Reservar mesa'),
  );
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Shift+Tab');
    await esperarFocoVisible(page);
  }
});

test('Shift+Tab vuelve exactamente por el mismo camino', async ({ page }) => {
  await page.goto(URL);
  const ida = await recorridoConTab(page, 8);
  const vuelta = [];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('Shift+Tab');
    vuelta.push(
      await page.evaluate(() =>
        (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent)
          .trim()
          .slice(0, 40),
      ),
    );
  }
  expect(vuelta).toEqual(
    ida
      .slice(0, 7)
      .reverse()
      .map((v) => v.texto),
  );
});

test('el enlace "Saltar a la carta" lleva el foco a la carta', async ({ page }) => {
  await page.goto(URL);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  // Tras saltar, lo siguiente enfocable está dentro de la carta (los filtros)
  const dentroDeLaCarta = await page.evaluate(
    () => document.activeElement.closest('#carta') !== null,
  );
  expect(dentroDeLaCarta).toBe(true);
});

test('pedido completo solo con teclado: agregar, abrir comanda, Escape, enviar', async ({
  page,
}) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);

  // 1. Agregar 2 ceviches y 1 arroz con pato
  const agregarCeviche = page.locator('[data-plato="ceviche"] [data-accion="agregar"]');
  await tabularHasta(page, agregarCeviche);
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
  // El botón "+ Agregar" desaparece: el foco pasa al "+" del mismo plato, no se pierde
  const sumarCeviche = page.locator('[data-plato="ceviche"] [data-accion="sumar"]');
  await expect(sumarCeviche).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-plato="ceviche"] .cantidad__valor')).toHaveText('2');

  await tabularHasta(page, page.locator('[data-plato="arroz-con-pato"] [data-accion="agregar"]'));
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-resumen]')).toHaveText('3 platos · S/ 108');

  // 2. Llegar a la barra con Tab y abrir la comanda
  const verPedido = page.locator('[data-abrir-comanda]');
  await tabularHasta(page, verPedido, { maximo: 120 });
  await esperarFocoVisible(page);
  await page.keyboard.press('Enter');
  const comanda = page.locator('[data-comanda]');
  await expect(comanda).toHaveJSProperty('open', true);

  // 3. El foco nunca cae en la página de fondo. Un <dialog> modal deja que Tab salga a la
  //    interfaz del navegador (activeElement = body) y vuelva a entrar: eso es correcto.
  //    Lo que no puede pasar es enfocar un elemento detrás de la comanda.
  let volvioAEntrar = false;
  let salioAlNavegador = false;
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const donde = await page.evaluate(() => {
      const el = document.activeElement;
      if (el.closest('[data-comanda]')) return 'comanda';
      return el === document.body ? 'navegador' : 'fondo';
    });
    expect(donde, 'el foco no debe tocar la página detrás de la comanda').not.toBe('fondo');
    if (donde === 'navegador') salioAlNavegador = true;
    if (donde === 'comanda' && salioAlNavegador) volvioAEntrar = true;
  }
  expect(volvioAEntrar, 'tras pasar por el navegador, el foco vuelve a la comanda').toBe(true);

  // 4. Escape cierra la comanda y el foco vuelve a "Ver mi pedido"
  await page.keyboard.press('Escape');
  await expect(comanda).toHaveJSProperty('open', false);
  await expect(verPedido).toBeFocused();

  // 5. Reabrir enseguida (regresión: un cierre animado pendiente no debe cerrar la comanda
  //    recién reabierta), intentar enviar sin dirección → error junto al campo
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  await expect(comanda).toHaveJSProperty('open', true);
  const enviar = page.locator('.comanda__enviar');
  await tabularHasta(page, enviar);
  await page.keyboard.press('Enter');
  const direccion = page.locator('#direccion');
  await expect(direccion).toBeFocused();
  await expect(page.locator('#direccion-error')).toHaveText('Completa este dato para continuar.');

  // 6. Escribir la dirección y enviar
  await page.keyboard.type('Calle Ejemplo 456, Chiclayo');
  await tabularHasta(page, enviar);
  await page.keyboard.press('Enter');
  await expect(page.locator('#form-comanda .formulario__estado')).toHaveText(
    'Abrimos WhatsApp con tu pedido listo. Solo falta que lo envíes.',
  );

  // 7. El mensaje de WhatsApp es exactamente el que arma pedido.js
  const pedido = new Map([
    [
      'ceviche',
      { plato: { id: 'ceviche', nombre: 'Ceviche de pescado', precio: 35 }, cantidad: 2 },
    ],
    [
      'arroz-con-pato',
      { plato: { id: 'arroz-con-pato', nombre: 'Arroz con pato', precio: 38 }, cantidad: 1 },
    ],
  ]);
  const esperado = mensajePedido(pedido, {
    entrega: 'delivery',
    direccion: 'Calle Ejemplo 456, Chiclayo',
  });
  const [url] = await abiertas();
  expect(url).toBe(`https://wa.me/51995258351?text=${encodeURIComponent(esperado)}`);
});

test('quitar todo desde la comanda deja el estado vacío y el foco no se pierde', async ({
  page,
}) => {
  await page.goto(URL);
  await tabularHasta(page, page.locator('[data-plato="jalea"] [data-accion="agregar"]'));
  await page.keyboard.press('Enter');
  await tabularHasta(page, page.locator('[data-abrir-comanda]'), { maximo: 120 });
  await page.keyboard.press('Enter');
  await tabularHasta(page, page.locator('.linea [data-accion="quitar"]'));
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-vacia]')).toBeVisible();
  const volver = page.locator('[data-vacia] button');
  await expect(volver).toBeFocused();
  // Enviar sigue enfocable; con el pedido vacío no abre WhatsApp y devuelve el foco a "Volver"
  await tabularHasta(page, page.locator('.comanda__enviar'));
  await page.keyboard.press('Enter');
  await expect(volver).toBeFocused();
  await page.keyboard.press('Enter'); // "Volver a la carta" cierra la comanda
  await expect(page.locator('[data-comanda]')).toHaveJSProperty('open', false);
});

test('filtros de la carta con teclado', async ({ page }) => {
  await page.goto(URL);
  const marinos = page.locator('[data-filtro="marinos"]');
  await tabularHasta(page, marinos);
  await page.keyboard.press('Enter');
  await expect(marinos).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-categoria="fondos"]')).toBeHidden();
  await expect(page.locator('[data-categoria="marinos"]')).toBeVisible();
  // El filtro queda en la URL y sobrevive a una recarga
  await expect(page).toHaveURL(/\?categoria=marinos/);
  await page.reload();
  await expect(page.locator('[data-filtro="marinos"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-categoria="fondos"]')).toBeHidden();
});

test('reserva con teclado: un lunes da error claro, un martes abre WhatsApp', async ({ page }) => {
  const abiertas = await interceptarWindowOpen(page);
  await page.goto(URL);
  const fecha = page.locator('#reserva-fecha');
  await tabularHasta(page, fecha, { maximo: 150 });
  await fecha.fill('2026-11-09'); // lunes
  await page.locator('#reserva-hora').fill('13:00');
  await page.locator('#reserva-personas').fill('4');
  await page.locator('#reserva-nombre').fill('Cliente de prueba');
  await page.locator('#reserva-nombre').press('Enter');
  await expect(fecha).toBeFocused();
  await expect(page.locator('#reserva-fecha-error')).toHaveText(
    'Los lunes no abrimos. Elige otra fecha.',
  );

  await fecha.fill('2026-11-10'); // martes
  await page.locator('#reserva-nombre').press('Enter');
  const [url] = await abiertas();
  expect(decodeURIComponent(url)).toContain('Hola, quiero reservar una mesa:');
  expect(decodeURIComponent(url)).toContain('• Fecha: 10/11/2026');
  expect(decodeURIComponent(url)).toContain('• Personas: 4');
});
