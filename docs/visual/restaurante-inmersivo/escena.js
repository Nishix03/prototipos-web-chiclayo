// Momento firma: la olla de barro sobre brasas de algarrobo (ADR 008).
// Se importa con import() cuando la página ya está pintada; antes se ve el póster, que es
// esta misma escena renderizada (modo ?poster). Todo se modela en código: no hay archivo 3D.
// El vapor y el brillo de la brasa son CSS (solo transform y opacity, los mueve el
// compositor): así la escena solo se redibuja cuando el scroll o el cursor la cambian.
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  Scene,
  SplineCurve,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { progreso } from './progreso.js';

// Azar con semilla: el póster y la escena viva salen idénticos
function azar(semilla) {
  return () => {
    semilla |= 0;
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Perfil de la olla (radio, altura): base, panza ancha, hombro, cuello y borde volteado
const PERFIL = [
  [0, 0],
  [0.5, 0.02],
  [0.82, 0.1],
  [1.08, 0.32],
  [1.22, 0.62],
  [1.23, 0.86],
  [1.14, 1.12],
  [0.97, 1.33],
  [0.8, 1.47],
  [0.76, 1.56],
  [0.8, 1.63],
  [0.9, 1.68],
  [0.88, 1.72],
].map(([x, y]) => new Vector2(x, y));
// Curva suave por esos puntos: sin facetas en la silueta
const PERFIL_SUAVE = new SplineCurve(PERFIL).getPoints(64);

// Barro paleteado de Mórrope: golpes de paleta, hollín abajo y una línea incisa en el hombro
function texturaBarro(r) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  const fondo = g.createLinearGradient(0, c.height, 0, 0); // v=0 (base) abajo del canvas
  fondo.addColorStop(0, '#1d120c');
  fondo.addColorStop(0.22, '#3d2116');
  fondo.addColorStop(0.42, '#8f4524');
  fondo.addColorStop(0.75, '#a9592f');
  fondo.addColorStop(1, '#b8683b');
  g.fillStyle = fondo;
  g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 900; i++) {
    const claro = r() > 0.5;
    g.fillStyle = claro
      ? `rgba(214,150,100,${0.02 + r() * 0.04})`
      : `rgba(40,18,10,${0.02 + r() * 0.05})`;
    g.beginPath();
    g.ellipse(
      r() * c.width,
      r() * c.height,
      3 + r() * 11,
      2 + r() * 6,
      r() * Math.PI,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  const y = c.height * (1 - 0.7);
  g.strokeStyle = 'rgba(30,14,8,0.55)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, y);
  g.lineTo(c.width, y);
  g.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function texturaRelieve(r) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 600; i++) {
    const v = Math.floor(90 + r() * 80);
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.beginPath();
    g.arc(r() * c.width, r() * c.height, 1 + r() * 5, 0, Math.PI * 2);
    g.fill();
  }
  return new CanvasTexture(c);
}

function texturaSuave(color, alfaCentro) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, color.replace('A', alfaCentro));
  d.addColorStop(0.45, color.replace('A', alfaCentro * 0.45));
  d.addColorStop(1, color.replace('A', 0));
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

function crearOlla(r) {
  const olla = new Group();
  const barro = new MeshLambertMaterial({
    map: texturaBarro(r),
    bumpMap: texturaRelieve(r),
    bumpScale: 0.6,
  });
  olla.add(new Mesh(new LatheGeometry(PERFIL_SUAVE, 96), barro));
  // Interior oscuro, visto por la boca
  // Puntos en orden inverso: las caras miran hacia adentro sin BackSide (un shader menos que compilar)
  const interior = new Mesh(
    new LatheGeometry(
      PERFIL.slice(8)
        .map((p) => new Vector2(p.x * 0.94, p.y))
        .reverse(),
      48,
    ),
    new MeshLambertMaterial({ color: '#1a0d07' }),
  );
  olla.add(interior);
  // Caldo (un seco que hierve) dentro del cuello
  const caldo = new Mesh(
    new CircleGeometry(0.74, 40),
    new MeshLambertMaterial({ color: '#4a2a12', emissive: '#2a1206', emissiveIntensity: 0.4 }),
  );
  caldo.rotation.x = -Math.PI / 2;
  caldo.position.y = 1.52;
  olla.add(caldo);
  // Dos asas en el hombro
  for (const lado of [-1, 1]) {
    const asa = new Mesh(new TorusGeometry(0.17, 0.05, 10, 20, Math.PI), barro);
    asa.position.set(lado * 1.12, 1.18, 0);
    asa.rotation.set(0, lado * Math.PI * 0.5, lado * -0.6);
    olla.add(asa);
  }
  return olla;
}

function crearFogon(r) {
  const fogon = new Group();
  // Sombra suave sobre la que todo se apoya
  const sombra = new Mesh(
    new PlaneGeometry(3.6, 3.6),
    new MeshBasicMaterial({
      map: texturaSuave('rgba(34,21,14,A)', 0.55),
      transparent: true,
      depthWrite: false,
    }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -0.42;
  fogon.add(sombra);
  // Leña de algarrobo cruzada bajo la olla
  const lena = new MeshLambertMaterial({ color: '#3b2416' });
  for (let i = 0; i < 4; i++) {
    const tronco = new Mesh(new CylinderGeometry(0.1, 0.12, 2.6, 10), lena);
    tronco.rotation.set(Math.PI / 2, 0, (i / 4) * Math.PI + 0.3);
    tronco.position.y = -0.36;
    fogon.add(tronco);
  }
  // Brasas: sin luz propia que calcular (MeshBasic), brillan por su color
  const n = 60;
  const brasas = new InstancedMesh(new IcosahedronGeometry(0.11, 0), new MeshBasicMaterial(), n);
  const o = new Object3D();
  const tono = new Color();
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = r() * 1.05;
    o.position.set(Math.cos(a) * d, -0.3 + r() * 0.1, Math.sin(a) * d);
    o.rotation.set(r() * 3, r() * 3, r() * 3);
    o.scale.set(0.35 + r() * 0.55, 0.25 + r() * 0.2, 0.35 + r() * 0.55); // brasas chatas, no bolitas
    o.updateMatrix();
    brasas.setMatrixAt(i, o.matrix);
    const viva = r();
    brasas.setColorAt(i, tono.setHSL(0.01 + viva * 0.04, 1, viva > 0.85 ? 0.4 : 0.06 + viva * 0.2));
  }
  fogon.add(brasas);
  return fogon;
}

export function montarEscena(figura, { poster = false, lado = 1280 } = {}) {
  const r = azar(7);
  const movil = matchMedia('(max-width: 60rem)').matches;
  const renderer = new WebGLRenderer({
    antialias: !movil || poster,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: poster,
  });
  // Fondo opaco del color de la página (token --color-fondo, que viene del tema del negocio),
  // igual que el póster: la imagen sin canal alfa pesa mucho menos
  const fondo = getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim();
  renderer.setClearColor(fondo, 1);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(poster ? 1 : Math.min(devicePixelRatio, movil ? 1.25 : 2));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');

  const escena = new Scene();
  const camara = new PerspectiveCamera(30, 1, 0.1, 50);
  escena.add(new HemisphereLight('#ffe6c7', '#2a1408', 1.4));
  const sol = new DirectionalLight('#ffd9a8', 2.4);
  sol.position.set(3, 5, 4);
  escena.add(sol);
  const brasa = new PointLight('#ff6a1f', 9, 2.4, 2);
  brasa.position.set(0, -0.15, 0.7);
  escena.add(brasa);

  const olla = crearOlla(r);
  olla.position.y = -0.12;
  escena.add(olla, crearFogon(r));

  const ajustar = () => {
    const ancho = poster ? lado : figura.clientWidth;
    const alto = poster ? lado : figura.clientHeight;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
  };
  ajustar();

  // Cursor o dedo cerca de la olla: la brasa se aviva (técnica de Hubtown)
  let avivar = 0;
  let avivarObjetivo = 0;
  figura.addEventListener('pointermove', (e) => {
    const caja = figura.getBoundingClientRect();
    const dx = (e.clientX - caja.left) / caja.width - 0.5;
    const dy = (e.clientY - caja.top) / caja.height - 0.62;
    avivarObjetivo = Math.max(0, 1 - Math.hypot(dx, dy) * 2.2);
  });
  figura.addEventListener('pointerleave', () => (avivarObjetivo = 0));

  let giro = 0;
  // ¿Hay algo que redibujar? Quieta, la escena no gasta nada: vapor y brillo son CSS
  const enMovimiento = () =>
    Math.abs(progreso.portada - giro) > 0.0005 || Math.abs(avivarObjetivo - avivar) > 0.002;
  function cuadro(dt) {
    giro += (progreso.portada - giro) * Math.min(1, dt * 5); // el scroll llega con inercia
    avivar += (avivarObjetivo - avivar) * Math.min(1, dt * 4);
    figura.style.setProperty('--giro', giro.toFixed(3));
    figura.style.setProperty('--avivar', avivar.toFixed(3));
    olla.rotation.y = -0.5 + giro * Math.PI; // media vuelta en toda la portada
    // La cámara se acerca y sube hasta asomarse a la boca de la olla
    camara.position.set(0, 1.8 + giro * 3.4, 6.6 - giro * 2.8);
    camara.lookAt(0, 1.05 + giro * 0.45, 0);
    brasa.intensity = 8 + avivar * 14;
    renderer.render(escena, camara);
  }

  if (poster) {
    cuadro(1 / 60);
    return canvas;
  }

  // En celular, 30 cuadros por segundo bastan mientras la olla gira, y cuestan la mitad
  const intervalo = movil ? 1000 / 30 - 2 : 0;
  let ultimo = performance.now();
  let primero = true;
  const bucle = (ahora) => {
    if (!primero && !enMovimiento()) {
      ultimo = ahora;
      return;
    }
    if (ahora - ultimo < intervalo) return;
    cuadro(Math.min(0.05, (ahora - ultimo) / 1000));
    ultimo = ahora;
    if (primero) {
      primero = false;
      figura.setAttribute('data-viva', '');
    }
  };
  // Se pausa fuera de pantalla y con la pestaña oculta
  let visible = true;
  const actualizar = () => {
    ultimo = performance.now();
    renderer.setAnimationLoop(visible && !document.hidden ? bucle : null);
  };
  // Los shaders se compilan sin bloquear el hilo principal (si el navegador lo permite);
  // mientras tanto se sigue viendo el póster
  renderer.compileAsync(escena, camara).then(() => {
    figura.append(canvas);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      actualizar();
    }).observe(figura);
    document.addEventListener('visibilitychange', actualizar);
    new ResizeObserver(ajustar).observe(figura);
  });
  return canvas;
}
