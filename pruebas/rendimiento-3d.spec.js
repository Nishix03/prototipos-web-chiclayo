import { test, expect } from '@playwright/test';

test('3D: no dibuja en reposo y despierta al hacer scroll', async ({ page }, info) => {
  test.skip(
    info.project.name === 'celular',
    'Una comprobación de GPU basta para el motor compartido.',
  );
  await page.addInitScript(() => {
    window.__dibujos = 0;
    for (const nombre of ['drawElements', 'drawArrays']) {
      const original = WebGL2RenderingContext.prototype[nombre];
      WebGL2RenderingContext.prototype[nombre] = function (...args) {
        window.__dibujos++;
        return original.apply(this, args);
      };
    }
  });
  await page.goto('spa/?3d=forzar');
  await expect(page.locator('[data-escena][data-viva]')).toBeAttached({ timeout: 30000 });
  await page.waitForTimeout(1000);
  const antes = await page.evaluate(() => window.__dibujos);
  expect(antes).toBeGreaterThan(0);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__dibujos)).toBe(antes);
  await page.evaluate(() => scrollTo({ top: 650, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.__dibujos)).toBeGreaterThan(antes);
});

test('móvil: difiere el 3D hasta empezar a explorar', async ({ page }, info) => {
  test.skip(info.project.name !== 'celular', 'La carga diferida depende del puntero táctil.');
  await page.goto('spa/');
  await page.waitForTimeout(700);
  await expect(page.locator('[data-escena] canvas')).toHaveCount(0);
  await page.evaluate(() => scrollTo({ top: 250, behavior: 'instant' }));
  await expect(page.locator('[data-escena][data-viva]')).toBeAttached({ timeout: 30000 });
});

test('restaurante: la primera interacción activa la mesa 3D', async ({ page }, info) => {
  await page.goto('restaurante/');
  await expect(page.locator('[data-escena] canvas')).toHaveCount(0);
  if (info.project.name === 'celular') {
    await page.evaluate(() => scrollTo({ top: 180, behavior: 'instant' }));
  } else {
    await page.mouse.move(800, 500);
  }
  await expect(page.locator('[data-escena][data-viva]')).toBeAttached({ timeout: 30000 });
});
