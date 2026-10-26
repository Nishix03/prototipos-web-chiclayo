// Navegador: valida los <form data-whatsapp> y abre WhatsApp con los datos como mensaje.
//
// Los mensajes de error se escriben junto a cada campo (no en una alerta) y el foco
// salta al primer campo con error, para que funcione igual con teclado y lector de pantalla.

import { enlaceWhatsapp, mensajeConDatos } from './whatsapp.js';

// Cada error dice cómo arreglarlo; los de rango usan el límite real del campo (min/max)
const MENSAJES = {
  valueMissing: () => 'Completa este dato para continuar.',
  rangeUnderflow: (c) => `Ingresa un número desde ${c.min}.`,
  rangeOverflow: (c) => `Ingresa un número hasta ${c.max}.`,
  typeMismatch: () => 'Revisa el formato.',
  patternMismatch: () => 'Revisa el formato.',
};
const CONFIRMACION = 'Abrimos WhatsApp con tu mensaje listo. Solo falta que lo envíes.';

/** Teléfono de WhatsApp del negocio, desde la isla de datos que escribe render.js. */
export function telefonoNegocio() {
  return JSON.parse(document.getElementById('datos-negocio').textContent).whatsapp;
}

function etiquetaDe(control) {
  if (control.dataset.etiqueta) return control.dataset.etiqueta;
  const label = control.form.querySelector(`label[for="${control.id}"]`);
  return label ? label.firstChild.textContent.trim() : control.name;
}

// La fecha de un <input type="date"> no tiene zona: se formatea en UTC para no correr el día
const formatoFecha = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

function valorLegible(control) {
  if (control.tagName === 'SELECT') return control.value ? control.selectedOptions[0].text : '';
  if (control.type === 'date' && control.value) {
    return formatoFecha.format(new Date(`${control.value}T00:00:00Z`));
  }
  return control.value.trim();
}

/** { 'Fecha': '12/11/2026', 'Personas': '4', … } con los campos que tienen valor. */
export function datosDeFormulario(form) {
  const datos = {};
  for (const control of form.elements) {
    if (!control.name || control.type === 'submit' || control.dataset.omitir !== undefined)
      continue;
    datos[etiquetaDe(control)] = valorLegible(control);
  }
  return datos;
}

function mostrarError(control, texto) {
  const error = document.getElementById(`${control.id}-error`);
  control.setAttribute('aria-invalid', String(Boolean(texto)));
  if (!error) return;
  error.textContent = texto;
  error.hidden = !texto;
}

/** Valida con la API nativa del navegador y escribe los errores en la página. */
export function validar(form) {
  let primero = null;
  for (const control of form.elements) {
    if (!control.willValidate) continue;
    const motivo = Object.keys(MENSAJES).find((m) => control.validity[m]);
    const texto = control.validity.customError
      ? control.validationMessage
      : (MENSAJES[motivo]?.(control) ?? '');
    mostrarError(control, control.validity.valid ? '' : texto);
    if (!control.validity.valid && !primero) primero = control;
  }
  primero?.focus();
  return !primero;
}

/**
 * Abre WhatsApp en otra pestaña y avisa en la región de estado del formulario.
 * Cada formulario puede decir su propia confirmación con data-confirmacion
 * ("…con tu pedido listo", "…con tu reserva lista").
 */
export function abrirWhatsapp(mensaje, form) {
  window.open(enlaceWhatsapp(telefonoNegocio(), mensaje), '_blank', 'noopener');
  const estado = form?.querySelector('.formulario__estado');
  if (estado) estado.textContent = form.dataset.confirmacion ?? CONFIRMACION;
}

/**
 * Conecta todos los formularios data-whatsapp de la página.
 * `armarMensaje` permite que una función estrella componga su propio mensaje (por ejemplo,
 * el pedido del restaurante); por defecto se usa saludo + etiqueta: valor.
 */
export function iniciarFormulariosWhatsapp(armarMensaje = {}) {
  document.querySelectorAll('form[data-whatsapp]').forEach((form) => {
    form.addEventListener('input', (e) => {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.validity.valid) {
        mostrarError(e.target, '');
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(form)) return;
      const propio = armarMensaje[form.id];
      const mensaje = propio
        ? propio(form)
        : mensajeConDatos(form.dataset.saludo, datosDeFormulario(form));
      abrirWhatsapp(mensaje, form);
    });
  });
}
