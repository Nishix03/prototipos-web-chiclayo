// «La mesa norteña»: un ceviche servido, visto desde arriba. Todos los alimentos
// permanecen sobre la vajilla; el scroll solo cambia el punto de vista.
import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { azar } from '../../core/escena3d.js';
import { relieveMarca } from '../../core/marca3d.js';
import simbolo from '../img/marca/relieve.json';

const mate = (color) => new MeshLambertMaterial({ color });
const ceramica = mate('#f3e8ce');
const barro = mate('#994321');
const aji = mate('#df9d16');
const verde = mate('#486c28');

function pieza(geo, material, pos, escala, rot) {
  const mesh = new Mesh(geo, material);
  if (pos) mesh.position.set(...pos);
  if (escala) mesh.scale.set(...escala);
  if (rot) mesh.rotation.set(...rot);
  return mesh;
}

// Dos mapas procedurales pequeños; no se descargan fotografías ni mapas de entorno.
function materialMadera() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = azar(47);
  g.fillStyle = '#754c34';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 42; i++) {
    const y = r() * 256;
    g.strokeStyle = i % 3 ? 'rgba(38,18,9,.04)' : 'rgba(245,196,128,.04)';
    g.lineWidth = r() * 0.7 + 0.3;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(80, y + r() * 8, 160, y - r() * 8, 256, y);
    g.stroke();
  }
  g.fillStyle = '#62432f';
  g.fillRect(0, 0, 256, 2);
  const map = new CanvasTexture(c);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.repeat.set(2, 4);
  return new MeshLambertMaterial({ map });
}

function materialTejido() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#d7bd86';
  g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) {
    g.fillStyle = 'rgba(69,41,21,.04)';
    g.fillRect(0, y, 128, 1);
  }
  for (let x = 0; x < 128; x += 4) {
    g.fillStyle = 'rgba(255,241,200,.06)';
    g.fillRect(x, 0, 1, 128);
  }
  g.strokeStyle = '#a3472b';
  g.lineWidth = 3;
  for (let x = -16; x < 144; x += 32) {
    g.beginPath();
    g.moveTo(x, 48);
    g.lineTo(x + 16, 32);
    g.lineTo(x + 32, 48);
    g.lineTo(x + 16, 64);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(x, 96);
    g.lineTo(x + 16, 80);
    g.lineTo(x + 32, 96);
    g.lineTo(x + 16, 112);
    g.closePath();
    g.stroke();
  }
  const map = new CanvasTexture(c);
  map.colorSpace = SRGBColorSpace;
  map.wrapS = map.wrapT = RepeatWrapping;
  map.repeat.set(2, 3);
  return new MeshLambertMaterial({ map, side: DoubleSide });
}

let sombraMaterial;
function sombra(radio, x, z) {
  if (!sombraMaterial) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const d = g.createRadialGradient(32, 32, 8, 32, 32, 32);
    d.addColorStop(0, 'rgba(25,12,5,.58)');
    d.addColorStop(0.65, 'rgba(25,12,5,.26)');
    d.addColorStop(1, 'rgba(25,12,5,0)');
    g.fillStyle = d;
    g.fillRect(0, 0, 64, 64);
    sombraMaterial = new MeshLambertMaterial({
      map: new CanvasTexture(c),
      transparent: true,
      depthWrite: false,
    });
  }
  return pieza(new PlaneGeometry(radio * 2, radio * 2), sombraMaterial, [x, 0.013, z], null, [
    -Math.PI / 2,
    0,
    0,
  ]);
}

function plato() {
  const g = new Group();
  const perfil = [
    [0, 0.08],
    [1.05, 0.08],
    [1.35, 0.16],
    [1.7, 0.28],
    [1.84, 0.31],
    [1.86, 0.35],
    [1.7, 0.37],
    [1.29, 0.23],
    [0, 0.18],
  ];
  g.add(
    pieza(
      new LatheGeometry(
        perfil.map((p) => new Vector2(...p)),
        48,
      ),
      ceramica,
    ),
  );
  for (const radio of [1.71, 1.79]) {
    g.add(
      pieza(new TorusGeometry(radio, 0.018, 4, 48), barro, [0, 0.359, 0], null, [
        Math.PI / 2,
        0,
        0,
      ]),
    );
  }
  const sello = relieveMarca(simbolo, {
    color: '#a3472b',
    ancho: 0.27,
    profundidad: 0.012,
    bisel: 0.002,
  });
  sello.rotation.x = -Math.PI / 2;
  sello.position.set(0, 0.349, 1.55);
  g.add(sello);
  // Leche de tigre y pescado en el centro; instancias para todos los trozos.
  g.add(pieza(new CylinderGeometry(1.24, 1.24, 0.018, 40), mate('#e6d594'), [0, 0.245, 0]));
  const r = azar(38);
  const dummy = new Object3D();
  const pescado = new InstancedMesh(
    new RoundedBoxGeometry(0.34, 0.2, 0.26, 1, 0.035),
    mate('#f5eee0'),
    28,
  );
  for (let i = 0; i < 28; i++) {
    const ang = i * 2.4;
    const rad = Math.sqrt(r()) * 0.94;
    dummy.position.set(Math.cos(ang) * rad, 0.35 + r() * 0.12, Math.sin(ang) * rad);
    dummy.rotation.set(r() * 0.4, r() * 6.28, r() * 0.25);
    dummy.scale.set(0.8 + r() * 0.45, 0.8 + r() * 0.4, 0.8 + r() * 0.4);
    dummy.updateMatrix();
    pescado.setMatrixAt(i, dummy.matrix);
  }
  g.add(pescado);
  // Cebolla criolla en tiras curvas, no anillos flotantes.
  const cebolla = mate('#934b72');
  const interior = mate('#e3c2cf');
  const curva = new TorusGeometry(0.43, 0.018, 4, 20, Math.PI * 1.25);
  for (let i = 0; i < 9; i++) {
    g.add(
      pieza(
        curva,
        i % 3 ? cebolla : interior,
        [(r() - 0.5) * 1.1, 0.53 + r() * 0.08, (r() - 0.5) * 0.85],
        [1, 0.65 + r() * 0.5, 1],
        [Math.PI / 2 + r() * 0.12, 0, r() * 6.28],
      ),
    );
  }
  const cilantro = new InstancedMesh(new CircleGeometry(0.065, 5), verde, 18);
  for (let i = 0; i < 18; i++) {
    dummy.position.set((r() - 0.5) * 1.7, 0.61, (r() - 0.5) * 1.4);
    dummy.rotation.set(-Math.PI / 2, 0, r() * 6.28);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    cilantro.setMatrixAt(i, dummy.matrix);
  }
  g.add(cilantro);
  // Guarniciones reconocibles del ceviche: camote y choclo desgranado.
  const camote = mate('#d57b2d');
  for (let i = 0; i < 3; i++) {
    g.add(
      pieza(
        new CylinderGeometry(0.28, 0.3, 0.12, 20),
        camote,
        [-1.1, 0.33 + i * 0.035, -0.47 + i * 0.35],
        [1, 1, 0.85],
        [0, i * 0.2, -0.12],
      ),
    );
  }
  const granos = new InstancedMesh(
    new RoundedBoxGeometry(0.13, 0.12, 0.16, 1, 0.035),
    mate('#f4df9e'),
    32,
  );
  for (let i = 0; i < 32; i++) {
    dummy.position.set(0.85 + r() * 0.42, 0.33 + r() * 0.12, -0.5 + r() * 0.85);
    dummy.rotation.set(r(), r() * 6.28, r());
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    granos.setMatrixAt(i, dummy.matrix);
  }
  g.add(granos);
  return g;
}

function limon() {
  const g = new Group();
  g.add(pieza(new CylinderGeometry(0.29, 0.26, 0.14, 24), verde));
  g.add(pieza(new CylinderGeometry(0.25, 0.25, 0.006, 24), mate('#d3d984'), [0, 0.074, 0]));
  const pulpa = mate('#eff0ba');
  for (let i = 0; i < 8; i++) {
    g.add(
      pieza(
        new BoxGeometry(0.012, 0.008, 0.22),
        pulpa,
        [Math.sin((i * Math.PI) / 4) * 0.12, 0.079, Math.cos((i * Math.PI) / 4) * 0.12],
        null,
        [0, (i * Math.PI) / 4, 0],
      ),
    );
  }
  return g;
}

function cuenco() {
  const g = new Group();
  g.add(
    pieza(
      new LatheGeometry(
        [
          [0, 0],
          [0.28, 0.02],
          [0.44, 0.35],
          [0.42, 0.38],
          [0.34, 0.15],
          [0, 0.12],
        ].map((p) => new Vector2(...p)),
        28,
      ),
      barro,
    ),
  );
  g.add(pieza(new CylinderGeometry(0.35, 0.35, 0.02, 28), aji, [0, 0.27, 0]));
  return g;
}

export const mesa = {
  grupos: [],
  fov: 40,
  cielo: '#75442b',
  puntero: false,
  ligera: (aspecto) => aspecto < 1,
  // Sombras de contacto precalculadas: no hay segunda pasada de shadow-map.
  sombras: false,
  luz: {
    cielo: '#fff3d9',
    suelo: '#53371f',
    ambiente: 1.7,
    sol: '#fff3dc',
    intensidad: 2,
    posicion: [-4, 9, 3],
  },
  fondo(escena, aspecto) {
    const movil = aspecto < 1;
    escena.add(
      pieza(new PlaneGeometry(40, 40), materialMadera(), [0, 0, 0], null, [-Math.PI / 2, 0, -0.18]),
    );
    const mesaServida = new Group();
    const tejido = pieza(new PlaneGeometry(3.1, 11), materialTejido(), [1.45, 0.006, 0], null, [
      -Math.PI / 2,
      0,
      0.18,
    ]);
    mesaServida.add(tejido, sombra(2.15, 0, 0), plato());
    const salsa = cuenco();
    salsa.position.set(2, 0.01, -1.5);
    mesaServida.add(sombra(0.58, 2, -1.5), salsa);
    for (const [x, z, giro] of [
      [1.75, 1.4, 0.25],
      [2.18, 0.95, -0.2],
    ]) {
      const mitad = limon();
      mitad.position.set(x, 0.12, z);
      mitad.rotation.z = giro;
      mesaServida.add(sombra(0.35, x, z), mitad);
    }
    // Cubiertos sobre servilleta; metal mate para evitar reflejos costosos.
    const servilleta = pieza(
      new BoxGeometry(0.9, 0.035, 2.4),
      mate('#e6d7b5'),
      [-2.05, 0.04, 0.1],
      null,
      [0, -0.15, 0],
    );
    const acero = mate('#b9b4a2');
    mesaServida.add(servilleta);
    for (const x of [-2.25, -1.93]) {
      mesaServida.add(pieza(new BoxGeometry(0.055, 0.04, 1.55), acero, [x, 0.085, 0.1]));
    }
    for (let i = 0; i < 4; i++) {
      mesaServida.add(
        pieza(new BoxGeometry(0.025, 0.04, 0.32), acero, [-2.34 + i * 0.06, 0.085, -0.72]),
      );
    }
    mesaServida.add(pieza(new BoxGeometry(0.17, 0.045, 0.6), acero, [-1.93, 0.085, -0.57]));
    mesaServida.rotation.y = -0.17;
    mesaServida.position.set(movil ? 0.1 : 2.2, 0, movil ? 2.2 : 0);
    mesaServida.scale.setScalar(movil ? 0.86 : 1.1);
    escena.add(mesaServida);
  },
  camara(t, aspecto) {
    const movil = aspecto < 1;
    return {
      pos: [t * 0.45, movil ? 10.8 : 8.5, (movil ? 8.8 : 7) - t * 0.35],
      mira: [0, 0, t * 0.55],
    };
  },
};
