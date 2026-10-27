// "Abierto · hoy de… / Cerrado · abre…" con la hora simulada, y Axe en los dos estados.
// El indicador cambia de color según la hora: una revisión de contraste hecha a una sola
// hora no basta (así se coló un verde de 4.42:1 en _ejemplo, visible solo con el local abierto).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fijarHora } from './ayudas.js';

const require = createRequire(import.meta.url);
const fuenteAxe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ETIQUETAS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

// Hora de Lima (UTC-5). El 3 de noviembre de 2026 es martes.
const CASOS = [
  {
    pagina: 'restaurante/',
    hora: '2026-11-03T13:00:00-05:00',
    texto: 'Abierto · hoy de 12:00 a 16:30',
  },
  {
    pagina: 'restaurante/',
    hora: '2026-11-03T17:30:00-05:00',
    texto: 'Cerrado · abre mañana a las 12:00',
  },
  {
    pagina: 'restaurante/',
    hora: '2026-11-02T13:00:00-05:00',
    texto: 'Cerrado · abre mañana a las 12:00',
  }, // lunes
  {
    pagina: 'barberia/',
    hora: '2026-11-03T13:00:00-05:00',
    texto: 'Abierto · hoy de 10:00 a 21:00',
  },
  {
    pagina: 'barberia/',
    hora: '2026-11-08T15:00:00-05:00',
    texto: 'Cerrado · abre mañana a las 10:00',
  }, // domingo por la tarde
  {
    pagina: '_ejemplo/',
    hora: '2026-11-03T10:00:00-05:00',
    texto: 'Abierto · hoy de 9:00 a 13:00 y de 15:00 a 19:00',
  },
  {
    pagina: '_ejemplo/',
    hora: '2026-11-03T13:30:00-05:00',
    texto: 'Cerrado · abre hoy a las 15:00',
  },
];

for (const { pagina, hora, texto } of CASOS) {
  test(`${pagina} a las ${hora.slice(11, 16)} del ${hora.slice(0, 10)}: "${texto}" y 0 violaciones de Axe`, async ({
    page,
  }) => {
    await fijarHora(page, hora);
    await page.route('**/maps.google.com/**', (r) => r.abort());
    await page.goto(pagina);

    const indicadores = page.locator('[data-estado-horario]');
    await expect(indicadores.first()).toBeVisible();
    for (const indicador of await indicadores.all()) {
      await expect(indicador.locator('[data-estado-texto]')).toHaveText(texto);
    }

    await page.addScriptTag({ content: fuenteAxe });
    const { violations } = await page.evaluate(
      (tags) => window.axe.run(document, { runOnly: tags }),
      ETIQUETAS,
    );
    expect(
      violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([]);
  });
}
