// Navegador: lo que vive del gimnasio.
// - Horario de clases: filtro por tipo (en la URL, ?clase=box) y, con la hora de Lima, la clase
//   en curso y la siguiente marcadas; la portada dice cuál es. Se revisa cada 30 s.
// - Promoción: cuenta regresiva hasta la fecha de fin; al terminar, la sección desaparece.
// - IMC: el cálculo con la referencia de la OMS, que invita a la clase de prueba.
import { ahoraEnLima } from '../core/horario.js';

const ORDEN = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const aMinutos = (hhmm) => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));
const hora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

/** Minutos desde el lunes 0:00 (para comparar clases de distintos días). */
const enSemana = (dia, minutos) => ORDEN.indexOf(dia) * 1440 + minutos;

export function iniciarClases() {
  const clases = [...document.querySelectorAll('[data-clase]')];
  if (!clases.length) return;
  const ahoraTexto = document.querySelector('[data-ahora]');
  const filtros = document.querySelector('[data-filtros]');
  let tipo = 'todo';

  function marcar() {
    const { dia, minutos } = ahoraEnLima();
    for (const d of document.querySelectorAll('.dia'))
      d.toggleAttribute('data-hoy', d.dataset.dia === dia);
    const ya = enSemana(dia, minutos);
    let enCurso = null;
    let siguiente = null;
    let mejor = Infinity;
    for (const c of clases) {
      c.removeAttribute('data-estado');
      c.querySelector('[data-marca]').textContent = '';
      if (c.hidden) continue;
      const empieza = enSemana(c.closest('[data-dia]').dataset.dia, aMinutos(c.dataset.inicio));
      const termina = empieza + Number(c.dataset.minutos);
      if (empieza <= ya && ya < termina) enCurso = c;
      // La siguiente: la que empieza antes después de ahora (la semana da la vuelta)
      const falta = (empieza - ya + 7 * 1440) % (7 * 1440);
      if (falta > 0 && falta < mejor) [mejor, siguiente] = [falta, c];
    }
    for (const [c, estado, texto] of [
      [enCurso, 'en-curso', 'En curso'],
      [siguiente, 'siguiente', 'Siguiente'],
    ]) {
      if (!c) continue;
      c.dataset.estado = estado;
      c.querySelector('[data-marca]').textContent = texto;
    }
    if (!ahoraTexto) return;
    const describir = (c) =>
      `${c.querySelector('.clase__tipo').textContent} con ${c.querySelector('.clase__entrenador').textContent}`;
    if (enCurso) {
      const fin = aMinutos(enCurso.dataset.inicio) + Number(enCurso.dataset.minutos);
      ahoraTexto.textContent = `Ahora: ${describir(enCurso)}, hasta las ${hora(fin)}.`;
    } else if (siguiente) {
      const d = siguiente.closest('[data-dia]').dataset.dia;
      const cuando =
        d === dia
          ? 'hoy'
          : `el ${siguiente.closest('[data-dia]').querySelector('.dia__nombre').textContent}`;
      ahoraTexto.textContent = `Próxima clase: ${describir(siguiente)}, ${cuando} a las ${hora(aMinutos(siguiente.dataset.inicio))}.`;
    }
  }

  function filtrar(elegido) {
    const existe = elegido === 'todo' || clases.some((c) => c.dataset.tipo === elegido);
    tipo = existe ? elegido : 'todo';
    filtros
      ?.querySelectorAll('[data-filtro]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === tipo)));
    clases.forEach((c) => (c.hidden = tipo !== 'todo' && c.dataset.tipo !== tipo));
    marcar();
  }

  filtros?.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-filtro]');
    if (!boton) return;
    filtrar(boton.dataset.filtro);
    const url = new URL(location.href);
    if (tipo === 'todo') url.searchParams.delete('clase');
    else url.searchParams.set('clase', tipo);
    history.replaceState(null, '', url);
  });
  filtrar(new URLSearchParams(location.search).get('clase') ?? 'todo');
  setInterval(marcar, 30_000);
}

export function iniciarPromocion() {
  const seccion = document.querySelector('[data-promocion]');
  if (!seccion) return;
  const fin = new Date(seccion.dataset.promocion).getTime();
  const cuenta = seccion.querySelector('[data-cuenta]');
  const partes = (ms) => {
    const min = Math.floor(ms / 60_000);
    return [Math.floor(min / 1440), Math.floor((min % 1440) / 60), min % 60];
  };
  function contar() {
    const falta = fin - Date.now();
    if (falta <= 0) {
      seccion.hidden = true;
      clearInterval(reloj);
      return;
    }
    const [d, h, m] = partes(falta);
    cuenta.textContent = `${d} d · ${String(h).padStart(2, '0')} h · ${String(m).padStart(2, '0')} min`;
  }
  const reloj = setInterval(contar, 15_000);
  contar();
}

// Referencia de la OMS para adultos
const RANGOS = [
  [18.5, 'bajo peso', 'menos de 18.5'],
  [25, 'normal', 'de 18.5 a 24.9'],
  [30, 'sobrepeso', 'de 25 a 29.9'],
  [Infinity, 'obesidad', '30 o más'],
];

export function iniciarImc() {
  const form = document.querySelector('[data-imc]');
  if (!form) return;
  const resultado = document.querySelector('[data-imc-resultado]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const peso = form.querySelector('#imc-peso');
    const talla = form.querySelector('#imc-talla');
    const invalido = [peso, talla].find((c) => !c.checkValidity());
    if (invalido) {
      resultado.textContent =
        invalido === peso
          ? 'Escribe tu peso en kilos, entre 20 y 300.'
          : 'Escribe tu talla en centímetros, entre 100 y 230.';
      invalido.focus();
      return;
    }
    const valor = Number(peso.value) / (Number(talla.value) / 100) ** 2;
    const [, nombre, rango] = RANGOS.find(([max]) => valor < max);
    const numero = valor.toLocaleString('es-PE', { maximumFractionDigits: 1 });
    resultado.replaceChildren(
      `Tu IMC es ${numero}: según la OMS, está en el rango «${nombre}» (${rango}). `,
      Object.assign(document.createElement('a'), {
        href: '#prueba',
        textContent: 'Pide tu clase de prueba y armamos tu plan',
      }),
    );
  });
}
