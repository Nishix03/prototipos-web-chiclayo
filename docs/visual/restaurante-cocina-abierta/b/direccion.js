// B · «Pizarra de la cocina»: de frente a la pared de la cocina abierta. Los ingredientes
// flotan delante de la pizarra y le proyectan sombra; al bajar caen a la repisa de madera,
// ordenados en 4 grupos: las categorías de la carta, escritas con tiza encima.
import { BoxGeometry, Mesh, MeshLambertMaterial } from 'three';
import { iniciar } from '../comun/pagina.js';

const REPISA_Y = -3;

iniciar({
  sombras: true,
  fov: 34,
  exposicion: 1,
  luz: {
    cielo: '#fff1df',
    suelo: '#1a120d',
    ambiente: 0.9,
    sol: '#ffe7c4',
    intensidad: 3,
    posicion: [2.5, 6, 7],
  },
  fondo(escena) {
    const pizarra = new Mesh(
      new BoxGeometry(40, 24, 0.2),
      new MeshLambertMaterial({ color: '#25332b' }),
    );
    pizarra.position.set(0, 2, -1.6);
    pizarra.receiveShadow = true;
    const repisa = new Mesh(
      new BoxGeometry(40, 0.25, 1.4),
      new MeshLambertMaterial({ color: '#7a4a2b' }),
    );
    repisa.position.set(0, REPISA_Y - 0.13, -0.85);
    repisa.receiveShadow = true;
    repisa.castShadow = true;
    escena.add(pizarra, repisa);
  },
  camara(t, aspecto) {
    const lejos = aspecto < 1 ? 1.7 : 1;
    // Al final la cámara mira por debajo de la repisa: la repisa queda arriba y la carta debajo
    return { pos: [0, 0.5 - t * 2, 7.4 * lejos], mira: [0, 0.3 - t * 4.4, -1] };
  },
  disperso(i, a, aspecto) {
    const ancho = aspecto < 1 ? 2.2 : 5.2;
    return {
      pos: [(a[0] * 2 - 1) * ancho, -1.6 + a[1] * 4.6, -0.9 + a[2] * 3.2],
      rot: [a[3] * 6.3, a[4] * 6.3, a[5] * 6.3],
      escala: (aspecto < 1 ? 1 : 1.25) + a[3] * 0.4,
    };
  },
  ordenado(g, k, n, aspecto) {
    const movil = aspecto < 1;
    const x0 = (g - 1.5) * (movil ? 0.82 : 2.1);
    const paso = movil ? 0.22 : 0.42;
    return {
      pos: [
        x0 + ((k % 5) - 2) * paso,
        REPISA_Y + 0.02 + Math.floor(k / 5) * 0.12,
        -0.6 - Math.floor(k / 5) * 0.35,
      ],
      rot: [0, 0.6 + k * 0.4, 0],
      escala: movil ? 0.65 : 1.05,
    };
  },
});
