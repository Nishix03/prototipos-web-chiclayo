import { test, expect } from '@playwright/test';

test('spa: la franja solo ofrece horas válidas y se puede volver a todas', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T08:00:00-05:00') });
  await page.goto('spa/?3d=0');
  await page.locator('#cita-servicio').selectOption({ index: 1 });
  await page.locator('[data-siguiente]').first().click();
  await page.locator('#cita-dia').fill('2026-11-04');
  await page.locator('[data-fase="tarde"]').click();
  const horas = await page
    .locator('#cita-hora option:not([disabled])')
    .evaluateAll((o) => o.map((x) => x.value).filter(Boolean));
  expect(horas.length).toBeGreaterThan(0);
  expect(
    horas.every((h) => Number(h.split(':')[0]) >= 12 && Number(h.split(':')[0]) < 18),
  ).toBeTruthy();
  await page.locator('[data-fase="todas"]').click();
  await expect(page.locator('[data-fase="todas"]')).toHaveAttribute('aria-pressed', 'true');
});

test('dental: la etapa cambia al resultado y vuelve al reiniciar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('dental/?3d=0');
  await expect(page.locator('[data-etapas] [aria-current]')).toHaveText('Orientación');
  for (let i = 0; i < 8 && (await page.locator('[data-resultado-panel]').isHidden()); i++) {
    await page.locator('.paso:not([hidden]) .opcion').first().click();
  }
  await expect(page.locator('[data-etapas] [aria-current]')).toHaveText('Tus opciones');
  await page.locator('[data-reiniciar]').click();
  await expect(page.locator('[data-etapas] [aria-current]')).toHaveText('Orientación');
});

test('barbería: elegir una carta completa el barbero del turno', async ({ page }) => {
  await page.goto('barberia/?3d=0');
  const boton = page.locator('[data-elegir-barbero]').first();
  const id = await boton.getAttribute('data-elegir-barbero');
  await boton.click();
  await expect(page.locator('#turno-barbero')).toHaveValue(id);
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
});

test('gimnasio: el plan se conserva al recargar y permite quitar sesiones', async ({ page }) => {
  await page.goto('gimnasio/?3d=0');
  const boton = page.locator('[data-guardar-sesion]').first();
  await boton.click();
  await expect(page.locator('[data-plan-lista] li')).toHaveCount(1);
  await page.reload();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  await boton.click();
  await expect(page.locator('[data-plan-lista] li')).toHaveCount(0);
  await expect(page.locator('[data-plan-vacio]')).toBeVisible();
});

test('veterinaria: el nombre se muestra como texto y no se persiste', async ({ page }) => {
  await page.goto('veterinaria/?3d=0');
  await page.locator('#vacunas-nombre').fill('<img src=x> Trufa');
  await expect(page.locator('[data-ficha-nombre]')).toHaveText('<img src=x> Trufa');
  await expect(page.locator('[data-ficha-nombre] img')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-ficha-nombre]')).toHaveText('Tu mascota');
});
