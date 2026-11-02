// Coreografías ligadas al scroll de «Juego y urgencia», con GSAP ScrollTrigger. Ritmo de la
// identidad: cercano y estable, con desplazamientos breves y sin rebotes; la
// urgencia nunca espera una animación.
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarCoreografias() {
  // 1 · Los títulos se asientan con suavidad (escala y desplazamiento, sin opacidad: contraste, Axe)
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(titulo, {
      y: 20,
      scale: 0.96,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: titulo, start: 'top 88%', once: true },
    });
  }

  // 2 · Los servicios se ordenan en la ficha, sin girar ni rebotar
  const servicios = document.querySelectorAll('.servicio');
  if (servicios.length) {
    gsap.from(servicios, {
      y: 16,
      duration: 0.4,
      ease: 'power2.out',
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
