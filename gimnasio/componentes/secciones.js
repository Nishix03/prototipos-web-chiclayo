import { html } from '../../core/componentes/html.js';
import { campo, formularioWhatsapp } from '../../core/componentes/formulario.js';
import { soles } from '../../core/dinero.js';
import { resumenHorario } from '../../core/horario.js';

/**
 * Planes como una tabla de comparación (no tarjetas iguales): precio total, cuánto sale por
 * mes y cuánto se ahorra frente a pagar mes a mes. El ahorro se calcula aquí, de los precios.
 */
export function planes(negocio) {
  const { planes: lista, textos } = negocio;
  const base = Math.min(...lista.map((p) => p.precio / p.meses));
  const mensual = lista.find((p) => p.meses === 1)?.precio ?? base;
  return html`
    <section class="planes" id="planes" aria-labelledby="planes-titulo">
      <h2 class="seccion-titulo" id="planes-titulo" data-armar>Planes y precios</h2>
      <p class="seccion-intro">${textos.introPlanes}</p>
      <table class="planes__tabla">
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Pagas</th>
            <th scope="col">Por mes</th>
            <th scope="col">Ahorras</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map((p) => {
            const ahorro = Math.round(mensual * p.meses - p.precio);
            return html`
              <tr>
                <th scope="row">${p.nombre}</th>
                <td>${soles(p.precio)}</td>
                <td>${soles(Math.round(p.precio / p.meses))}</td>
                <td class="planes__ahorro">${ahorro > 0 ? soles(ahorro) : '—'}</td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    </section>
  `;
}

/**
 * La promoción con cuenta regresiva (componente propio del rubro). Sin JavaScript dice la fecha
 * de fin; con JavaScript (clases-cliente.js) cuenta días, horas y minutos, y desaparece al
 * terminar.
 */
export function promocion(negocio) {
  const { promocion: p } = negocio;
  const fecha = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'America/Lima',
  }).format(new Date(p.fin));
  return html`
    <section class="promocion" aria-labelledby="promocion-titulo" data-promocion="${p.fin}">
      <h2 class="promocion__titulo" id="promocion-titulo">${p.titulo}</h2>
      <p>${p.texto}</p>
      <p class="promocion__fin">Termina el ${fecha}.</p>
      <p class="promocion__cuenta" data-cuenta aria-hidden="true"></p>
    </section>
  `;
}

/** Calculadora de IMC: una referencia general que invita a la clase de prueba. */
export function imc(negocio) {
  return html`
    <section class="imc" id="imc" aria-labelledby="imc-titulo">
      <h2 class="seccion-titulo" id="imc-titulo" data-armar>Calcula tu IMC</h2>
      <p class="seccion-intro">${negocio.textos.introImc}</p>
      <form class="imc__form" data-imc novalidate>
        <div class="campo">
          <label class="campo__etiqueta" for="imc-peso">Peso (kg)</label>
          <input
            id="imc-peso"
            type="number"
            inputmode="decimal"
            min="20"
            max="300"
            step="0.1"
            required
          />
        </div>
        <div class="campo">
          <label class="campo__etiqueta" for="imc-talla">Talla (cm)</label>
          <input id="imc-talla" type="number" inputmode="numeric" min="100" max="230" required />
        </div>
        <button class="imc__calcular" type="submit">Calcular</button>
      </form>
      <p class="imc__resultado" data-imc-resultado aria-live="polite"></p>
    </section>
  `;
}

export function entrenadores(negocio) {
  return html`
    <section class="entrenadores" aria-labelledby="entrenadores-titulo">
      <h2 class="seccion-titulo" id="entrenadores-titulo" data-armar>Entrenadores</h2>
      <ul class="entrenadores__lista" role="list">
        ${negocio.entrenadores.map(
          (e) => html`
            <li class="entrenador">
              <h3 class="entrenador__nombre">${e.nombre}</h3>
              <p>${e.especialidad}</p>
            </li>
          `,
        )}
      </ul>
    </section>
  `;
}

/** Clase de prueba gratis: termina en WhatsApp. */
export function prueba(negocio) {
  const { tiposClase, contacto, textos } = negocio;
  const campos = [
    campo({
      id: 'prueba-nombre',
      etiqueta: 'Tu nombre',
      requerido: true,
      atributos: { autocomplete: 'given-name' },
    }),
    campo({
      id: 'prueba-clase',
      etiqueta: 'Clase que quieres probar',
      tipo: 'select',
      requerido: true,
      opciones: [...tiposClase.map((t) => t.nombre), 'Sala de máquinas'],
    }),
    campo({
      id: 'prueba-objetivo',
      etiqueta: 'Qué buscas',
      tipo: 'select',
      requerido: true,
      opciones: ['Ganar fuerza', 'Mejorar mi resistencia', 'Moverme más', 'Otra cosa'],
    }),
    campo({
      id: 'prueba-horario',
      etiqueta: 'Horario preferido',
      tipo: 'select',
      requerido: true,
      opciones: ['Mañana', 'Mediodía', 'Noche'],
    }),
  ];
  return html`
    <section class="prueba" id="prueba" aria-labelledby="prueba-titulo">
      <div>
        <h2 class="seccion-titulo" id="prueba-titulo" data-armar>Clase de prueba gratis</h2>
        <p class="seccion-intro">${textos.introPrueba}</p>
      </div>
      ${formularioWhatsapp({
        id: 'form-prueba',
        saludo: 'Hola, quiero mi clase de prueba gratis:',
        boton: 'Pedir mi clase por WhatsApp',
        confirmacion: 'Abrimos WhatsApp con tu pedido listo. Solo falta que lo envíes.',
        telefono: contacto.whatsapp,
        campos,
        clase: 'prueba__ficha',
      })}
    </section>
  `;
}

export function horario(negocio) {
  return html`
    <section class="horario-semana" id="horario" aria-labelledby="horario-titulo">
      <h2 class="seccion-titulo" id="horario-titulo" data-armar>Horario</h2>
      <dl class="horario-semana__dias">
        ${resumenHorario(negocio.horario).map(
          ({ dias, horas }) =>
            html`<div>
              <dt>${dias}</dt>
              <dd>${horas}</dd>
            </div>`,
        )}
      </dl>
    </section>
  `;
}
