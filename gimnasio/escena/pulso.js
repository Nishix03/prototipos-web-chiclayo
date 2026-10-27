// Escena «Pulso» (identidad del gimnasio): líneas de luz verde neón sobre negro que laten con la
// velocidad del scroll. Quieto, el pulso es apenas un latido; mientras bajas rápido, las líneas
// se agitan; al soltar, vuelven a calmarse.
//
// Es un solo plano con un shader propio: cada línea es un brillo (una curva gaussiana) alrededor
// de una onda. Sin texturas ni luces. El motor solo redibuja mientras el scroll se mueve.
//
// Dirección A «Monitor» del paso 2 (docs/visual/gimnasio.md): un monitor cardíaco a pantalla completa.
import { Color, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

const vertice = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmento = /* glsl */ `
  uniform float uT;
  uniform float uVel;
  uniform vec3 uNeon;
  uniform vec3 uFondo;
  varying vec2 vP;

  // Brillo de una línea a distancia d: un núcleo fino y un halo amplio
  float brillo(float d, float ancho) {
    return exp(-pow(d / ancho, 2.0)) + 0.35 * exp(-abs(d) / (ancho * 6.0));
  }

  // Latido tipo electrocardiograma que recorre la línea
  float latido(float x, float centro) {
    float u = x - centro;
    return 0.9 * exp(-pow(u * 3.5, 2.0)) - 0.35 * exp(-pow((u - 0.35) * 4.0, 2.0));
  }

  void main() {
    float fuerza = 0.15 + uVel;
    float luz = 0.0;
    // 5 líneas horizontales, como un monitor cardíaco, con un latido que las cruza
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float y0 = (fi - 2.0) * 1.15;
        float centro = mod(uT * 18.0 + fi * 2.7, 20.0) - 10.0;
        float y = y0 + fuerza * 0.6 * sin(vP.x * (1.1 + fi * 0.3) + uT * 9.0 + fi)
                     + latido(vP.x, centro) * (0.6 + fuerza);
        luz += brillo(vP.y - y, 0.035) * (fi == 2.0 ? 1.0 : 0.45);
      }
    gl_FragColor = vec4(uFondo + uNeon * clamp(luz, 0.0, 1.6), 1.0);
    #include <colorspace_fragment>
  }
`;

export function crearPulso() {
  let previo = 0;
  return {
    fov: 40,
    cielo: '#0b0d0c',
    ligera: (aspecto) => aspecto < 1,
    luz: {
      cielo: '#000000',
      suelo: '#000000',
      ambiente: 0,
      sol: '#000000',
      intensidad: 0,
      posicion: [0, 1, 1],
    },
    fondo(escena, aspecto) {
      const material = new ShaderMaterial({
        vertexShader: vertice,
        fragmentShader: fragmento,
        uniforms: {
          uT: { value: 0 },
          uVel: { value: 0 },
          uNeon: { value: new Color('#c6ff3d') },
          uFondo: { value: new Color('#0b0d0c') },
        },
      });
      escena.add(new Mesh(new PlaneGeometry(16 * Math.max(1, aspecto), 16), material));
      return { material };
    },
    camara: () => ({ pos: [0, 0, 10], mira: [0, 0, 0] }),
    // La velocidad sale de cuánto avanzó el scroll desde el cuadro anterior (con inercia): al
    // soltar, el avance se frena solo y el pulso se calma antes de que la escena deje de dibujar
    cuadro(t, { mundo }) {
      const u = mundo.material.uniforms;
      u.uVel.value = Math.min(1.2, Math.abs(t - previo) * 120);
      u.uT.value = t;
      previo = t;
    },
  };
}
