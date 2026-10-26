// Navegador: el formulario de reservas valida contra el horario real del negocio.
// La regla está en negocio.json (horario), no repetida aquí: si cambia el horario, la
// validación cambia sola.

import { atiendeA, diaDeFecha, hoyEnLima, nombreDia, formatoHora } from '../core/horario.js';

export function iniciarReservas() {
  const form = document.getElementById('form-reserva');
  if (!form) return;
  const { horario } = JSON.parse(document.getElementById('datos-negocio').textContent);
  const fecha = form.elements['reserva-fecha'];
  const hora = form.elements['reserva-hora'];
  fecha.min = hoyEnLima();

  function comprobar() {
    fecha.setCustomValidity('');
    hora.setCustomValidity('');
    if (!fecha.value) return;
    const dia = diaDeFecha(fecha.value);
    if (!horario[dia].length) {
      const nombre = nombreDia(dia);
      fecha.setCustomValidity(
        `Los ${nombre.endsWith('s') ? nombre : `${nombre}s`} no abrimos. Elige otra fecha.`,
      );
      return;
    }
    if (hora.value && !atiendeA(horario, dia, hora.value)) {
      const rangos = horario[dia]
        .map(([a, b]) => `de ${formatoHora(a)} a ${formatoHora(b)}`)
        .join(' y ');
      hora.setCustomValidity(`A esa hora no atendemos. Ese día abrimos ${rangos}.`);
    }
  }

  // Antes de que core/formulario-whatsapp.js valide (fase de captura)
  form.addEventListener('submit', comprobar, true);
  form.addEventListener('change', comprobar);
}
