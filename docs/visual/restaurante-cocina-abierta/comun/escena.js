// Escena común de «La cocina abierta»: los ingredientes pasan de desordenados (portada) a
// ordenados en 4 grupos (las categorías de la carta) según el avance del scroll.
// Cada dirección aporta su fondo, su cámara y sus dos composiciones; esto solo interpola.
// Se redibuja solo cuando el scroll cambia (lección del ADR 008: quieta no gasta nada).
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GRUPOS, crearPieza } from './ingredientes.js';

function azar(semilla) {
  return () => {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const suave = (x) => x * x * (3 - 2 * x); // smoothstep
const mezclar = (a, b, t) => a + (b - a) * t;

/**
 * @param {HTMLElement} contenedor  elemento que recibe el canvas (ocupa la pantalla)
 * @param {object} d  dirección: { fondo(escena), luz, camara(t, aspecto), disperso(i, azar, aspecto, pieza), ordenado(g, k, n, aspecto, pieza), sombras }
 * @param {() => number} avance  devuelve el avance del scroll entre 0 y 1
 */
export function montarEscena(contenedor, d, avance) {
  const r = azar(11);
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = d.exposicion ?? 1;
  renderer.shadowMap.enabled = !!d.sombras;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(
    getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim(),
  );
  renderer.domElement.setAttribute('aria-hidden', 'true');
  contenedor.append(renderer.domElement);

  const escena = new Scene();
  // Niebla del color del fondo: lo lejano se funde y la escena gana profundidad
  if (d.niebla) escena.fog = new Fog(new Color(d.niebla.color), d.niebla.cerca, d.niebla.lejos);
  escena.add(
    new HemisphereLight(
      d.luz?.cielo ?? '#fff4e6',
      d.luz?.suelo ?? '#5a3a2a',
      d.luz?.ambiente ?? 1.6,
    ),
  );
  const sol = new DirectionalLight(d.luz?.sol ?? '#fff1dc', d.luz?.intensidad ?? 2.2);
  sol.position.set(...(d.luz?.posicion ?? [3, 8, 4]));
  if (d.sombras) {
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    // Cubre toda la mesa visible: fuera de esta caja la luz cambia y se notaría una franja
    Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 60 });
    sol.shadow.radius = 6;
    sol.shadow.bias = -0.0004;
  }
  escena.add(sol);
  d.fondo(escena);

  const camara = new PerspectiveCamera(d.fov ?? 35, 1, 0.1, 100);

  // Piezas: cada una guarda su pose desordenada y su pose ordenada
  const piezas = [];
  let i = 0;
  GRUPOS.forEach((grupo, g) => {
    grupo.piezas.forEach((clave, k) => {
      const obj = crearPieza(clave);
      obj.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = !!d.sombras;
          m.receiveShadow = false;
        }
      });
      piezas.push({
        obj,
        i: i++,
        g,
        k,
        n: grupo.piezas.length,
        azar: Array.from({ length: 6 }, r), // fijo por pieza: el desorden no cambia al redimensionar
        retraso: (g * 0.08 + k * 0.03) % 0.4, // se ordenan por grupos, en cascada
      });
      escena.add(obj);
    });
  });

  let aspecto = 1;
  function ajustar() {
    const { clientWidth: w, clientHeight: h } = contenedor;
    renderer.setSize(w, h, false);
    aspecto = w / h;
    camara.aspect = aspecto;
    camara.updateProjectionMatrix();
    const pose = (o) => ({
      pos: new Vector3(...o.pos),
      rot: new Vector3(...o.rot),
      escala: o.escala ?? 1,
    });
    for (const p of piezas) {
      p.desde = pose(d.disperso(p.i, p.azar, aspecto, p.obj.userData.tipo));
      p.hasta = pose(d.ordenado(p.g, p.k, p.n, aspecto, p.obj.userData.tipo));
    }
  }

  function dibujar(t) {
    for (const p of piezas) {
      const local = suave(Math.min(1, Math.max(0, (t - p.retraso) / (1 - 0.4))));
      p.obj.position.lerpVectors(p.desde.pos, p.hasta.pos, local);
      p.obj.rotation.set(
        mezclar(p.desde.rot.x, p.hasta.rot.x, local),
        mezclar(p.desde.rot.y, p.hasta.rot.y, local),
        mezclar(p.desde.rot.z, p.hasta.rot.z, local),
      );
      p.obj.scale.setScalar(mezclar(p.desde.escala, p.hasta.escala, local));
    }
    const c = d.camara(t, aspecto);
    camara.position.set(...c.pos);
    camara.lookAt(...c.mira);
    renderer.render(escena, camara);
  }

  ajustar();
  let actual = -1;
  const bucle = () => {
    const t = avance();
    if (Math.abs(t - actual) > 0.0005) {
      // el scroll llega con inercia, pero sin dibujar si nada cambió
      actual = actual < 0 ? t : actual + (t - actual) * 0.18;
      dibujar(actual);
    }
    requestAnimationFrame(bucle);
  };
  new ResizeObserver(() => {
    ajustar();
    dibujar(Math.max(0, actual));
  }).observe(contenedor);
  requestAnimationFrame(bucle);
  // Centro de cada grupo ya ordenado, en píxeles de pantalla: ahí se anclan las etiquetas
  // de categoría (los ingredientes «forman» la carta)
  function centros() {
    const c = d.camara(1, aspecto);
    const cam = camara.clone();
    cam.position.set(...c.pos);
    cam.lookAt(...c.mira);
    cam.updateMatrixWorld();
    const { clientWidth: w, clientHeight: h } = contenedor;
    return GRUPOS.map((_, g) => {
      const del = piezas.filter((p) => p.g === g);
      const v = del.reduce((s, p) => s.add(p.hasta.pos), new Vector3()).divideScalar(del.length);
      v.project(cam);
      return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
    });
  }

  // Para las capturas del storyboard: dibuja un avance exacto, sin inercia
  return {
    centros,
    fijar(t) {
      actual = t;
      dibujar(t);
    },
  };
}
