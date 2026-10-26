// Enlaces de WhatsApp con el mensaje ya escrito (https://faq.whatsapp.com/5913398998672934).
// Funciones puras: el build las usa para los enlaces fijos del HTML y el navegador
// para los mensajes que arma el cliente (pedidos, reservas) en la fase 2.

const CODIGO_PERU = '51';

/** '987 654 321' o '+51 987654321' → '51987654321' */
export function normalizarTelefono(telefono) {
  const digitos = String(telefono).replace(/\D/g, '');
  return digitos.startsWith(CODIGO_PERU) && digitos.length === 11 ? digitos : CODIGO_PERU + digitos;
}

/** Enlace wa.me que abre el chat con `mensaje` ya escrito. */
export function enlaceWhatsapp(telefono, mensaje = '') {
  const base = `https://wa.me/${normalizarTelefono(telefono)}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/**
 * Arma un mensaje en líneas a partir de un saludo y pares etiqueta/valor,
 * saltando los vacíos. Lo usarán los formularios de reserva:
 * mensajeConDatos('Hola, quiero reservar:', { Fecha: '12/11', Personas: 4 })
 */
export function mensajeConDatos(saludo, datos) {
  const lineas = Object.entries(datos)
    .filter(([, valor]) => valor !== '' && valor !== null && valor !== undefined)
    .map(([etiqueta, valor]) => `• ${etiqueta}: ${valor}`);
  return [saludo, ...lineas].join('\n');
}
