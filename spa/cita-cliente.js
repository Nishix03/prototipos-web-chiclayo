// Navegador: la cita del spa, un paso a la vez. «Continuar» valida solo el paso actual; el foco
// va siempre al paso nuevo. Al elegir el día quedan las franjas en que el servicio termina antes
// de cerrar (y, si es hoy, las que todavía no pasaron). «Reservar» en la carta deja el servicio
// elegido y abre el paso 2.
import { diaDeFecha, hoyEnLima, ahoraEnLima, nombreDia } from '../core/horario.js';

const aMinutos = (hhmm) => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));

function errorDe(control) {
  if (control.validity.customError) return control.validationMessage;
  if (control.validity.valueMissing) return 'Completa este dato para continuar.';
  if (control.validity.rangeUnderflow) return 'Elige un día desde hoy.';
  return control.validity.valid ? '' : 'Revisa el formato.';
}

/** Valida los controles de un paso y escribe los errores junto a cada uno. */
function pasoValido(paso) {
  let primero = null;
  for (const control of paso.querySelectorAll('input, select')) {
    if (!control.willValidate) continue;
    const texto = errorDe(control);
    const error = document.getElementById(`${control.id}-error`);
    control.setAttribute('aria-invalid', String(Boolean(texto)));
    if (error) {
      error.textContent = texto;
      error.hidden = !texto;
    }
    if (texto && !primero) primero = control;
  }
  primero?.focus();
  return !primero;
}

export function iniciarCita() {
  const form = document.getElementById('form-cita');
  if (!form) return;
  const datos = JSON.parse(document.getElementById('datos-cita').textContent);
  const pasos = [...form.querySelectorAll('[data-paso]')];
  const enviar = form.querySelector('button[type="submit"]');
  const progreso = document.querySelector('[data-progreso]');
  const resumen = form.querySelector('[data-resumen]');
  const { servicio, dia, hora } = {
    servicio: form.elements['cita-servicio'],
    dia: form.elements['cita-dia'],
    hora: form.elements['cita-hora'],
  };
  dia.min = hoyEnLima();
  form.classList.add('cita__ficha--pasos');
  let actual = 0;

  function mostrar(n, { enfocar = true } = {}) {
    actual = n;
    pasos.forEach((p, i) => (p.hidden = i !== n));
    enviar.hidden = n !== pasos.length - 1;
    form.closest('.cita').dataset.pasoActual = String(n + 1);
    progreso.textContent = `Paso ${n + 1} de ${pasos.length}`;
    if (n === pasos.length - 1) escribirResumen();
    if (enfocar) pasos[n].querySelector('input, select')?.focus();
  }

  function filtrar() {
    const d = dia.value ? diaDeFecha(dia.value) : null;
    const rangos = d ? datos.horario[d] : null;
    const esHoy = dia.value === hoyEnLima();
    const ahora = ahoraEnLima().minutos;
    const dura = datos.minutos[servicio.value] ?? datos.paso;
    for (const opcion of hora.options) {
      if (!opcion.value) continue;
      const m = aMinutos(opcion.value);
      const cabe = !rangos || rangos.some(([a, b]) => m >= aMinutos(a) && m + dura <= aMinutos(b));
      opcion.hidden = opcion.disabled = !cabe || (esHoy && m <= ahora);
    }
    if (hora.selectedOptions[0]?.disabled) hora.value = '';
    dia.setCustomValidity(
      d && !datos.horario[d].length ? `Los ${nombreDia(d)} no atendemos. Elige otro día.` : '',
    );
  }

  function escribirResumen() {
    const partes = [servicio.selectedOptions[0]?.text, dia.value && hora.value];
    if (!partes[0] || !partes[1]) return (resumen.textContent = '');
    const fecha = new Date(`${dia.value}T00:00:00Z`).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
    resumen.textContent = `Tu cita: ${partes[0]}, el ${fecha} a las ${hora.value}.`;
  }

  form.addEventListener('change', (e) => {
    if ([servicio, dia].includes(e.target)) filtrar();
  });
  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-siguiente]') && pasoValido(pasos[actual])) mostrar(actual + 1);
    if (e.target.closest('[data-volver]')) mostrar(actual - 1);
  });
  // Enter en un paso intermedio avanza en lugar de enviar el formulario a medias
  form.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || actual === pasos.length - 1 || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    if (pasoValido(pasos[actual])) mostrar(actual + 1);
  });

  // «Reservar» desde la carta o los paquetes: el servicio queda elegido y se abre el paso 2
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('[data-reservar]');
    if (!enlace) return;
    e.preventDefault();
    servicio.value = enlace.dataset.reservar;
    filtrar();
    document.getElementById('cita').scrollIntoView({ block: 'start' });
    mostrar(1);
  });

  filtrar();
  mostrar(0, { enfocar: false });
}

/** Filtros de la carta por categoría, con el filtro en la URL (?categoria=masajes). */
export function iniciarFiltrosServicios() {
  const filtros = document.querySelector('[data-filtros]');
  if (!filtros) return;
  const servicios = [...document.querySelectorAll('[data-servicio]')];
  function filtrar(categoria) {
    const existe = categoria === 'todo' || servicios.some((s) => s.dataset.categoria === categoria);
    const elegida = existe ? categoria : 'todo';
    filtros
      .querySelectorAll('[data-filtro]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === elegida)));
    servicios.forEach((s) => (s.hidden = elegida !== 'todo' && s.dataset.categoria !== elegida));
    return elegida;
  }
  filtros.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-filtro]');
    if (!boton) return;
    const elegida = filtrar(boton.dataset.filtro);
    const url = new URL(location.href);
    if (elegida === 'todo') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', elegida);
    history.replaceState(null, '', url);
  });
  filtrar(new URLSearchParams(location.search).get('categoria') ?? 'todo');
}
