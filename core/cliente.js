// Mejoras del núcleo en el navegador. Cada app.js de página llama a iniciarNucleo().
// La página ya está completa en el HTML: si algo de aquí falla, solo se pierde esa mejora.

import { iniciarIndicadorHorario } from './horario.js';
import { iniciarFormulariosWhatsapp } from './formulario-whatsapp.js';
import { iniciarComparadores } from './comparador.js';
import { cuandoEsteLibre } from './carga3d.js';
import { iniciarMovimiento } from './movimiento.js';
import { iniciarSelecciones } from './seleccion.js';

/** Ejecuta una mejora aislada: un error se registra en consola y no tumba a las demás. */
export function seguro(nombre, fn) {
  try {
    fn();
  } catch (error) {
    console.warn(`[${nombre}] no se pudo iniciar:`, error);
  }
}

/**
 * @param {object} [opciones]
 * @param {Record<string, (form: HTMLFormElement) => string>} [opciones.mensajes]
 *   armadores de mensaje propios por id de formulario (funciones estrella del rubro)
 */
export function iniciarNucleo({ mensajes } = {}) {
  seguro('movimiento de marca', iniciarMovimiento);
  seguro('respuesta de selecciones', iniciarSelecciones);
  seguro('horario', iniciarIndicadorHorario);
  seguro('formularios', () => iniciarFormulariosWhatsapp(mensajes));
  seguro('comparadores', iniciarComparadores);
  // La simulación del asistente llega después del primer pintado y solo si la página la trae
  seguro('asistente', () => {
    if (!document.querySelector('[data-asistente]')) return;
    cuandoEsteLibre(() =>
      import('./asistente-cliente.js').then(({ iniciarAsistente }) => iniciarAsistente()),
    );
  });
}
