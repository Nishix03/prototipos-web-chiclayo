// Coreografías ligadas al scroll de «Filo», con GSAP ScrollTrigger. Ritmo de la identidad:
// cortes secos, como un filo (duraciones cortas, curvas que frenan en seco).
// Nada se oculta con CSS: si este archivo no llega, todo está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function enPalabras(titulo) {
  const texto = titulo.textContent.trim();
  const leido = Object.assign(document.createElement('span'), {
    className: 'solo-lector',
    textContent: texto,
  });
  titulo.replaceChildren(
    leido,
    ...texto.split(' ').flatMap((palabra, i) => {
      const span = Object.assign(document.createElement('span'), { textContent: palabra });
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      return i === 0 ? [span] : [' ', span];
    }),
  );
  return titulo.querySelectorAll('[aria-hidden="true"]');
}

export function iniciarCoreografias() {
  // 1 · Los títulos entran de un tajo: cada palabra corta de lado, rápido
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(enPalabras(titulo), {
      xPercent: -30,
      opacity: 0,
      duration: 0.32,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: titulo, start: 'top 85%', once: true },
    });
  }

  // 2 · La lista de cortes se recorta línea por línea, como una navaja que pasa
  const cortes = document.querySelectorAll('.corte');
  if (cortes.length) {
    gsap.from(cortes, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.4,
      ease: 'power4.out',
      stagger: 0.06,
      clearProps: 'clipPath',
      scrollTrigger: { trigger: '.cortes__lista', start: 'top 80%', once: true },
    });
  }

  // 3 · Los días de cada barbero caen en su casilla uno tras otro, como un tablero de turnos.
  //     Con escala y no con opacidad: el texto nunca queda tenue (contraste, Axe)
  const dias = document.querySelectorAll('.dia--si');
  if (dias.length) {
    gsap.from(dias, {
      scale: 0.6,
      duration: 0.25,
      ease: 'back.out(3)',
      stagger: 0.04,
      scrollTrigger: { trigger: '.barberos__lista', start: 'top 80%', once: true },
    });
  }
}
