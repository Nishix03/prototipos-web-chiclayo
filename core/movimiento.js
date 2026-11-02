// Movimiento de interfaz independiente del 3D. Sin bucle de scroll ni librerías:
// IntersectionObserver para entradas, WAAPI para gestos y CSS para hover/press.
const MARCAS = {
  restaurante: {
    tiempo: 650,
    curva: 'cubic-bezier(.16,1,.3,1)',
    x: 0,
    y: -20,
    giro: -1.6,
    piezas: '.categoria__titulo, .pizarra dt, .pizarra dd, .portada__platos-titulo',
  },
  barberia: {
    tiempo: 440,
    curva: 'cubic-bezier(.19,1,.22,1)',
    x: -28,
    y: 0,
    giro: 0,
    piezas: '.corte__cabeza, .barbero__nombre, .barbero__dias',
  },
  dental: {
    tiempo: 650,
    curva: 'cubic-bezier(.22,.68,0,1)',
    x: 0,
    y: 22,
    giro: 0,
    piezas: '.tratamiento__nombre',
  },
  spa: {
    tiempo: 950,
    curva: 'cubic-bezier(.22,.61,.36,1)',
    x: 0,
    y: 30,
    giro: 0.7,
    piezas: '.servicio__nombre, .paquete__nombre, .paquete__datos',
  },
  veterinaria: {
    tiempo: 560,
    curva: 'cubic-bezier(.2,.8,.2,1)',
    x: 0,
    y: 18,
    giro: -0.6,
    piezas: '.servicio__nombre, .ficha-mascota',
  },
  gimnasio: {
    tiempo: 420,
    curva: 'cubic-bezier(.16,1,.3,1)',
    x: 0,
    y: 30,
    giro: 0,
    piezas: '.dia__nombre, .clase__hora, .planes__ahorro',
  },
};

export function iniciarMovimiento() {
  const marca = document.body.dataset.rubro;
  const perfil = MARCAS[marca];
  if (!perfil || new URLSearchParams(location.search).has('poster')) return;
  const preferencia = matchMedia('(prefers-reduced-motion: reduce)');
  const activas = new Set();
  const porElemento = new WeakMap();
  let teclado = false;
  let observador;
  const permitido = () => !preferencia.matches && !document.hidden;

  function animar(elemento, cuadros, tiempo = perfil.tiempo, retraso = 0) {
    if (!elemento || !permitido() || elemento.contains(document.activeElement)) return;
    porElemento.get(elemento)?.cancel();
    const animacion = elemento.animate(cuadros, {
      duration: tiempo,
      delay: retraso,
      easing: perfil.curva,
      fill: 'backwards',
    });
    activas.add(animacion);
    porElemento.set(elemento, animacion);
    const limpiar = () => activas.delete(animacion);
    animacion.finished.then(limpiar, limpiar);
    return animacion;
  }

  function entrada(elemento, indice = 0) {
    animar(
      elemento,
      [
        { transform: `translate3d(${perfil.x}px, ${perfil.y}px, 0) rotate(${perfil.giro}deg)` },
        { transform: 'none' },
      ],
      perfil.tiempo,
      Math.min((indice % 4) * 65, 195),
    );
  }

  function cancelar() {
    for (const animacion of activas) animacion.cancel();
    activas.clear();
  }

  // El contenido nunca se oculta: sin JS, sin GPU o con movimiento reducido se lee igual.
  function preparar() {
    document.documentElement.dataset.movimiento = preferencia.matches ? 'reducido' : 'activo';
    if (!permitido()) return;
    entrada(document.querySelector('.titular'));
    [
      '.portada .bajada',
      '.portada [data-estado-texto]',
      '.cabecera .marca-simbolo, .letrero .marca-simbolo, .portada .marca-simbolo',
    ].forEach((selector, i) => entrada(document.querySelector(selector), i + 1));
    // Se mueve el rótulo, no el área pulsable de la acción principal.
    document.querySelectorAll('.portada .llamado, .comanda-colgada--pedir').forEach((control) => {
      let texto = control.querySelector('.movimiento-llamado__texto');
      if (!texto) {
        const nodo = [...control.childNodes].find(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
        );
        if (!nodo) return;
        texto = document.createElement('span');
        texto.className = 'movimiento-llamado__texto';
        nodo.replaceWith(texto);
        texto.append(nodo);
      }
      entrada(texto, 2);
    });

    observador = new IntersectionObserver(
      (entradas) => {
        for (const registro of entradas) {
          if (!registro.isIntersecting) continue;
          const elemento = registro.target;
          observador.unobserve(elemento);
          if (elemento.classList.contains('movimiento-foto')) {
            const imagen = elemento.querySelector('img');
            const revelar = () => {
              if (elemento.getBoundingClientRect().bottom <= 0) return;
              const cortina = elemento.querySelector('.movimiento-foto__cortina');
              const horizontal = marca === 'barberia' || marca === 'gimnasio';
              animar(
                cortina,
                horizontal
                  ? [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }]
                  : [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
                perfil.tiempo + 180,
              );
              animar(imagen, [{ scale: '1.065' }, { scale: '1' }], perfil.tiempo + 240);
            };
            if (imagen.complete) revelar();
            else imagen.addEventListener('load', revelar, { once: true });
          } else entrada(elemento, Number(elemento.dataset.ordenMovimiento ?? 0));
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );

    document
      .querySelectorAll('.editorial__foto img, .foto-servicio img, .disciplina > img')
      .forEach((imagen) => {
        let marco = imagen.closest('.movimiento-foto');
        if (!marco) {
          marco = document.createElement('div');
          marco.className = 'movimiento-foto';
          imagen.before(marco);
          marco.append(imagen);
          const cortina = document.createElement('span');
          cortina.className = 'movimiento-foto__cortina';
          cortina.setAttribute('aria-hidden', 'true');
          marco.append(cortina);
        }
        observador.observe(marco);
      });
    document
      .querySelectorAll(`.seccion-titulo, .carta__titulo, .editorial__texto, ${perfil.piezas}`)
      .forEach((elemento, i) => {
        elemento.dataset.ordenMovimiento = String(i % 4);
        observador.observe(elemento);
      });
  }

  // La interacción mantiene el foco estable. El teclado obtiene el nuevo estado de inmediato.
  document.addEventListener(
    'keydown',
    () => {
      teclado = true;
      document.documentElement.dataset.entrada = 'teclado';
    },
    { passive: true },
  );
  document.addEventListener(
    'pointerdown',
    () => {
      teclado = false;
      document.documentElement.dataset.entrada = 'puntero';
    },
    { passive: true },
  );
  document.addEventListener('focusin', (e) => {
    if (!teclado) return;
    for (const animacion of activas) {
      const objetivo = animacion.effect?.target;
      if (objetivo?.contains(e.target) || e.target.contains(objetivo)) animacion.cancel();
    }
  });
  preferencia.addEventListener('change', () => {
    cancelar();
    observador?.disconnect();
    preparar();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelar();
    else {
      const estado = preferencia.matches ? 'reducido' : 'activo';
      if (document.documentElement.dataset.movimiento !== estado) {
        observador?.disconnect();
        preparar();
      }
    }
  });
  preparar();
}
