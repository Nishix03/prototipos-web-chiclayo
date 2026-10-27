// Las coreografías ligadas al scroll de «El pase» (paso 4 del brief), con GSAP ScrollTrigger.
// Nada se oculta con CSS: si este archivo no llega, todo el contenido ya está a la vista.
// (La cuarta, los ingredientes que caen en sus bowls, la mueve el scroll en la escena 3D.)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Separa un título en palabras sin cambiar lo que lee un lector de pantalla
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
  // 1 · Los títulos de sección se arman palabra por palabra
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(enPalabras(titulo), {
      yPercent: 60,
      opacity: 0,
      duration: 0.5,
      ease: 'power4.out',
      stagger: 0.07,
      scrollTrigger: { trigger: titulo, start: 'top 85%', once: true },
    });
  }

  // 2 · Lo escrito en la pizarra aparece línea por línea, como tiza
  const pizarra = document.querySelector('.pizarra');
  if (pizarra) {
    gsap.from(pizarra.querySelectorAll('dt, dd, .pizarra__precio, .pizarra__cuando'), {
      opacity: 0,
      x: -12,
      duration: 0.4,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: pizarra, start: 'top 75%', once: true },
    });
  }

  // 3 · Las comandas de la carta se cuelgan del riel una tras otra (balanceo desde la pinza)
  const comandas = document.querySelectorAll('.categoria');
  if (comandas.length) {
    gsap.from(comandas, {
      rotate: (i) => (i % 2 ? 9 : -9),
      y: -24,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.6)', // un balanceo corto, como papel que se cuelga
      stagger: 0.1,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '#carta', start: 'top 70%', once: true },
    });
  }
}
