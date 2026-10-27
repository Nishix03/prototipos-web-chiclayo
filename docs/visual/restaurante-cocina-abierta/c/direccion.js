// C · «El pase»: a la altura de los ojos, frente al mostrador por donde sale la comida.
// La interfaz cuelga del riel de comandas; los ingredientes están en el aire, como recién
// lanzados, y al bajar caen cada uno en su bowl: los 4 bowls son las 4 categorías.
import {
  BoxGeometry,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  Vector2,
} from 'three';
import { iniciar } from '../comun/pagina.js';

const MOSTRADOR_Y = -1.4;
// En escritorio cada bowl queda bajo una de las 4 columnas de comandas
const bowlX = (g, movil) => (g - 1.5) * (movil ? 0.95 : 1.8);

iniciar({
  sombras: true,
  fov: 36,
  exposicion: 1,
  niebla: { color: '#8a3a22', cerca: 10, lejos: 24 },
  luz: {
    cielo: '#fff3e3',
    suelo: '#4a2214',
    ambiente: 1.1,
    sol: '#fff0da',
    intensidad: 2.8,
    posicion: [-3, 7, 6],
  },
  fondo(escena) {
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
    // 4 bowls de barro mate: los recipientes de cada categoría
    const perfil = [
      [0, 0],
      [0.3, 0],
      [0.52, 0.12],
      [0.62, 0.34],
      [0.6, 0.36],
      [0.5, 0.16],
      [0, 0.06],
    ].map(([x, y]) => new Vector2(x, y));
    const movil = innerWidth < innerHeight;
    for (let g = 0; g < 4; g++) {
      const bowl = new Mesh(
        new LatheGeometry(perfil, 40),
        new MeshLambertMaterial({ color: '#c45a33' }),
      );
      bowl.position.set(bowlX(g, movil), MOSTRADOR_Y, 0.2);
      bowl.scale.setScalar(movil ? 0.75 : 1.2);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      escena.add(bowl);
    }
  },
  camara(t, aspecto) {
    const lejos = aspecto < 1 ? 1.8 : 1;
    // Al bajar la cámara retrocede y sube: los bowls quedan en fila bajo sus comandas
    return {
      pos: [0, (0.6 + t * 1.2) * lejos * 0.8, (6.5 + t * 0.6) * lejos],
      mira: [0, -0.2 - t * 0.95, -1],
    };
  },
  disperso(i, a, aspecto) {
    // En el aire sobre el mostrador, como recién lanzados al wok
    const ancho = aspecto < 1 ? 2.3 : 5.6;
    return {
      pos: [(a[0] * 2 - 1) * ancho, MOSTRADOR_Y + 0.8 + a[1] * 3.8, -2.5 + a[2] * 4],
      rot: [a[3] * 6.3, a[4] * 6.3, a[5] * 6.3],
      escala: (aspecto < 1 ? 1 : 1.2) + a[3] * 0.4,
    };
  },
  ordenado(g, k, n, aspecto) {
    const movil = aspecto < 1;
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
});
