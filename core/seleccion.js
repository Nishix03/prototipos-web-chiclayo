// Confirmación visual del estado real. No modifica valores, filtros ni validación.
export function notificarSeleccion(origen, destino) {
  document.dispatchEvent(new CustomEvent('seleccion-confirmada', { detail: { origen, destino } }));
}

export function iniciarSelecciones() {
  if (!document.body.dataset.rubro || new URLSearchParams(location.search).has('poster')) return;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const activas = new Set();
  const animaciones = new WeakMap();
  const estados = new WeakMap();
  const valores = new WeakMap();
  const grupos = new Map();
  const camposMarcados = new Set();
  const tiempos = {
    barberia: 190,
    spa: 280,
    dental: 230,
    gimnasio: 180,
    veterinaria: 230,
    restaurante: 230,
  };
  const tiempo = tiempos[document.body.dataset.rubro] ?? 230;
  const permitir = () =>
    !reducido.matches && !document.hidden && document.documentElement.dataset.entrada !== 'teclado';

  function animar(elemento, cuadros, duracion = tiempo, retraso = 0) {
    if (!permitir() || !elemento) return;
    animaciones.get(elemento)?.cancel();
    const a = elemento.animate(cuadros, {
      duration: duracion,
      delay: retraso,
      easing:
        getComputedStyle(document.body).getPropertyValue('--movimiento-curva').trim() || 'ease-out',
    });
    animaciones.set(elemento, a);
    activas.add(a);
    a.finished.then(
      () => activas.delete(a),
      () => activas.delete(a),
    );
  }
  function cancelar() {
    for (const a of activas) a.cancel();
    activas.clear();
  }
  function anclar(elemento) {
    if (getComputedStyle(elemento).position === 'static') elemento.classList.add('seleccion-ancla');
  }
  function sello(elemento, activa) {
    let marca = elemento.querySelector(':scope > .seleccion-sello');
    if (!marca) {
      anclar(elemento);
      marca = document.createElement('span');
      marca.className = 'seleccion-sello';
      marca.setAttribute('aria-hidden', 'true');
      marca.innerHTML =
        '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8.5 6.5 12 13 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      elemento.append(marca);
    }
    elemento.dataset.seleccionActiva = String(activa);
    animaciones.get(marca)?.cancel();
    if (activa)
      animar(marca, [
        { opacity: 0.3, scale: '.65' },
        { opacity: 1, scale: '1' },
      ]);
  }
  function pulso(objetivo, invalido = false) {
    if (!objetivo || !permitir()) return;
    const r = objetivo.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight) return;
    const host = objetivo.matches('input, select')
      ? (objetivo.closest('.campo') ?? objetivo.parentElement)
      : objetivo.tagName === 'FIELDSET'
        ? objetivo.parentElement
        : objetivo;
    anclar(host);
    let borde = host.querySelector(':scope > .seleccion-contorno');
    if (!borde) {
      borde = document.createElement('span');
      borde.className = 'seleccion-contorno';
      borde.setAttribute('aria-hidden', 'true');
      host.append(borde);
    }
    const base = host.getBoundingClientRect();
    Object.assign(borde.style, {
      left: `${r.left - base.left - host.clientLeft}px`,
      top: `${r.top - base.top - host.clientTop}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      borderRadius: getComputedStyle(objetivo).borderRadius,
    });
    borde.classList.toggle('seleccion-contorno--error', invalido);
    animar(
      borde,
      [
        { opacity: 0, scale: '.985' },
        { opacity: 0.85, scale: '1', offset: 0.3 },
        { opacity: 0, scale: '1' },
      ],
      Math.min(tiempo + 70, 300),
    );
  }
  function campo(control, forzar = false) {
    if (
      !control?.matches(
        'select, input[type="date"], input[type="time"], input[type="radio"], input[type="checkbox"]',
      )
    )
      return;
    const clave = `${control.value}/${control.checked ?? ''}`;
    if (!forzar && valores.get(control) === clave) return;
    valores.set(control, clave);
    if (control.matches('[type="radio"], [type="checkbox"]')) {
      const etiqueta = control.closest('label');
      if (control.type === 'radio')
        document.querySelectorAll('input[type="radio"]').forEach((otro) => {
          if (otro.name === control.name && otro.form === control.form)
            otro.closest('label')?.setAttribute('data-seleccion-activa', String(otro.checked));
        });
      if (etiqueta) {
        etiqueta.dataset.seleccionActiva = String(control.checked);
        pulso(etiqueta);
      }
      return;
    }
    const caja = control.closest('.campo');
    if (caja) {
      sello(caja, Boolean(control.value) && control.validity.valid);
      camposMarcados.add(control);
    }
    pulso(control, !control.validity.valid);
  }
  function geometria(grupo, boton) {
    if (boton.offsetParent === grupo) {
      return {
        x: boton.offsetLeft,
        y: boton.offsetTop + boton.offsetHeight - 3,
        ancho: boton.offsetWidth,
      };
    }
    const base = grupo.getBoundingClientRect();
    const r = boton.getBoundingClientRect();
    return {
      x: r.left - base.left - grupo.clientLeft + grupo.scrollLeft,
      y: r.bottom - base.top - grupo.clientTop + grupo.scrollTop - 3,
      ancho: r.width,
    };
  }
  const transformar = (p) => `translate(${p.x}px, ${p.y}px) scaleX(${p.ancho})`;
  function riel(grupo, mover = true) {
    const estado = grupos.get(grupo);
    const elegido = grupo.querySelector('[aria-pressed="true"]');
    if (!elegido || !estado) return;
    anclar(grupo);
    const nuevo = geometria(grupo, elegido);
    const inicioVisible = estado.linea ? getComputedStyle(estado.linea).transform : null;
    if (!estado.linea) {
      anclar(grupo);
      estado.linea = document.createElement('span');
      estado.linea.className = 'seleccion-riel';
      estado.linea.setAttribute('aria-hidden', 'true');
      grupo.append(estado.linea);
    }
    const anterior = estado.posicion ?? geometria(grupo, estado.elegido ?? elegido);
    estado.linea.style.color = getComputedStyle(elegido).color;
    estado.linea.style.transform = transformar(nuevo);
    if (mover)
      animar(estado.linea, [
        { transform: inicioVisible ?? transformar(anterior) },
        { transform: transformar(nuevo) },
      ]);
    else animaciones.get(estado.linea)?.cancel();
    estado.posicion = nuevo;
    estado.elegido = elegido;
  }
  function resultados(grupo) {
    const seccion = grupo.closest('section');
    const visibles =
      seccion?.querySelectorAll(
        '.corte:not([hidden]), .servicio:not([hidden]), .categoria:not([hidden]), .clase:not([hidden])',
      ) ?? [];
    let indice = 0;
    for (const elemento of visibles) {
      const foto = elemento.querySelector('.movimiento-foto');
      const titulo = elemento.querySelector('.clase__tipo');
      if (foto)
        animar(
          foto,
          [
            { opacity: 0.45, scale: '1.025' },
            { opacity: 1, scale: '1' },
          ],
          tiempo,
          indice * 20,
        );
      else if (titulo)
        animar(titulo, [{ translate: '0 5px' }, { translate: '0 0' }], tiempo, indice * 20);
      if (++indice >= 8) break;
    }
  }

  const resize = new ResizeObserver(() => {
    for (const [grupo, estado] of grupos) if (estado.linea) riel(grupo, false);
  });
  document.querySelectorAll('[data-filtros], .fases').forEach((grupo) => {
    grupos.set(grupo, {
      elegido: grupo.querySelector('[aria-pressed="true"]'),
      posicion: null,
      linea: null,
    });
    resize.observe(grupo);
  });
  const observador = new MutationObserver((registros) => {
    const cambiados = new Set(registros.map((r) => r.target));
    const filtros = new Set();
    for (const boton of cambiados) {
      const actual = boton.getAttribute('aria-pressed');
      if (actual === estados.get(boton)) continue;
      estados.set(boton, actual);
      const grupo = boton.closest('[data-filtros], .fases');
      if (grupo) filtros.add(grupo);
      else {
        const tarjeta = boton.closest('.barbero, .clase');
        if (tarjeta) {
          sello(tarjeta, actual === 'true');
          pulso(tarjeta);
        }
      }
    }
    for (const grupo of filtros) {
      riel(grupo);
      if (grupo.matches('[data-filtros]')) resultados(grupo);
    }
  });
  document.querySelectorAll('[data-filtros], .fases, .barberos__lista, .semana').forEach((raiz) => {
    raiz
      .querySelectorAll('[aria-pressed]')
      .forEach((b) => estados.set(b, b.getAttribute('aria-pressed')));
    observador.observe(raiz, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-pressed'],
    });
  });
  document
    .querySelectorAll(
      'select, input[type="date"], input[type="time"], input[type="radio"], input[type="checkbox"]',
    )
    .forEach((c) => valores.set(c, `${c.value}/${c.checked ?? ''}`));

  document.addEventListener('change', (e) => {
    campo(e.target);
    for (const control of camposMarcados) {
      if (!control.value || !control.validity.valid)
        control.closest('.campo')?.setAttribute('data-seleccion-activa', 'false');
    }
    if (e.target.matches('#turno-corte, #turno-dia')) pulso(document.getElementById('turno-hora'));
    if (e.target.matches('#cita-servicio, #cita-dia, #cita-hora'))
      pulso(document.querySelector('[data-progreso]'));
    if (e.target.matches('#vacunas-especie, #vacunas-nacimiento'))
      pulso(document.querySelector('.ficha-mascota'));
  });
  document.addEventListener('seleccion-confirmada', (e) => {
    const { destino } = e.detail;
    requestAnimationFrame(() => {
      if (destino?.matches('select, input')) campo(destino, true);
      else pulso(destino);
    });
  });
  document.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton || !['agregar', 'sumar', 'quitar'].includes(boton.dataset.accion)) return;
    const item = boton.closest('[data-plato], [data-id]');
    const id = item?.dataset.plato ?? item?.dataset.id;
    requestAnimationFrame(() => {
      const dialogo = document.querySelector('[data-comanda][open]');
      if (dialogo && id) {
        pulso(
          dialogo.querySelector(`[data-id="${CSS.escape(id)}"] .cantidad__valor`) ??
            dialogo.querySelector('[data-vacia]'),
        );
      } else {
        pulso(
          id ? document.getElementById(`plato-${id}`)?.querySelector('.cantidad__valor') : null,
        );
        pulso(document.querySelector('[data-barra]'));
      }
    });
  });
  document.fonts.ready.then(() => {
    for (const [grupo, estado] of grupos) if (estado.linea) riel(grupo, false);
  });
  reducido.addEventListener('change', cancelar);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelar();
  });
}
