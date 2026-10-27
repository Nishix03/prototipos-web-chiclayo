// Navegador: el comparador antes/después (core/componentes/comparador.js). El rango mueve el
// corte con una variable CSS; nada más.

export function iniciarComparadores() {
  for (const figura of document.querySelectorAll('[data-comparador]')) {
    const rango = figura.querySelector('[data-comparador-corte]');
    const mover = () => {
      figura.style.setProperty('--corte', `${rango.value}%`);
      rango.setAttribute('aria-valuetext', `${rango.value} % de la imagen de después`);
    };
    rango.addEventListener('input', mover);
    // Marca que la persona lo tocó: la muestra animada (si la hay) ya no le mueve el corte
    for (const evento of ['focus', 'pointerdown'])
      rango.addEventListener(evento, () => (figura.dataset.tocado = ''), { once: true });
    mover();
  }
}
