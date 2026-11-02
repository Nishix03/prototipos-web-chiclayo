// Simulación del asistente virtual en el navegador (ADR 013). Solo abre y cierra el <dialog> y
// alterna cuál respuesta fija se ve. No lee texto del visitante ni llama a ningún servicio.
//
// Se usa el <dialog> nativo con showModal(): el navegador ya se encarga de atrapar el foco,
// cerrar con Esc, esconder el resto de la página a los lectores de pantalla y devolver el foco
// al botón que lo abrió. No hay que escribir nada de eso a mano.

export function iniciarAsistente() {
  const abrir = document.querySelector('[data-asistente-abrir]');
  const dialogo = document.querySelector('dialog[data-asistente]');
  if (!abrir || !dialogo) return;

  abrir.addEventListener('click', () => dialogo.showModal());
  dialogo.querySelector('[data-asistente-cerrar]').addEventListener('click', () => dialogo.close());

  // Clic en el fondo oscuro: el clic llega al <dialog> mismo, no a su contenido
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });

  const chips = [...dialogo.querySelectorAll('[data-chip]')];
  const respuestas = [...dialogo.querySelectorAll('[data-respuesta]')];
  const saludo = dialogo.querySelector('[data-asistente-saludo]');

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      for (const otro of chips) otro.setAttribute('aria-pressed', String(otro === chip));
      for (const respuesta of respuestas) {
        respuesta.hidden = respuesta.dataset.respuesta !== chip.dataset.chip;
      }
      if (saludo) saludo.hidden = true;
    });
  }

  // El botón nace oculto: solo aparece cuando todo lo anterior ya funciona
  abrir.dataset.listo = '';
}
