// Escena «Juego y urgencia» (identidad de la veterinaria): juguetes mate (pelotas, aros y huesos)
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
  CapsuleGeometry,
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

const TIPOS = ['pelota', 'aro', 'hueso'];
const POR_TIPO = 8; // la versión ligera usa la mitad

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
        matcap('#bff3ee', '#1aa7a1', '#0b5d60'), // turquesa
        matcap('#ffe0b8', '#f28c28', '#a3521a'), // naranja
        matcap('#ffffff', '#f3e9d8', '#c9b79a'), // crema
      ];
      return {};
    },
    crearPieza(tipo) {
      const material = materiales[cuenta++ % 3]; // secuencia fija: la imagen fija y la viva coinciden
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
        // Hueso: una barra con dos bolitas en cada punta
        obj = new Group();
        const barra = new Mesh(
          geo('barra', (l) => new CapsuleGeometry(0.13, 0.8, 3, l ? 8 : 12)),
          material,
        );
        barra.rotation.z = Math.PI / 2;
        obj.add(barra);
        for (const [x, y] of [
          [-0.5, 0.13],
          [-0.5, -0.13],
          [0.5, 0.13],
          [0.5, -0.13],
        ]) {
          const bola = new Mesh(
            geo('bola', (l) => new SphereGeometry(0.17, l ? 8 : 12, l ? 6 : 9)),
            material,
          );
          bola.position.set(x, y, 0);
          obj.add(bola);
        }
      }
      obj.userData.juguete = true;
      return obj;
    },
    // Sueltos: por toda la pantalla, a distintas profundidades y girados
    inicial(_i, r, aspecto) {
      const ancho = aspecto < 1 ? 3.2 : 8.5;
      return {
        pos: [(r[0] - 0.5) * 2 * ancho, (r[1] - 0.5) * 8.5, (r[2] - 0.6) * 5],
        rot: [r[3] * Math.PI * 2, r[4] * Math.PI * 2, r[5] * Math.PI],
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
