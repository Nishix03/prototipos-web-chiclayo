// Mejoras en el navegador para el restaurante. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { iniciarCarrito } from './carrito.js';
import { iniciarReservas } from './reservas-cliente.js';
import { iniciarDescargaQr } from './qr-cliente.js';
import { iniciarPase } from './escena/cliente.js';

const mensajes = {};
seguro('carrito', () => {
  const carrito = iniciarCarrito();
  if (carrito) mensajes['form-comanda'] = carrito.mensaje;
});
seguro('reservas', iniciarReservas);
seguro('descarga del QR', iniciarDescargaQr);
seguro('escena del pase', iniciarPase);
iniciarNucleo({ mensajes });
