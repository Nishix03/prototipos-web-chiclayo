import { html } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { resumenHorario } from '../../core/horario.js';

/** Reservar mesa: formulario accesible del núcleo que termina en WhatsApp. */
export function reservas(negocio) {
  const { textos, reservas: conf, contacto, horario } = negocio;
  // Ayuda corta: solo qué días se cierra. Si eligen mal, el error da el horario de ese día.
  const cerrados = resumenHorario(horario)
    .filter((g) => g.horas === 'Cerrado')
    .map((g) => g.dias);
  const ayudaFecha = cerrados.length ? `Cerrado: ${cerrados.join(', ')}.` : undefined;
  const campos = [
    campo({
      id: 'reserva-fecha',
      etiqueta: 'Fecha',
      tipo: 'date',
      requerido: true,
      ayuda: ayudaFecha,
    }),
    campo({
      id: 'reserva-hora',
      etiqueta: 'Hora',
      tipo: 'time',
      requerido: true,
      atributos: { step: '900' },
    }),
    campo({
      id: 'reserva-personas',
      etiqueta: 'Personas',
      tipo: 'number',
      requerido: true,
      atributos: { min: '1', max: String(conf.maxPersonas), inputmode: 'numeric' },
    }),
    campo({
      id: 'reserva-nombre',
      etiqueta: 'Nombre para la reserva',
      requerido: true,
      atributos: { autocomplete: 'name' },
    }),
  ];

  return html`
    <section class="reservas contenedor" id="reservas" aria-labelledby="reservas-titulo">
      <div class="reservas__texto">
        <h2 class="reservas__titulo" id="reservas-titulo">Reservar mesa</h2>
        <p>${textos.introReserva}</p>
      </div>
      ${formularioWhatsapp({
        id: 'form-reserva',
        saludo: 'Hola, quiero reservar una mesa:',
        boton: 'Reservar por WhatsApp',
        telefono: contacto.whatsapp,
        campos,
      })}
    </section>
  `;
}
