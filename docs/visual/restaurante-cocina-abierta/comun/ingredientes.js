// Ingredientes del norte en 3D mate (exigencia 3): formas limpias, sin texturas realistas,
// colores de los tokens. Todo se modela en código, sin archivos 3D.
import {
  CircleGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  SplineCurve,
  TorusGeometry,
  Vector2,
} from 'three';

const torneado = (puntos, lados = 40) =>
  new LatheGeometry(
    new SplineCurve(puntos.map(([x, y]) => new Vector2(x, y))).getPoints(32),
    lados,
  );

const mate = (color) => new MeshLambertMaterial({ color });

// Cada fábrica devuelve un Group con su escala natural (~0.3 a 0.6 unidades de largo)
export const INGREDIENTES = {
  ajiLimo(color) {
    const g = new Group();
    const cuerpo = new Mesh(
      torneado([
        [0, 0],
        [0.05, 0.06],
        [0.085, 0.2],
        [0.09, 0.34],
        [0.075, 0.44],
        [0.05, 0.48],
        [0, 0.49],
      ]),
      mate(color),
    );
    cuerpo.rotation.z = Math.PI; // la punta hacia abajo
    cuerpo.position.y = 0.49;
    const tallo = new Mesh(new CylinderGeometry(0.015, 0.02, 0.09, 8), mate('#3f6b2e'));
    tallo.position.y = 0.53;
    g.add(cuerpo, tallo);
    return g;
  },
  limon() {
    const g = new Group();
    const fruto = new Mesh(new SphereGeometry(0.2, 32, 24), mate('#7fa83a'));
    fruto.scale.set(1, 0.88, 0.88);
    g.add(fruto);
    return g;
  },
  medioLimon() {
    const g = new Group();
    const cascara = new Mesh(
      new SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      mate('#7fa83a'),
    );
    const pulpa = new Mesh(new CircleGeometry(0.19, 32), mate('#dfe89a'));
    pulpa.rotation.x = -Math.PI / 2;
    pulpa.position.y = 0.001;
    g.add(cascara, pulpa);
    g.rotation.x = Math.PI; // cara cortada hacia arriba
    return g;
  },
  cebolla() {
    const g = new Group();
    const bulbo = new Mesh(
      torneado([
        [0, 0],
        [0.12, 0.03],
        [0.24, 0.16],
        [0.25, 0.3],
        [0.16, 0.44],
        [0.05, 0.53],
        [0, 0.56],
      ]),
      mate('#7b2d5d'),
    );
    g.add(bulbo);
    return g;
  },
  arosCebolla() {
    const g = new Group();
    for (const [r, c] of [
      [0.2, '#8e3a6c'],
      [0.14, '#c98bb0'],
      [0.08, '#8e3a6c'],
    ]) {
      const aro = new Mesh(new TorusGeometry(r, 0.022, 10, 40), mate(c));
      aro.rotation.x = Math.PI / 2;
      g.add(aro);
    }
    return g;
  },
  loche() {
    const g = new Group();
    const zapallo = new Mesh(
      torneado([
        [0, 0],
        [0.16, 0.04],
        [0.21, 0.18],
        [0.18, 0.32],
        [0.1, 0.46],
        [0.09, 0.62],
        [0.06, 0.7],
        [0, 0.71],
      ]),
      mate('#4c7a3a'),
    );
    zapallo.rotation.z = Math.PI / 2; // echado
    zapallo.position.x = 0.35;
    g.add(zapallo);
    return g;
  },
  rodajaLoche() {
    const g = new Group();
    const piel = new Mesh(new CylinderGeometry(0.2, 0.2, 0.06, 32), mate('#4c7a3a'));
    const pulpa = new Mesh(new CircleGeometry(0.18, 32), mate('#e08a2a'));
    pulpa.rotation.x = -Math.PI / 2;
    pulpa.position.y = 0.031;
    g.add(piel, pulpa);
    return g;
  },
};

// Los 4 grupos que se convierten en las 4 categorías de la carta (negocio.json → carta)
const repetir = (piezas, n) => Array.from({ length: n }, (_, i) => piezas[i % piezas.length]);
export const GRUPOS = [
  { categoria: 'entradas', piezas: repetir(['ajiLimo:#c8321e', 'ajiLimo:#f2b705'], 12) },
  { categoria: 'marinos', piezas: repetir(['limon', 'medioLimon'], 12) },
  { categoria: 'fondos', piezas: repetir(['loche', 'rodajaLoche', 'rodajaLoche'], 10) },
  { categoria: 'postres-bebidas', piezas: repetir(['cebolla', 'arosCebolla'], 10) },
];

// Grupo exterior: la escena lo mueve y lo gira sin pisar la orientación propia de la pieza
export function crearPieza(clave) {
  const [tipo, color] = clave.split(':');
  const exterior = new Group();
  exterior.add(INGREDIENTES[tipo](color));
  exterior.userData.tipo = tipo;
  return exterior;
}
