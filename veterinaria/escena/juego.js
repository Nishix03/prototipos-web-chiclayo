import formaMarca from '../img/marca/relieve.json';
import { relieveMarca } from '../../core/marca3d.js';
// Escena «Juego y urgencia» (identidad de la veterinaria): accesorios mate (pelotas, aros y chapas con el símbolo de Trufa)
// en turquesa, naranja y crema que ruedan sueltos y, al bajar, se ordenan. Siguen al cursor o al
// dedo: se inclinan hacia él, como una mascota que mira.
//
// Material matcap (ADR 008): cada color es una imagen «capturada» de un plástico mate (un
// degradé suave, sin brillo duro), sin luces ni sombras. Pocos polígonos por pieza.
//
// Dirección B «Estante» del paso 2 (docs/visual/veterinaria.md): al bajar, los juguetes se
// ordenan en filas, como en una vitrina.
import {
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshMatcapMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three';

/** La «captura» de un plástico mate: claro arriba a la izquierda, el color, sombra suave al borde. */
function matcap(claro, color, sombra) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const d = g.createRadialGradient(46, 40, 4, 64, 64, 64);
  d.addColorStop(0, claro);
  d.addColorStop(0.45, color);
  d.addColorStop(1, sombra);
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return new MeshMatcapMaterial({ matcap: t });
}

const TIPOS = ['pelota', 'aro', 'placa'];
const POR_TIPO = 6; // la versión ligera usa la mitad

/** Composición final: una fila por tipo de juguete, a lo ancho, como en la vitrina de la
 * veterinaria. g = tipo de juguete, k de n. */
function estante(g, k, n, aspecto) {
  const ancho = aspecto < 1 ? 2.8 : 7.5;
  const u = n > 1 ? k / (n - 1) - 0.5 : 0;
  return { pos: [u * 2 * ancho, -2.2 - g * 1.25, 0], rot: [0.3, k * 0.6, 0], escala: 0.9 };
}

export function crearJuego() {
  let materiales;
  let ligeraActual = false;
  let cuenta = 0;
  const geometrias = {};
  function geo(nombre, crear) {
    return (geometrias[nombre + ligeraActual] ??= crear(ligeraActual));
  }

  return {
    semilla: 7,
    fov: 35,
    cielo: '#fbf7f0',
    ligera: (aspecto) => aspecto < 1,
    puntero: true,
    luz: {
      cielo: '#000000',
      suelo: '#000000',
      ambiente: 0,
      sol: '#000000',
      intensidad: 0,
      posicion: [0, 1, 1],
    },
    grupos: TIPOS.map((tipo) => ({ piezas: Array(POR_TIPO).fill(tipo) })),
    fondo(_escena, _aspecto, { ligera }) {
      ligeraActual = ligera;
      materiales = [
        matcap('#bff3ee', '#0b6b6e', '#06484c'), // turquesa
        matcap('#ffe0b8', '#ce7c35', '#955324'), // naranja
        matcap('#ffffff', '#f3e9d8', '#c9b79a'), // crema
      ];
      return {};
    },
    crearPieza(tipo) {
      const indice = cuenta++ % 3;
      const material = materiales[indice]; // secuencia fija: la imagen fija y la viva coinciden
      let obj;
      if (tipo === 'pelota') {
        obj = new Mesh(
          geo('pelota', (l) => new SphereGeometry(0.5, l ? 12 : 20, l ? 9 : 14)),
          material,
        );
      } else if (tipo === 'aro') {
        obj = new Mesh(
          geo('aro', (l) => new TorusGeometry(0.45, 0.16, l ? 8 : 12, l ? 16 : 28)),
          material,
        );
      } else {
        // Chapa de mascota: el símbolo de Trufa es parte del objeto, no una etiqueta 2D.
        obj = new Group();
        const base = new Mesh(
          geo('chapa', (l) => new CylinderGeometry(0.54, 0.54, 0.08, l ? 20 : 32)),
          material,
        );
        base.rotation.x = Math.PI / 2;
        const sello = relieveMarca(formaMarca, {
          ancho: 0.78,
          profundidad: 0.035,
          bisel: 0.004,
          material: materiales[indice === 0 ? 2 : 0],
        });
        sello.position.z = 0.065;
        const argolla = new Mesh(
          geo('argolla', () => new TorusGeometry(0.12, 0.035, 6, 14)),
          materiales[0],
        );
        argolla.position.y = 0.55;
        obj.add(base, sello, argolla);
      }
      obj.userData.tipo = tipo;
      obj.userData.juguete = true;
      return obj;
    },
    // Sueltos: por toda la pantalla, a distintas profundidades y girados
    inicial(i, r, aspecto, tipo) {
      const n = aspecto < 1 ? POR_TIPO / 2 : POR_TIPO;
      if (tipo === 'placa' && i === 2 * n)
        return {
          pos: [aspecto < 1 ? 0.85 : 3.2, aspecto < 1 ? -2.2 : 0.3, 0.4],
          rot: [0.08, -0.18, -0.12],
          escala: aspecto < 1 ? 0.85 : 1.35,
        };
      const ancho = aspecto < 1 ? 3.2 : 8.5;
      return {
        pos: [(r[0] - 0.5) * 2 * ancho, (r[1] - 0.5) * 8.5, (r[2] - 0.6) * 5],
        rot:
          tipo === 'placa'
            ? [0.12, (r[4] - 0.5) * 0.5, (r[5] - 0.5) * 0.3]
            : [r[3] * Math.PI * 2, r[4] * Math.PI * 2, r[5] * Math.PI],
        escala: 0.9 + r[2] * 0.6,
      };
    },
    ordenado: estante,
    camara: (t) => ({ pos: [0, 0.3 - t * 0.5, 12], mira: [0, -t * 0.6, 0] }),
    // Cada juguete se inclina hacia el puntero, más los que están cerca de la cámara
    cuadro(_t, { escena, puntero }) {
      for (const obj of escena.children) {
        if (!obj.userData.juguete) continue;
        const cerca = 1 + obj.position.z * 0.15;
        obj.rotation.y += puntero.x * 0.6 * cerca;
        obj.rotation.x -= puntero.y * 0.5 * cerca;
        obj.position.x += puntero.x * 0.15 * cerca;
      }
    },
  };
}
