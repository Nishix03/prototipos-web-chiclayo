// Escena «Filo» (identidad de la barbería), dirección A «Espejo»: una pared de cromo líquido
// de frente que ondula con el scroll y refleja el titular, con un barrido de luz dorada.
//
// Material matcap (ADR 008): el cromo es una imagen «capturada» (un canvas con el brillo del
// metal, barras de luz dorada y el titular) que se pega según la orientación de cada punto de
// la superficie. Se ve como metal líquido con el shader más barato posible: sin luces, sin
// mapas de entorno ni cámaras de reflexión. El barrido de luz es girar esa imagen con el scroll.
import {
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshMatcapMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

/** La «captura» del cromo: metal oscuro con anillos de luz dorada y el titular. */
function matcap(titular) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const centro = 256;
  // Metal: brillo claro arriba a la izquierda, oscuro al medio, un anillo dorado al borde
  const metal = g.createRadialGradient(centro * 0.85, centro * 0.75, 10, centro, centro, 256);
  metal.addColorStop(0, '#f6efe0');
  metal.addColorStop(0.18, '#8d8678');
  metal.addColorStop(0.45, '#17161a');
  metal.addColorStop(0.72, '#3b352b');
  metal.addColorStop(0.86, '#e2b552');
  metal.addColorStop(0.93, '#2a241b');
  metal.addColorStop(1, '#0b0b0c');
  g.fillStyle = metal;
  g.fillRect(0, 0, 512, 512);
  // Barras de luz dorada (los tubos de la barbería de noche, reflejados en el cromo)
  g.globalCompositeOperation = 'lighter';
  for (const [y, alto, alfa] of [
    [150, 26, 0.55],
    [330, 12, 0.35],
  ]) {
    const barra = g.createLinearGradient(0, y, 0, y + alto);
    barra.addColorStop(0, 'rgba(255,210,120,0)');
    barra.addColorStop(0.5, `rgba(255,210,120,${alfa})`);
    barra.addColorStop(1, 'rgba(255,210,120,0)');
    g.fillStyle = barra;
    g.fillRect(0, y, 512, alto);
  }
  // El titular en dorado: el cromo lo devuelve deformado
  g.fillStyle = 'rgba(232,196,106,0.85)';
  g.font = '800 54px sans-serif';
  g.textAlign = 'center';
  g.fillText(titular.toUpperCase(), centro, 262, 470);
  const textura = new CanvasTexture(c);
  textura.colorSpace = SRGBColorSpace;
  textura.center.set(0.5, 0.5);
  return textura;
}

// Las ondas: viajan y se calman a medida que bajas
const onda = (x, y, t) =>
  0.32 * (1 - t * 0.7) * Math.sin(x * 0.9 + t * 6) * Math.cos(y * 1.1 - t * 4) +
  0.12 * Math.sin((x + y) * 1.7 + t * 9);

export function crearFilo(titular = '') {
  return {
    fov: 38,
    cielo: '#101012',
    ligera: (aspecto) => aspecto < 1,
    // El matcap no usa luces: el motor crea una luz igual, aquí apagada
    luz: {
      cielo: '#000000',
      suelo: '#000000',
      ambiente: 0,
      sol: '#000000',
      intensidad: 0,
      posicion: [0, 1, 1],
    },
    fondo(escena, aspecto, { ligera }) {
      const segX = ligera ? 40 : 140; // celular: malla más gruesa, casi igual en pantalla chica
      const segY = Math.round(segX * 0.62);
      const geo = new PlaneGeometry(aspecto < 1 ? 11 : 16, 10, segX, segY);
      const textura = matcap(titular);
      escena.add(new Mesh(geo, new MeshMatcapMaterial({ matcap: textura, side: DoubleSide })));
      return { geo, textura, base: Float32Array.from(geo.attributes.position.array) };
    },
    camara: (t) => ({ pos: [0, 0.2 - t * 0.6, 6.2], mira: [0, -t * 0.4, 0] }),
    cuadro(t, { mundo }) {
      const { geo, textura, base } = mundo;
      const pos = geo.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) pos[i + 2] = onda(base[i], base[i + 1], t);
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      // El barrido de luz: la captura del cromo gira con el scroll
      textura.rotation = -0.6 + t * 1.6;
    },
  };
}
