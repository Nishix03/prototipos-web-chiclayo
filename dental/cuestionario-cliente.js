// Navegador: el cuestionario «¿Qué tratamiento necesito?». Cada respuesta lleva a la siguiente
// pregunta o al resultado; el paso cambia con una View Transition (si el navegador la tiene) y
// el foco va siempre a lo nuevo, para que teclado y lector de pantalla sigan el recorrido.
// El resultado queda escrito en la cita de evaluación: motivo elegido y una línea en el mensaje.

import { notificarSeleccion } from '../core/seleccion.js';

function cambiar(fn, terminado) {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reducido) {
    document.startViewTransition(fn).finished.then(terminado, terminado);
  } else {
    fn();
    terminado();
  }
}

export function iniciarCuestionario() {
  const recorrido = document.querySelector('.cuestionario__recorrido');
  if (!recorrido) return;
  const pasos = new Map(
    [...recorrido.querySelectorAll('[data-paso]')].map((p) => [p.dataset.paso, p]),
  );
  const panel = recorrido.querySelector('[data-resultado-panel]');
  const form = document.getElementById('form-evaluacion');
  const motivo = form?.elements['evaluacion-motivo'];
  const nota = form?.querySelector('[data-cuestionario-resultado]');
  const camino = [recorrido.dataset.inicio];

  const etapas = [...document.querySelectorAll('[data-etapas] li')];
  function progreso(n) {
    etapas.forEach((e, i) => {
      if (i === n) e.setAttribute('aria-current', 'step');
      else e.removeAttribute('aria-current');
    });
  }
  recorrido.querySelector('[data-agendar]')?.addEventListener('click', (e) => {
    progreso(2);
    notificarSeleccion(e.currentTarget, motivo);
  });
  function mostrar(id, resultado) {
    progreso(resultado ? 1 : 0);
    cambiar(
      () => {
        for (const [clave, paso] of pasos) paso.hidden = clave !== id;
        panel.hidden = !resultado;
        if (resultado) {
          for (const t of panel.querySelectorAll('[data-tratamiento]'))
            t.hidden = t.dataset.tratamiento !== resultado;
          panel.setAttribute('aria-labelledby', `resultado-${resultado}`);
        }
        // El foco, dentro del cambio: con View Transition el DOM se actualiza después
        (resultado ? panel : pasos.get(id)).focus({ preventScroll: true });
      },
      () => notificarSeleccion(null, resultado ? panel : pasos.get(id)),
    );
  }

  recorrido.addEventListener('click', (e) => {
    const boton = e.target.closest('button');
    if (!boton) return;
    if (boton.dataset.siguiente) {
      camino.push(boton.dataset.siguiente);
      mostrar(boton.dataset.siguiente);
    } else if (boton.dataset.resultado) {
      const id = boton.dataset.resultado;
      camino.push(null);
      mostrar(null, id);
      if (motivo) motivo.value = id;
      if (nota) {
        const nombre = panel.querySelector(`#resultado-${id}`).textContent.trim();
        nota.value = `${nombre} (orientación, por confirmar en la evaluación)`;
      }
    } else if (boton.hasAttribute('data-volver')) {
      camino.pop();
      mostrar(camino.at(-1));
    } else if (boton.hasAttribute('data-reiniciar')) {
      camino.length = 1;
      if (nota) nota.value = '';
      mostrar(camino[0]);
    }
  });

  // Volver desde el resultado: el botón «Empezar de nuevo» reinicia; Escape vuelve un paso
  recorrido.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || camino.length < 2) return;
    camino.pop();
    mostrar(camino.at(-1));
  });
}
