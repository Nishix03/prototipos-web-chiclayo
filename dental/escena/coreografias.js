// Coreografías ligadas al scroll de «Calma clínica», con GSAP ScrollTrigger. Ritmo de la
// identidad: lento y suave, nada salta (duraciones largas, curvas que se posan).
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarCoreografias() {
  // 1 · Los títulos de sección suben despacio, como algo que sale a flote. Con desplazamiento
  //     y no con opacidad: el texto nunca queda tenue (contraste, Axe)
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(titulo, {
      y: 28,
      duration: 0.9,
      ease: 'sine.out',
      scrollTrigger: { trigger: titulo, start: 'top 88%', once: true },
    });
  }

  // 2 · La lista de precios se ordena fila por fila, como las piezas de la escena
  const filas = document.querySelectorAll('.tratamiento');
  if (filas.length) {
    gsap.from(filas, {
      y: 18,
      duration: 0.7,
      ease: 'sine.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.tratamientos__lista', start: 'top 82%', once: true },
    });
  }
}
