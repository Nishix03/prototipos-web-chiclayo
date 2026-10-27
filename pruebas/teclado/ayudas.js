// Ayudas para las pruebas de teclado de todos los rubros.
import { expect } from '@playwright/test';

/** Pulsa Tab hasta que el foco llegue a `destino` (o falla tras `maximo` intentos). */
export async function tabularHasta(pagina, destino, { maximo = 80, atras = false } = {}) {
  for (let i = 0; i < maximo; i++) {
    if (await destino.evaluate((el) => el === document.activeElement)) return i;
    await pagina.keyboard.press(atras ? 'Shift+Tab' : 'Tab');
  }
  throw new Error(`El foco no llegó a ${destino} en ${maximo} pulsaciones de Tab`);
}

/** Recorre la página con Tab y devuelve la descripción de cada elemento que recibió foco. */
export async function recorridoConTab(pagina, pasos) {
  const visitados = [];
  for (let i = 0; i < pasos; i++) {
    await pagina.keyboard.press('Tab');
    visitados.push(
      await pagina.evaluate(() => {
        const el = document.activeElement;
        return {
          texto: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '')
            .trim()
            .slice(0, 40),
          etiqueta: el.tagName,
        };
      }),
    );
  }
  return visitados;
}

/**
 * El elemento enfocado se ve: tiene contorno (outline) y llega a la pantalla.
 * toBeInViewport reintenta: la página usa scroll-behavior: smooth, así que el navegador
 * tarda unos milisegundos en desplazar el elemento hasta la vista. Con 4 navegadores en paralelo
 * dibujando 3D por software, ese desplazamiento a veces pasa de 5 s: se espera hasta 10 s.
 */
export async function esperarFocoVisible(pagina) {
  const enfocado = pagina.locator(':focus');
  await expect(enfocado, 'el elemento enfocado debe llegar a la pantalla').toBeInViewport({
    timeout: 10_000,
  });
  await expect(enfocado).toBeVisible();
  const contorno = await pagina.evaluate(() => {
    const el = document.activeElement;
    // Un radio muestra el foco en su <label> con :has(input:focus-visible)
    return getComputedStyle(el.matches('input[type="radio"]') ? el.closest('label') : el)
      .outlineStyle;
  });
  expect(contorno, 'el foco debe tener contorno visible').not.toBe('none');
}

/** Captura las URLs que la página intenta abrir con window.open (no abre WhatsApp de verdad). */
export async function interceptarWindowOpen(pagina) {
  await pagina.addInitScript(() => {
    window.__abiertas = [];
    window.open = (url) => {
      window.__abiertas.push(String(url));
      return null;
    };
  });
  return () => pagina.evaluate(() => window.__abiertas);
}

/**
 * Pone el reloj del navegador en el martes 3 de noviembre de 2026, 13:00 en Lima, y lo deja
 * correr desde ahí. No se congela: GSAP mide el tiempo con Date.now() y, con el reloj quieto,
 * sus animaciones se quedarían en el primer cuadro (contenido recortado o transparente).
 */
export async function fijarHora(pagina, iso = '2026-11-03T13:00:00-05:00') {
  await pagina.clock.install({ time: new Date(iso) });
  await pagina.clock.resume();
}
