// Mejoras en el navegador para el restaurante. Todo el contenido ya viene en el HTML.
import { iniciarNucleo, seguro } from '../core/cliente.js';
import { iniciarCarrito } from './carrito.js';
import { iniciarReservas } from './reservas-cliente.js';

const mensajes = {};
seguro('carrito', () => {
  const carrito = iniciarCarrito();
  if (carrito) mensajes['form-comanda'] = carrito.mensaje;
});
seguro('reservas', iniciarReservas);
iniciarNucleo({ mensajes });
