import formaMarca from '../img/marca/relieve.json';
import { relieveMarca } from '../../core/marca3d.js';
// Escena «Agua quieta» (identidad del spa), dirección A «Superficie» (docs/visual/spa.md): el agua
// vista desde arriba a pantalla completa, con anillos que salen de detrás del titular. Quieta al
// llegar; al bajar se agita con ondas suaves y, al llegar a la cita, vuelve a quedar quieta.
//
// Es un solo plano con un shader propio: la altura del agua se calcula en cada píxel con unas
// pocas ondas (senos), la normal sale de la diferencia entre puntos vecinos y el color mezcla el
// ámbar hondo con el reflejo claro, más un brillo. El agua no usa texturas ni luces;
// la R en relieve utiliza un matcap pequeño compartido.
// Quieta, la escena no se redibuja (el motor solo dibuja cuando cambia el scroll).
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
  uniform vec2 uCentro;
  uniform vec3 uHondo;
  uniform vec3 uClaro;
  varying vec2 vP;

  float altura(vec2 p) {
    float agita = sin(uT * 3.14159);              // 0 quieta → 1 a mitad → 0 en la cita
    float d = length(p - uCentro);
    float anillos = sin(d * 3.2 - uT * 14.0) * exp(-d * 0.22);
    float oleaje = sin(dot(p, vec2(0.8, 0.6)) * 0.9 + uT * 5.0)
                 + 0.6 * sin(dot(p, vec2(-0.5, 0.9)) * 1.7 - uT * 7.0);
    return 0.16 * anillos + agita * (0.22 * anillos + 0.14 * oleaje);
  }

  void main() {
    float e = 0.04;
    float h = altura(vP);
    vec3 n = normalize(vec3(-(altura(vP + vec2(e, 0.0)) - h) / e,
                            -(altura(vP + vec2(0.0, e)) - h) / e, 1.0));
    vec3 v = vec3(0.0, 0.0, 1.0);                  // la cámara mira el agua desde arriba
    // Fresnel: de frente se ve el agua honda; donde la onda se inclina, el reflejo claro
    float f = pow(1.0 - max(dot(n, v), 0.0), 2.0);
    vec3 color = mix(uHondo, uClaro, clamp(0.35 + 2.2 * f + 0.9 * h, 0.0, 1.0));
    // Brillo de la luz de la sala sobre las crestas
    vec3 luz = normalize(vec3(-0.4, 0.6, 0.7));
    float brillo = pow(max(dot(reflect(-luz, n), v), 0.0), 40.0);
    gl_FragColor = vec4(color + vec3(1.0, 0.98, 0.94) * brillo * 0.8, 1.0);
    #include <colorspace_fragment>
  }
`;

export function crearAgua() {
  return {
    fov: 40,
    puntero: true,
    cielo: '#faf2e5',
    ligera: (aspecto) => aspecto < 1,
    // El shader no usa luces: el motor crea una igual, aquí apagada
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
          uCentro: { value: [0, 0.6] },
          uHondo: { value: new Color('#c29a6c') },
          uClaro: { value: new Color('#fff3d9') },
        },
      });
      escena.add(new Mesh(new PlaneGeometry(16 * Math.max(1, aspecto), 16), material));
      const marca = relieveMarca(formaMarca, {
        color: '#a9773e',
        ancho: aspecto < 1 ? 0.65 : 2.3,
        profundidad: 0.11,
      });
      marca.position.set(aspecto < 1 ? 0.85 : 3.65, aspecto < 1 ? 1.35 : 0.25, 0.18);
      marca.rotation.set(-0.12, -0.2, 0.04);
      escena.add(marca);
      return { material, marca, yMarca: marca.position.y };
    },
    camara: (t) => ({ pos: [0, -t * 0.8, 10], mira: [0, -t * 0.8, 0] }),
    cuadro(t, { mundo, puntero }) {
      mundo.material.uniforms.uCentro.value = [puntero.x * 3, 0.6 + puntero.y * 2];
      mundo.material.uniforms.uT.value = t;
      mundo.marca.rotation.y = -0.2 + puntero.x * 0.05;
      mundo.marca.rotation.x = -0.12 + puntero.y * 0.04;
      mundo.marca.position.y = mundo.yMarca - t * 0.4;
    },
  };
}
