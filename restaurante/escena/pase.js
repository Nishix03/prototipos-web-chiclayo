// Escena «El pase» (brief: docs/visual/restaurante-cocina-abierta.md, dirección C).
// A la altura de los ojos frente al mostrador: pared de terracota, mostrador mate y 4 bowls de
// barro, uno por categoría de la carta. Los ingredientes empiezan en el aire, como recién
// lanzados, y con el scroll caen cada uno en su bowl.
import {
  BoxGeometry,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  Vector2,
} from 'three';
import { GRUPOS, crearPieza } from './ingredientes.js';

const MOSTRADOR_Y = -1.4;
// En escritorio cada bowl queda bajo una de las 4 columnas de comandas de la carta
const bowlX = (g, movil) => (g - 1.5) * (movil ? 0.95 : 1.8);
const esMovil = (aspecto) => aspecto < 1;

const PERFIL_BOWL = [
  [0, 0],
  [0.3, 0],
  [0.52, 0.12],
  [0.62, 0.34],
  [0.6, 0.36],
  [0.5, 0.16],
  [0, 0.06],
].map(([x, y]) => new Vector2(x, y));

export const pase = {
  grupos: GRUPOS,
  crearPieza,
  sombras: true,
  ligera: (aspecto) => aspecto < 1, // celular: ver core/escena3d.js
  fov: 36,
  exposicion: 1,
  cielo: '#a3472b',
  niebla: { color: '#8a3a22', cerca: 10, lejos: 24 },
  luz: {
    cielo: '#fff3e3',
    suelo: '#4a2214',
    ambiente: 1.1,
    sol: '#fff0da',
    intensidad: 2.8,
    posicion: [-3, 7, 6],
  },
  fondo(escena, aspecto, { sombras }) {
    const pared = new Mesh(
      new PlaneGeometry(50, 30),
      new MeshLambertMaterial({ color: '#a3472b' }),
    );
    pared.position.set(0, 4, -5);
    pared.receiveShadow = true;
    const mostrador = new Mesh(
      new BoxGeometry(40, 0.3, 3),
      new MeshLambertMaterial({ color: '#eee3d3' }),
    );
    mostrador.position.set(0, MOSTRADOR_Y - 0.15, 0);
    mostrador.receiveShadow = true;
    const frente = new Mesh(
      new BoxGeometry(40, 4, 0.2),
      new MeshLambertMaterial({ color: '#c4b39c' }),
    );
    frente.position.set(0, MOSTRADOR_Y - 2.3, 1.5);
    escena.add(pared, mostrador, frente);
    const barro = new MeshLambertMaterial({ color: '#c45a33' });
    for (let g = 0; g < GRUPOS.length; g++) {
      const bowl = new Mesh(new LatheGeometry(PERFIL_BOWL, 40), barro);
      bowl.position.set(bowlX(g, esMovil(aspecto)), MOSTRADOR_Y, 0.2);
      bowl.scale.setScalar(esMovil(aspecto) ? 0.75 : 1.2);
      bowl.castShadow = sombras;
      bowl.receiveShadow = sombras;
      escena.add(bowl);
    }
  },
  camara(t, aspecto) {
    const lejos = esMovil(aspecto) ? 1.8 : 1;
    // Al bajar, la cámara retrocede y sube: los bowls quedan en fila bajo sus comandas
    return {
      pos: [0, (0.6 + t * 1.2) * lejos * 0.8, (6.5 + t * 0.6) * lejos],
      mira: [0, -0.2 - t * 0.95, -1],
    };
  },
  inicial(i, a, aspecto) {
    // En el aire sobre el mostrador, como recién lanzados al wok
    const ancho = esMovil(aspecto) ? 2.3 : 5.6;
    return {
      pos: [(a[0] * 2 - 1) * ancho, MOSTRADOR_Y + 0.8 + a[1] * 3.8, -2.5 + a[2] * 4],
      rot: [a[3] * 6.3, a[4] * 6.3, a[5] * 6.3],
      // piezas grandes: llenan la pared con menos objetos (cada objeto cuesta, el tamaño no)
      escala: (esMovil(aspecto) ? 1.25 : 1.65) + a[3] * 0.5,
    };
  },
  ordenado(g, k, n, aspecto) {
    const movil = esMovil(aspecto);
    const ang = (k / n) * Math.PI * 2;
    const radio = (k % 2 ? 0.28 : 0.12) * (movil ? 0.75 : 1.2);
    return {
      pos: [
        bowlX(g, movil) + Math.cos(ang) * radio,
        MOSTRADOR_Y + (movil ? 0.18 : 0.28) + (k % 3) * 0.05,
        0.2 + Math.sin(ang) * radio,
      ],
      rot: [0.3, ang, 0.2],
      escala: movil ? 0.45 : 0.72,
    };
  },
};
