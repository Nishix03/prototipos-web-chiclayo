// Coreografías ligadas al scroll de «Agua quieta», con GSAP ScrollTrigger. Ritmo de la
// identidad: el de una respiración lenta (entradas largas que se posan, nada rebota).
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarCoreografias() {
  // 1 · Los títulos suben despacio desde el agua (desplazamiento, no opacidad: contraste, Axe)
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(titulo, {
      y: 36,
      duration: 1.2,
      ease: 'sine.out',
      scrollTrigger: { trigger: titulo, start: 'top 90%', once: true },
    });
  }

  // 2 · Los servicios llegan como hojas que se posan sobre el agua, uno tras otro
  const servicios = document.querySelectorAll('.servicio');
  if (servicios.length) {
    gsap.from(servicios, {
      y: 24,
      rotation: (i) => (i % 2 ? 1.2 : -1.2),
      duration: 1,
      ease: 'sine.out',
      stagger: 0.09,
      scrollTrigger: { trigger: '.servicios__lista', start: 'top 85%', once: true },
    });
  }

  // 3 · El comparador se abre del todo y vuelve al medio, para mostrar que se mueve
  const figura = document.querySelector('[data-comparador]');
  const rango = figura?.querySelector('[data-comparador-corte]');
  if (rango) {
    const corte = { valor: 50 };
    const muestra = gsap
      .timeline({ scrollTrigger: { trigger: figura, start: 'top 70%', once: true } })
      .to(corte, { valor: 85, duration: 1.1, ease: 'sine.inOut' })
      .to(corte, { valor: 50, duration: 1.1, ease: 'sine.inOut' })
      .eventCallback('onUpdate', () => {
        if (figura.dataset.tocado !== undefined) return muestra.kill();
        rango.value = String(Math.round(corte.valor));
        rango.dispatchEvent(new Event('input'));
      });
  }
}
