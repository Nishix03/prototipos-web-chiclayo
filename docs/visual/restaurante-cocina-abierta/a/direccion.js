// A · «Mesón»: la cámara mira el mesón en diagonal, como quien se asoma a la cocina abierta.
// Los ingredientes están regados por toda la mesa y, al bajar, se juntan al fondo en 4
// montones: las categorías de la carta.
import { Mesh, MeshLambertMaterial, PlaneGeometry } from 'three';
import { iniciar } from '../comun/pagina.js';

const tumbado = (tipo) => (tipo === 'ajiLimo' || tipo === 'cebolla' ? Math.PI / 2 : 0);

iniciar({
  sombras: true,
  fov: 32,
  exposicion: 0.95,
  niebla: { color: '#6e3220', cerca: 9, lejos: 22 },
  luz: {
    cielo: '#fff3e2',
    suelo: '#6b3018',
    ambiente: 1.0,
    sol: '#fff0d8',
    intensidad: 3.2,
    posicion: [-6, 8, 5],
  },
  fondo(escena) {
    const meson = new Mesh(
      new PlaneGeometry(60, 60),
      new MeshLambertMaterial({ color: '#a9553a' }),
    );
    meson.rotation.x = -Math.PI / 2;
    meson.receiveShadow = true;
    escena.add(meson);
  },
  camara(t, aspecto) {
    const lejos = aspecto < 1 ? 1.35 : 1; // en celular, un poco más atrás para ver el ancho
    return {
      pos: [0, (6.2 - t * 0.8) * lejos, (6.4 - t * 1.2) * lejos],
      mira: [0, 0, -1.2 - t * 0.6],
    };
  },
  disperso(i, a, aspecto, tipo) {
    // Regados por todo el mesón, también debajo de la comanda: la portada vive entre ellos
    // El ancho visible crece con la distancia: lo de atrás puede ir más afuera
    const z = 2.6 - a[1] * 8;
    const ancho = (aspecto < 1 ? 1.7 : 4.4) + (2.6 - z) * (aspecto < 1 ? 0.25 : 0.45);
    return {
      pos: [(a[0] * 2 - 1) * ancho, 0, z],
      rot: [0, a[2] * Math.PI * 2, tumbado(tipo)],
      escala: (aspecto < 1 ? 0.9 : 1.1) + a[3] * 0.35,
    };
  },
  ordenado(g, k, n, aspecto, tipo) {
    // Una franja arriba de la pantalla con 4 montoncitos: la carta queda debajo
    const movil = aspecto < 1;
    // Celular: 2 × 2 para que las 4 etiquetas quepan en 360 px
    const x0 = movil ? ((g % 2) - 0.5) * 1.7 : (g - 1.5) * 2.6;
    const z0 = movil ? -5.4 + Math.floor(g / 2) * 1.5 : -3.6;
    const col = k % 4;
    const fila = Math.floor(k / 4);
    const paso = movil ? 0.3 : 0.55;
    return {
      pos: [x0 + (col - 1.5) * paso, 0, z0 + fila * paso],
      rot: [0, 0.4 + k * 0.5, tumbado(tipo)],
      escala: movil ? 0.65 : 1.05,
    };
  },
});
