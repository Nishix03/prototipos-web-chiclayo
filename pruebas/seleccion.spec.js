import { test, expect } from '@playwright/test';
import { fijarHora } from './teclado/ayudas.js';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fijarHora(page);
  await page.addInitScript(() => {
    window.__respuestasSeleccion = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (cuadros, opciones) {
      const clase = this.getAttribute('class') ?? '';
      if (clase.includes('seleccion-')) window.__respuestasSeleccion.push(clase);
      return original.call(this, cuadros, opciones);
    };
  });
});

for (const rubro of ['restaurante', 'barberia', 'spa', 'gimnasio']) {
  test(`${rubro}: el indicador sigue al filtro y el teclado conserva el foco`, async ({ page }) => {
    await page.goto(`${rubro}/?3d=0`);
    const grupo = page.locator('[data-filtros]').first();
    const botones = grupo.locator('button');
    await botones.nth(1).click();
    await expect(botones.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo.locator('.seleccion-riel')).toHaveCount(1);
    await expect
      .poll(() =>
        grupo.evaluate((g) => {
          const r = g.querySelector('.seleccion-riel').getBoundingClientRect();
          const b = g.querySelector('[aria-pressed="true"]').getBoundingClientRect();
          return Math.abs(r.left - b.left) + Math.abs(r.width - b.width);
        }),
      )
      .toBeLessThan(2);
    expect(await page.evaluate(() => window.__respuestasSeleccion.includes('seleccion-riel'))).toBe(
      true,
    );
    await botones.first().focus();
    await page.keyboard.press('Space');
    await expect(botones.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(botones.first()).toBeFocused();
    await expect(grupo.locator('.seleccion-riel')).toHaveCount(1);
  });
}

for (const [rubro, selector] of [
  ['barberia', '#turno-corte'],
  ['spa', '#cita-servicio'],
  ['dental', '#evaluacion-motivo'],
  ['gimnasio', '#prueba-clase'],
  ['veterinaria', '#vacunas-especie'],
]) {
  test(`${rubro}: elegir un desplegable confirma el campo sin desplazarlo`, async ({ page }) => {
    await page.goto(`${rubro}/?3d=0`);
    const control = page.locator(selector);
    await control.scrollIntoViewIfNeeded();
    const caja = control.locator('..');
    const valor = await control.locator('option:not([disabled])').last().getAttribute('value');
    await control.selectOption(valor);
    await expect(control).toHaveValue(valor);
    await expect(caja).toHaveAttribute('data-seleccion-activa', 'true');
    await expect(caja.locator(':scope > .seleccion-sello')).toHaveCount(1);
    expect(
      await page.evaluate(() =>
        window.__respuestasSeleccion.some((c) => c.includes('seleccion-sello')),
      ),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('barbería: la carta confirma el barbero elegido en el turno', async ({ page }) => {
  await page.goto('barberia/?3d=0');
  const elegir = page.locator('[data-elegir-barbero]').first();
  const id = await elegir.getAttribute('data-elegir-barbero');
  await elegir.click();
  await expect(page.locator('#turno-barbero')).toHaveValue(id);
  await expect(page.locator('#turno-barbero').locator('..')).toHaveAttribute(
    'data-seleccion-activa',
    'true',
  );
  await expect(page.locator('.barbero').first()).toHaveAttribute('data-seleccion-activa', 'true');
});

test('gimnasio: selecciones rápidas no acumulan marcas ni pierden pulsaciones', async ({
  page,
}) => {
  await page.goto('gimnasio/?3d=0');
  const boton = page.locator('[data-guardar-sesion]').first();
  for (let i = 0; i < 4; i++) {
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', String(i % 2 === 0));
  }
  await expect(page.locator('[data-plan-lista] li')).toHaveCount(0);
  await expect(boton.locator('..').locator(':scope > .seleccion-sello')).toHaveCount(1);
  await expect(boton.locator('..')).toHaveAttribute('data-seleccion-activa', 'false');
});

test('spa: elegir una fase desplaza el indicador y respeta horas disponibles', async ({ page }) => {
  await page.goto('spa/?3d=0');
  await page.locator('#cita-servicio').selectOption({ index: 1 });
  await page.locator('[data-siguiente]').first().click();
  await page.locator('#cita-dia').fill('2026-11-04');
  await page.locator('[data-fase="tarde"]').click();
  await expect(page.locator('.fases .seleccion-riel')).toHaveCount(1);
  const horas = await page
    .locator('#cita-hora option:not([disabled])')
    .evaluateAll((o) => o.map((v) => v.value).filter(Boolean));
  expect(horas.every((h) => Number(h.split(':')[0]) >= 12 && Number(h.split(':')[0]) < 18)).toBe(
    true,
  );
});

test('restaurante: una fecha de cierre no recibe confirmación positiva', async ({ page }) => {
  await page.goto('restaurante/?3d=0');
  const fecha = page.locator('#reserva-fecha');
  await fecha.fill('2026-11-09');
  await fecha.blur();
  await expect(fecha.locator('..')).toHaveAttribute('data-seleccion-activa', 'false');
  expect(await fecha.evaluate((e) => e.validity.valid)).toBe(false);
});

test('movimiento reducido: la elección queda marcada sin animaciones de confirmación', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('gimnasio/?3d=0');
  await page.locator('#prueba-clase').selectOption({ index: 1 });
  await expect(page.locator('#prueba-clase').locator('..')).toHaveAttribute(
    'data-seleccion-activa',
    'true',
  );
  expect(await page.evaluate(() => window.__respuestasSeleccion.length)).toBe(0);
});

test('restaurante: elegir entrega confirma el radio y conserva el pedido', async ({ page }) => {
  await page.goto('restaurante/?3d=0');
  await page.locator('[data-accion="agregar"]').first().click();
  await page.locator('[data-abrir-comanda]').click();
  const opcion = page.locator('input[name="entrega"]:not(:checked)').first();
  const valor = await opcion.getAttribute('value');
  await opcion.check();
  const elegida = page.locator(`input[name="entrega"][value="${valor}"]`);
  await expect(elegida).toBeChecked();
  await expect(elegida.locator('..')).toHaveAttribute('data-seleccion-activa', 'true');
  await expect(elegida.locator('..').locator('.seleccion-contorno')).toHaveCount(1);
  await expect(page.locator('dialog [data-lineas] > li')).toHaveCount(1);
  await page.locator('dialog [data-accion="sumar"]').first().click();
  await expect(page.locator('dialog .cantidad__valor')).toHaveText('2');
  await expect(page.locator('dialog .cantidad__valor .seleccion-contorno')).toHaveCount(1);
});

test('dental: el resultado confirma la etapa y el motivo elegido para la evaluación', async ({
  page,
}) => {
  await page.goto('dental/?3d=0');
  await page.getByRole('button', { name: 'No me duele', exact: true }).click();
  await page.getByRole('button', { name: 'No', exact: true }).click();
  await page.getByRole('button', { name: 'Que estén más alineados', exact: true }).click();
  await expect(page.locator('[data-etapas] [aria-current="step"]')).toHaveText('Tus opciones');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__respuestasSeleccion.some((c) => c.includes('seleccion-contorno')),
      ),
    )
    .toBe(true);
  await page.locator('[data-agendar]').click();
  const motivo = page.locator('#evaluacion-motivo');
  await expect(motivo).toHaveValue('ortodoncia');
  await expect(motivo.locator('..')).toHaveAttribute('data-seleccion-activa', 'true');
});
