// Las 3 coreografías ligadas al scroll (paso 4 del brief), con GSAP ScrollTrigger.
// Nada se oculta con CSS: si este archivo no llega, todo el contenido ya está a la vista.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { progreso } from './progreso.js';

gsap.registerPlugin(ScrollTrigger);

// Separa un título en palabras sin cambiar lo que lee un lector de pantalla
function enPalabras(titulo) {
  const texto = titulo.textContent.trim();
  const leido = document.createElement('span');
  leido.className = 'solo-lector';
  leido.textContent = texto;
  titulo.replaceChildren(
    leido,
    ...texto.split(' ').flatMap((palabra, i) => {
      const span = document.createElement('span');
      span.className = 'palabra';
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      span.textContent = palabra;
      return i === 0 ? [span] : [' ', span];
    }),
  );
  return titulo.querySelectorAll('.palabra');
}

export function iniciarCoreografias() {
  // 1 · La olla gira y la cámara se acerca: el scroll de la portada mueve la escena 3D
  ScrollTrigger.create({
    trigger: '[data-portada]',
    start: 'top top',
    end: () => `+=${innerHeight * 0.6}`, // termina mientras la olla sigue a la vista
    scrub: true,
    onUpdate: (st) => (progreso.portada = st.progress),
  });
  // …y el vapor se espesa cuando el menú del día se acerca
  ScrollTrigger.create({
    trigger: '#menu-del-dia',
    start: 'top bottom',
    end: 'top 40%',
    scrub: true,
    onUpdate: (st) => {
      document.querySelector('[data-olla]').style.setProperty('--vapor', st.progress.toFixed(3));
    },
  });

  // 2 · Los títulos de sección se arman palabra por palabra
  for (const titulo of document.querySelectorAll('[data-armar]')) {
    gsap.from(enPalabras(titulo), {
      yPercent: 60,
      opacity: 0,
      duration: 0.5,
      ease: 'power4.out', // ease-out-quint: entra pesado y se asienta
      stagger: 0.07,
      scrollTrigger: { trigger: titulo, start: 'top 85%', once: true },
    });
  }

  // 3 · Las capas de la pizarra suben como el vapor, una tras otra
  for (const grupo of document.querySelectorAll('.pizarra')) {
    const capas = grupo.querySelectorAll('[data-capa]');
    if (!capas.length) continue;
    gsap.from(capas, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      ease: 'power4.out',
      stagger: 0.12,
      scrollTrigger: { trigger: grupo, start: 'top 80%', once: true },
    });
  }
}
