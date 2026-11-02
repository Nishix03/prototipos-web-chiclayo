import { test, expect } from '@playwright/test';

for (const rubro of ['restaurante', 'barberia', 'dental', 'spa', 'veterinaria', 'gimnasio']) {
  test(`${rubro}: anima la interfaz sin cargar el motor 3D`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__entradas = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (cuadros, opciones) {
        window.__entradas.push({ clase: this.className, tiempo: opciones.duration });
        return original.call(this, cuadros, opciones);
      };
    });
    await page.goto(`${rubro}/?3d=0`);
    await expect(page.locator('html')).toHaveAttribute('data-movimiento', 'activo', {
      timeout: 10000,
    });
    await expect(page.locator('[data-escena] canvas')).toHaveCount(0);
    await expect(page.locator('#titular')).toBeVisible();
    expect(
      await page.evaluate(() => window.__entradas.some((e) => e.clase.includes('titular'))),
    ).toBe(true);
    await page.locator('.editorial__foto').scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.evaluate(() => window.__entradas.some((e) => e.clase.includes('cortina'))))
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`${rubro}: movimiento reducido desactiva y cancela las entradas`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${rubro}/?3d=0`);
    await expect(page.locator('html')).toHaveAttribute('data-movimiento', 'reducido', {
      timeout: 10000,
    });
    await expect(page.locator('#titular')).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveAttribute('data-movimiento', 'activo', {
      timeout: 10000,
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-movimiento', 'reducido', {
      timeout: 10000,
    });
    const activas = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === 'running' &&
              a.effect?.target?.closest('.portada, .editorial, .foto-servicio'),
          ).length,
    );
    expect(activas).toBe(0);
    await expect(page.locator('.editorial__foto img')).toBeVisible();
  });
}

test('restaurante: los platos de portada llevan a su lugar en la carta', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('restaurante/?3d=0');
  const platos = page.locator('[data-plato-portada]');
  await expect(platos).toHaveCount(3);
  const destino = await platos.first().getAttribute('href');
  await page.locator('[data-filtro="marinos"]').click();
  await platos.first().click();
  await expect(page.locator(destino)).toBeInViewport();
  await expect(page.locator(`${destino} [data-accion="agregar"]`)).toBeVisible();
});
