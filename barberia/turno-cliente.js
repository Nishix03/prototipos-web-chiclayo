// Navegador: el turno de la barbería. Al elegir el día, solo quedan los barberos que atienden
// ese día y las horas en que el local está abierto y el corte elegido alcanza a terminar.
// «Pedir este corte» en la lista deja ese corte elegido en el turno.
import { diaDeFecha, hoyEnLima, ahoraEnLima, nombreDia } from '../core/horario.js';

const aMinutos = (hhmm) => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));

export function iniciarTurno() {
  const form = document.getElementById('form-turno');
  if (!form) return;
  const datos = JSON.parse(document.getElementById('datos-turno').textContent);
  const { corte, dia, barbero, hora } = {
    corte: form.elements['turno-corte'],
    dia: form.elements['turno-dia'],
    barbero: form.elements['turno-barbero'],
    hora: form.elements['turno-hora'],
  };
  dia.min = hoyEnLima();

  const minutosDelCorte = () => datos.cortes[corte.value] ?? datos.paso;

  function filtrar() {
    const d = dia.value ? diaDeFecha(dia.value) : null;
    // Barberos: solo los que atienden ese día
    for (const opcion of barbero.options) {
      if (!opcion.value) continue;
      opcion.hidden = opcion.disabled = d !== null && !datos.barberos[opcion.value].includes(d);
    }
    if (barbero.selectedOptions[0]?.disabled) barbero.value = '';
    // Horas: dentro del horario del día, que el corte termine antes de cerrar y, si es hoy,
    // todavía no pasadas
    const rangos = d ? datos.horario[d] : null;
    const esHoy = dia.value === hoyEnLima();
    const ahora = ahoraEnLima().minutos;
    for (const opcion of hora.options) {
      if (!opcion.value) continue;
      const m = aMinutos(opcion.value);
      const cabe =
        !rangos ||
        rangos.some(([a, b]) => m >= aMinutos(a) && m + minutosDelCorte() <= aMinutos(b));
      opcion.hidden = opcion.disabled = !cabe || (esHoy && m <= ahora);
    }
    if (hora.selectedOptions[0]?.disabled) hora.value = '';
    // Día sin atención: el error lo dice con el nombre del día
    dia.setCustomValidity(
      d && !datos.horario[d].length ? `Los ${nombreDia(d)} no atendemos. Elige otro día.` : '',
    );
  }

  form.addEventListener('change', (e) => {
    if ([corte, dia].includes(e.target)) filtrar();
  });
  filtrar();

  // «Pedir este corte»: el corte queda elegido y el foco va al siguiente dato, el día
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('[data-pedir]');
    if (!enlace) return;
    e.preventDefault();
    corte.value = enlace.dataset.pedir;
    filtrar();
    document.getElementById('turno').scrollIntoView({ block: 'start' });
    dia.focus({ preventScroll: true });
  });
}

/** Filtros de la lista de cortes por estilo, con el filtro en la URL (?estilo=degradado). */
export function iniciarFiltrosCortes() {
  const filtros = document.querySelector('[data-filtros]');
  if (!filtros) return;
  const cortes = [...document.querySelectorAll('[data-corte]')];
  function filtrar(estilo) {
    const existe = estilo === 'todo' || cortes.some((c) => c.dataset.estilo === estilo);
    const elegido = existe ? estilo : 'todo';
    filtros
      .querySelectorAll('[data-filtro]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === elegido)));
    cortes.forEach((c) => (c.hidden = elegido !== 'todo' && c.dataset.estilo !== elegido));
    return elegido;
  }
  filtros.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-filtro]');
    if (!boton) return;
    const elegido = filtrar(boton.dataset.filtro);
    const url = new URL(location.href);
    if (elegido === 'todo') url.searchParams.delete('estilo');
    else url.searchParams.set('estilo', elegido);
    history.replaceState(null, '', url);
  });
  filtrar(new URLSearchParams(location.search).get('estilo') ?? 'todo');
}
