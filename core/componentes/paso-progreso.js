import { html } from './html.js';

export function pasoProgreso(etapas) {
  return html`<ol class="progreso-clinico" aria-label="Etapas de la orientación" data-etapas>
    ${etapas.map((e, i) => html`<li ${i === 0 ? html`aria-current="step"` : ''}>${e}</li>`)}
  </ol>`;
}
