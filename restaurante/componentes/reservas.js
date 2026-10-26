import { html } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { nombreDia } from '../../core/horario.js';

/** 'sábado' → 'sábados'; 'lunes' se queda igual */
const plural = (dia) => (dia.endsWith('s') ? dia : `${dia}s`);

/** "Los lunes no abrimos." / "Los lunes y martes no abrimos." */
export function textoDiasCerrados(horario) {
  const cerrados = Object.keys(horario)
    .filter((dia) => !horario[dia].length)
    .map((dia) => plural(nombreDia(dia)));
  if (!cerrados.length) return undefined;
  const lista =
    cerrados.length > 1 ? `${cerrados.slice(0, -1).join(', ')} y ${cerrados.at(-1)}` : cerrados[0];
  return `Los ${lista} no abrimos.`;
}

/** Reservar mesa: formulario accesible del núcleo que termina en WhatsApp. */
export function reservas(negocio) {
  const { textos, reservas: conf, contacto, horario } = negocio;
  // Ayuda corta: solo qué días se cierra. Si eligen mal, el error da el horario de ese día.
  const ayudaFecha = textoDiasCerrados(horario);
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
        confirmacion: 'Abrimos WhatsApp con tu reserva lista. Solo falta que la envíes.',
        telefono: contacto.whatsapp,
        campos,
      })}
    </section>
  `;
}
