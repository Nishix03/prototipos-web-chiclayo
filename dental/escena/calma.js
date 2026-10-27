// Escena «Calma clínica» (identidad de la clínica dental): piezas de vidrio esmerilado color
// menta que flotan sueltas y, al bajar, se ordenan. La metáfora: una sonrisa que se ordena.
//
// Material matcap (ADR 008), como el cromo de la barbería: el vidrio es una imagen «capturada»
// (un canvas claro con un brillo blanco y el borde menta) pegada según la orientación de cada
// punto. Sin luces, sin transparencias ni mapas de entorno: el shader más barato posible.
//
// Dirección A «Arco» del paso 2 (docs/visual/dental.md): las dos arcadas se cierran bajo el titular.
import {
  CanvasTexture,
  LatheGeometry,
  Mesh,
  MeshMatcapMaterial,
  SRGBColorSpace,
  Vector2,
} from 'three';

/** La «captura» del vidrio esmerilado: casi blanco al centro, menta hacia el borde. */
function matcap() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const vidrio = g.createRadialGradient(100, 90, 4, 128, 128, 128);
  vidrio.addColorStop(0, '#ffffff');
  vidrio.addColorStop(0.25, '#eef9f5');
  vidrio.addColorStop(0.62, '#c6e9df');
  vidrio.addColorStop(0.86, '#8fcdbd');
  vidrio.addColorStop(1, '#5fae9b');
  g.fillStyle = vidrio;
  g.fillRect(0, 0, 256, 256);
  const textura = new CanvasTexture(c);
  textura.colorSpace = SRGBColorSpace;
  return textura;
}

// La pieza: un perfil torneado con corona redonda y raíz corta y roma. Se lee como un diente
// sin ser una ilustración realista (exigencia 3).
const PERFIL = [
  [0, -0.5],
  [0.2, -0.48],
  [0.3, -0.25],
  [0.4, 0.05],
  [0.46, 0.35],
  [0.44, 0.58],
  [0.32, 0.72],
  [0.14, 0.78],
  [0, 0.79],
].map(([x, y]) => new Vector2(x, y));
const pieza = (ligera) => new LatheGeometry(PERFIL, ligera ? 10 : 20);

const PIEZAS = 12; // por arcada; la versión ligera usa la mitad

/** Composición final: g = arcada (0 arriba, 1 abajo), k de n. Una sonrisa ancha bajo el titular. */
function sonrisa(g, k, n, aspecto) {
  const ancho = aspecto < 1 ? 2.6 : 5.4;
  const u = n > 1 ? k / (n - 1) - 0.5 : 0; // -0.5 … 0.5
  const curva = g === 0 ? 1.1 : 0.85;
  const x = u * 2 * ancho;
  const y = (g === 0 ? -1.6 : -2.5) + curva * (u * 2) ** 2 * (g === 0 ? 1 : 1.25);
  // Arriba la corona mira hacia abajo y abajo hacia arriba; cada pieza sigue la curva
  const giro = Math.atan((4 * curva * u * (g === 0 ? 1 : 1.25) * 2) / (2 * ancho)) * 2;
  return { pos: [x, y, 0], rot: [0, 0, g === 0 ? Math.PI + giro : giro], escala: 0.85 };
}

export function crearCalma() {
  let material;
  const geometrias = {};
  const geometria = (ligera) => (geometrias[ligera] ??= pieza(ligera));
  let ligeraActual = false;

  return {
    semilla: 23,
    fov: 35,
    cielo: '#f6faf8',
    exposicion: 1,
    ligera: (aspecto) => aspecto < 1,
    // El matcap no usa luces: el motor crea una igual, aquí apagada
    luz: {
      cielo: '#000000',
      suelo: '#000000',
      ambiente: 0,
      sol: '#000000',
      intensidad: 0,
      posicion: [0, 1, 1],
    },
    grupos: [{ piezas: Array(PIEZAS).fill('pieza') }, { piezas: Array(PIEZAS).fill('pieza') }],
    fondo(_escena, _aspecto, { ligera }) {
      ligeraActual = ligera;
      material = new MeshMatcapMaterial({ matcap: matcap() });
      return {};
    },
    crearPieza() {
      return new Mesh(geometria(ligeraActual), material);
    },
    // Sueltas: repartidas por toda la pantalla, a distintas profundidades y giradas
    inicial(_i, r, aspecto) {
      const ancho = aspecto < 1 ? 3.4 : 8.5;
      return {
        pos: [(r[0] - 0.5) * 2 * ancho, (r[1] - 0.5) * 9, (r[2] - 0.6) * 6],
        rot: [r[3] * Math.PI, r[4] * Math.PI, r[5] * Math.PI],
        escala: 0.8 + r[2] * 0.7,
      };
    },
    ordenado: sonrisa,
    camara: (t) => ({ pos: [0, 0.4 - t * 0.6, 13 - t * 1.5], mira: [0, -t * 0.8, 0] }),
  };
}
