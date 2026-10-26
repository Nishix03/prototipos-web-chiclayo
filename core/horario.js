// Horario de atención en hora de Lima.
//
// La parte pura (estadoHorario, resumenHorario) corre en el build y en el navegador.
// La parte de DOM (iniciarIndicadorHorario) solo en el navegador: enriquece el HTML
// con "Abierto ahora / Cerrado", que no puede calcularse al construir porque depende
// de la hora en que se visita la página.

const ZONA = 'America/Lima';
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab']; // mismo orden que Date#getDay
const ORDEN_SEMANA = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const NOMBRE_DIA = {
  lun: 'lunes',
  mar: 'martes',
  mie: 'miércoles',
  jue: 'jueves',
  vie: 'viernes',
  sab: 'sábado',
  dom: 'domingo',
};
const ABREV_DIA = {
  lun: 'Lun',
  mar: 'Mar',
  mie: 'Mié',
  jue: 'Jue',
  vie: 'Vie',
  sab: 'Sáb',
  dom: 'Dom',
};

const formatoLima = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Día y minuto del día en Lima, sin importar la zona horaria del dispositivo. */
export function ahoraEnLima(fecha = new Date()) {
  const partes = Object.fromEntries(formatoLima.formatToParts(fecha).map((p) => [p.type, p.value]));
  const indice = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday);
  return { dia: DIAS[indice], minutos: Number(partes.hour) * 60 + Number(partes.minute) };
}

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** 'lun' → 'lunes' */
export const nombreDia = (dia) => NOMBRE_DIA[dia];

/** '09:00' → '9:00', como se escribe en Perú. */
export const formatoHora = (hhmm) => hhmm.replace(/^0/, '');

const diaAnterior = (dia) => DIAS[(DIAS.indexOf(dia) + 6) % 7];
const diaSiguiente = (dia, n = 1) => DIAS[(DIAS.indexOf(dia) + n) % 7];

/** '2026-11-03' → 'mar'. La fecha de un <input type="date"> no tiene zona horaria. */
export function diaDeFecha(fechaIso) {
  const [a, m, d] = fechaIso.split('-').map(Number);
  return DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
}

/** Hoy en Lima como 'AAAA-MM-DD' (para el min de un <input type="date">). */
export function hoyEnLima(fecha = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(fecha);
}

/** ¿El negocio atiende ese día a esa hora? Considera los rangos que cruzan la medianoche. */
export function atiendeA(horario, dia, hhmm) {
  const m = aMinutos(hhmm);
  return horario[dia].some(([inicio, fin]) => {
    const a = aMinutos(inicio);
    const b = aMinutos(fin);
    return b > a ? m >= a && m < b : m >= a;
  });
}

/**
 * ¿Está abierto en este momento?
 * Un rango cuyo cierre es menor o igual que su apertura cruza la medianoche ('18:00'–'02:00').
 * @returns {{abierto: true, cierra: string} | {abierto: false, abre: {dia: string, hora: string, enDias: number} | null}}
 */
export function estadoHorario(horario, fecha = new Date()) {
  const { dia, minutos } = ahoraEnLima(fecha);

  for (const [inicio, fin] of horario[dia]) {
    const a = aMinutos(inicio);
    const b = aMinutos(fin);
    const cruza = b <= a;
    if ((!cruza && minutos >= a && minutos < b) || (cruza && minutos >= a)) {
      return { abierto: true, cierra: fin };
    }
  }
  // La madrugada de hoy puede pertenecer a un rango que empezó ayer
  for (const [inicio, fin] of horario[diaAnterior(dia)]) {
    if (aMinutos(fin) <= aMinutos(inicio) && minutos < aMinutos(fin)) {
      return { abierto: true, cierra: fin };
    }
  }

  // Cerrado: buscar la próxima apertura (hoy más tarde o en los próximos 7 días)
  for (let enDias = 0; enDias <= 7; enDias++) {
    const d = diaSiguiente(dia, enDias);
    const proximo = horario[d]
      .map(([inicio]) => inicio)
      .filter((inicio) => enDias > 0 || aMinutos(inicio) > minutos)
      .sort()[0];
    if (proximo) return { abierto: false, abre: { dia: d, hora: proximo, enDias } };
  }
  return { abierto: false, abre: null };
}

/** Frase para el indicador: "Abierto ahora · cierra a las 18:00". */
export function textoEstado(estado) {
  if (estado.abierto) return `Abierto ahora · cierra a las ${formatoHora(estado.cierra)}`;
  if (!estado.abre) return 'Cerrado';
  const { dia, hora, enDias } = estado.abre;
  const cuando = enDias === 0 ? 'hoy' : enDias === 1 ? 'mañana' : `el ${NOMBRE_DIA[dia]}`;
  return `Cerrado · abre ${cuando} a las ${formatoHora(hora)}`;
}

/**
 * Agrupa días seguidos con el mismo horario para la tabla de la página:
 * [{ dias: 'Lun – Vie', horas: '9:00 – 13:00, 15:00 – 19:00' }, { dias: 'Dom', horas: 'Cerrado' }]
 */
export function resumenHorario(horario) {
  const textoDia = (d) =>
    horario[d].length
      ? horario[d].map(([a, b]) => `${formatoHora(a)} – ${formatoHora(b)}`).join(', ')
      : 'Cerrado';

  const grupos = [];
  for (const d of ORDEN_SEMANA) {
    const horas = textoDia(d);
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.horas === horas) ultimo.hasta = d;
    else grupos.push({ desde: d, hasta: d, horas });
  }
  return grupos.map(({ desde, hasta, horas }) => ({
    dias: desde === hasta ? ABREV_DIA[desde] : `${ABREV_DIA[desde]} – ${ABREV_DIA[hasta]}`,
    horas,
  }));
}

/**
 * Navegador: rellena cada [data-estado-horario] con el estado actual y lo refresca cada minuto.
 * Lee el horario de la isla de datos <script type="application/json" id="datos-negocio">.
 */
export function iniciarIndicadorHorario() {
  const indicadores = document.querySelectorAll('[data-estado-horario]');
  const datos = document.getElementById('datos-negocio');
  if (!indicadores.length || !datos) return;

  const { horario } = JSON.parse(datos.textContent);
  const actualizar = () => {
    const estado = estadoHorario(horario);
    indicadores.forEach((el) => {
      el.querySelector('[data-estado-texto]').textContent = textoEstado(estado);
      el.dataset.abierto = String(estado.abierto);
      el.hidden = false;
    });
  };
  actualizar();
  setInterval(actualizar, 60_000);
}
