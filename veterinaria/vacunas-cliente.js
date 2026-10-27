// Navegador: el calendario de vacunas y la cita de la veterinaria.
// - Vacunas: con la especie y la fecha de nacimiento, cada dosis muestra su fecha, cuáles ya
//   pasaron y cuál es la próxima. «Agendar esta vacuna» la deja lista en la cita.
// - Cita: el domingo solo se atiende en la mañana; la tarde de un domingo se avisa con un error.
import { diaDeFecha, hoyEnLima } from '../core/horario.js';

const DIA_MS = 86_400_000;
const formato = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const fechaUtc = (iso) => new Date(`${iso}T00:00:00Z`);

export function iniciarVacunas() {
  const caja = document.querySelector('[data-vacunas]');
  if (!caja) return;
  const especie = document.getElementById('vacunas-especie');
  const nacimiento = document.getElementById('vacunas-nacimiento');
  const resumen = document.querySelector('[data-vacunas-resumen]');
  const tablas = [...document.querySelectorAll('.vacunas__tabla')];
  nacimiento.max = hoyEnLima();

  function actualizar() {
    const tabla = tablas.find((t) => t.dataset.especie === especie.value);
    tablas.forEach((t) => (t.hidden = t !== tabla));
    const hoy = fechaUtc(hoyEnLima());
    const nacio = nacimiento.value ? fechaUtc(nacimiento.value) : null;
    let proxima = null;
    for (const fila of tabla.querySelectorAll('tr[data-semanas]')) {
      const celda = fila.querySelector('[data-fecha]');
      delete fila.dataset.estado;
      if (!nacio) {
        celda.textContent = '—';
        continue;
      }
      const fecha = new Date(nacio.getTime() + Number(fila.dataset.semanas) * 7 * DIA_MS);
      const paso = fecha < hoy;
      if (!paso && !proxima) proxima = { fila, fecha };
      fila.dataset.estado = paso ? 'paso' : proxima?.fila === fila ? 'proxima' : 'despues';
      celda.textContent = `${formato.format(fecha)}${paso ? ' (ya pasó)' : ''}`;
    }
    resumen.replaceChildren();
    if (!nacio) return;
    if (!proxima) {
      resumen.textContent =
        'Ya pasaron todas las dosis de la tabla. En la consulta revisamos su carné y sus refuerzos.';
      return;
    }
    const vacuna = proxima.fila.children[1].textContent;
    const agendar = Object.assign(document.createElement('a'), {
      href: '#cita',
      textContent: 'Agendar esta vacuna',
    });
    agendar.dataset.agendarVacuna = '';
    resumen.append(`La próxima: ${vacuna}, el ${formato.format(proxima.fecha)}. `, agendar);
  }

  caja.addEventListener('change', actualizar);
  // «Agendar esta vacuna»: motivo y especie quedan elegidos en la cita y el foco va al nombre
  resumen.addEventListener('click', (e) => {
    if (!e.target.closest('[data-agendar-vacuna]')) return;
    e.preventDefault();
    const form = document.getElementById('form-cita');
    form.elements['cita-motivo'].value = 'vacuna';
    form.elements['cita-especie'].value = especie.selectedOptions[0].text;
    document.getElementById('cita').scrollIntoView({ block: 'start' });
    form.elements['cita-mascota'].focus({ preventScroll: true });
  });
  actualizar();
}

export function iniciarCita() {
  const form = document.getElementById('form-cita');
  if (!form) return;
  const { 'cita-dia': dia, 'cita-turno': turno } = form.elements;
  dia.min = hoyEnLima();
  const revisar = () =>
    turno.setCustomValidity(
      dia.value && diaDeFecha(dia.value) === 'dom' && turno.value === 'Tarde'
        ? 'Los domingos atendemos solo en la mañana. Elige la mañana u otro día.'
        : '',
    );
  form.addEventListener('change', (e) => {
    if ([dia, turno].includes(e.target)) revisar();
  });
}
