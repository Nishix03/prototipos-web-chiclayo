// Coreografías de «Pulso», con GSAP ScrollTrigger. Ritmo de la identidad: golpes cortos y
// enérgicos, como un tren de intervalos (duraciones breves, curvas que aceleran y frenan seco).
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function iniciarCoreografias() {
  // 1 · Tipografía cinética: los titulares se inclinan según la velocidad del scroll y vuelven
  //     a su sitio al soltar (solo transform)
  const titulares = document.querySelectorAll('.titular, .seccion-titulo');
  const inclinar = gsap.quickTo(titulares, 'skewX', { duration: 0.35, ease: 'power3.out' });
  ScrollTrigger.create({
    onUpdate: (self) => inclinar(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)),
  });
  ScrollTrigger.addEventListener('scrollEnd', () => inclinar(0));

  // 2 · Los días del horario entran de golpe, uno tras otro, como series
  const dias = document.querySelectorAll('.dia');
  if (dias.length) {
    gsap.from(dias, {
      y: 40,
      duration: 0.35,
      ease: 'power4.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.semana', start: 'top 85%', once: true },
    });
  }

  // 3 · El ahorro de cada plan salta, como un récord nuevo (escala: el texto nunca queda tenue)
  const ahorros = document.querySelectorAll('.planes__ahorro');
  if (ahorros.length) {
    gsap.from(ahorros, {
      scale: 0.5,
      duration: 0.35,
      ease: 'back.out(3)',
      stagger: 0.1,
      scrollTrigger: { trigger: '.planes__tabla', start: 'top 80%', once: true },
    });
  }
}
