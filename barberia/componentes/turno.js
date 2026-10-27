import { html, crudo } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { soles } from '../../core/dinero.js';

const aMinutos = (hhmm) => hhmm.split(':').reduce((h, m) => Number(h) * 60 + Number(m));
const aHora = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/**
 * Todas las horas posibles de la semana, cada `paso` minutos. Sin JavaScript se ofrecen todas;
 * con JavaScript (turno-cliente.js) quedan solo las del día elegido que caben antes de cerrar.
 */
export function horasPosibles(horario, paso) {
  const minutos = new Set();
  for (const rangos of Object.values(horario)) {
    for (const [a, b] of rangos) {
      for (let m = aMinutos(a); m + paso <= aMinutos(b); m += paso) minutos.add(m);
    }
  }
  return [...minutos].sort((x, y) => x - y).map(aHora);
}

/**
 * La función estrella: «tu turno en la silla». Corte → día → barbero (solo los que atienden
 * ese día) → hora → nombre, y el pedido sale armado por WhatsApp.
 */
export function turno(negocio) {
  const { cortes, barberos, horario, contacto, textos, turno: conf } = negocio;
  const campos = [
    campo({
      id: 'turno-corte',
      etiqueta: 'Corte',
      tipo: 'select',
      requerido: true,
      opciones: cortes.map((c) => ({
        valor: c.id,
        texto: `${c.nombre} (${soles(c.precio)}, ${c.minutos} min)`,
      })),
    }),
    campo({ id: 'turno-dia', etiqueta: 'Día', tipo: 'date', requerido: true }),
    campo({
      id: 'turno-barbero',
      etiqueta: 'Barbero',
      tipo: 'select',
      requerido: true,
      ayuda: 'Solo aparecen los que atienden el día que elijas.',
      opciones: barberos.map((b) => ({ valor: b.id, texto: b.nombre })),
    }),
    campo({
      id: 'turno-hora',
      etiqueta: 'Hora',
      tipo: 'select',
      requerido: true,
      opciones: horasPosibles(horario, conf.minutosEntreTurnos),
    }),
    campo({
      id: 'turno-nombre',
      etiqueta: 'Tu nombre',
      requerido: true,
      atributos: { autocomplete: 'given-name' },
    }),
  ];
  // Isla de datos para turno-cliente.js («<» escapado: un dato no puede cerrar el <script>)
  const datos = JSON.stringify({
    paso: conf.minutosEntreTurnos,
    horario,
    cortes: Object.fromEntries(cortes.map((c) => [c.id, c.minutos])),
    barberos: Object.fromEntries(barberos.map((b) => [b.id, b.dias])),
  }).replace(/</g, '\\u003c');
  return html`
    <script type="application/json" id="datos-turno">
      ${crudo(datos)}
    </script>
    <section class="turno" id="turno" aria-labelledby="turno-titulo">
      <div class="turno__texto">
        <h2 class="seccion-titulo" id="turno-titulo" data-armar>Pide tu turno</h2>
        <p class="seccion-intro">${textos.introTurno}</p>
      </div>
      ${formularioWhatsapp({
        id: 'form-turno',
        saludo: 'Hola, quiero un turno:',
        boton: 'Pedir turno por WhatsApp',
        confirmacion: 'Abrimos WhatsApp con tu turno listo. Solo falta que lo envíes.',
        telefono: contacto.whatsapp,
        campos,
        clase: 'turno__ticket',
      })}
    </section>
  `;
}
