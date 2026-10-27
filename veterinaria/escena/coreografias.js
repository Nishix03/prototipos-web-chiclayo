// Coreografías ligadas al scroll de «Juego y urgencia», con GSAP ScrollTrigger. Ritmo de la
// identidad: juguetón, con un rebote corto (curvas back y elastic suaves), pero rápido: la
// urgencia nunca espera una animación.
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarCoreografias() {
  // 1 · Los títulos entran con un saltito (escala y desplazamiento, sin opacidad: contraste, Axe)
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(titulo, {
      y: 20,
      scale: 0.96,
      duration: 0.5,
      ease: 'back.out(2.2)',
      scrollTrigger: { trigger: titulo, start: 'top 88%', once: true },
    });
  }

  // 2 · Los servicios caen en su lugar uno tras otro, como juguetes en la caja
  const servicios = document.querySelectorAll('.servicio');
  if (servicios.length) {
    gsap.from(servicios, {
      y: -24,
      rotation: (i) => (i % 2 ? 4 : -4),
      duration: 0.55,
      ease: 'back.out(2)',
      stagger: 0.07,
      scrollTrigger: { trigger: '.servicios__lista', start: 'top 82%', once: true },
    });
  }

  // 3 · Las filas del calendario de vacunas se marcan una tras otra, como un carné que se sella
  const filas = document.querySelectorAll('.vacunas__tabla tbody tr');
  if (filas.length) {
    gsap.from(filas, {
      x: -16,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.05,
      scrollTrigger: { trigger: '#vacunas', start: 'top 75%', once: true },
    });
  }
}
