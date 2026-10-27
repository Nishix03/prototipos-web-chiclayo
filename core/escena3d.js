// Motor 3D común a los rubros (ADR 008 y 009): un conjunto de piezas pasa de una composición
// «inicial» a una «ordenada» según el avance del scroll (0 → 1). Cada rubro aporta sus piezas,
// su fondo, su cámara y sus dos composiciones; esto solo interpola y dibuja.
//
// Reglas de costo (aprendidas en la maqueta «La olla manda»):
// - se redibuja solo cuando el avance o el cursor cambian: quieta, la escena no gasta nada;
// - el bucle se apaga con la pestaña oculta;
// - lo que se mueve siempre (vapor, brillos) va en CSS, no aquí.
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

/** Azar con semilla: la imagen fija y la escena viva salen idénticas. */
export function azar(semilla) {
  return () => {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const suave = (x) => x * x * (3 - 2 * x);
const mezclar = (a, b, t) => a + (b - a) * t;

/**
 * @param {HTMLElement} contenedor  recibe el canvas (lo cubre entero)
 * @param {object} d  dirección del rubro:
 *   grupos: [{ piezas: string[] }], crearPieza(clave) → Object3D,
 *   fondo(escena, aspecto), camara(t, aspecto) → {pos, mira},
 *   inicial(i, azar[], aspecto, pieza) y ordenado(g, k, n, aspecto, pieza) → {pos, rot, escala},
 *   luz, niebla, sombras, fov, exposicion,
 *   ligera(aspecto) → true para la versión de celular: sin sombras, la mitad de las piezas,
 *   densidad de píxeles 1 y sin antialias (Lighthouse móvil, ADR 008),
 *   cuadro(t, contexto) → opcional: escenas sin piezas (cromo, agua) se actualizan aquí.
 *   fondo devuelve lo que necesite cuadro (contexto.mundo).
 * @param {() => number} avance  avance del scroll entre 0 y 1
 * @param {{ fija?: boolean, ancho?: number, alto?: number }} [opciones]
 *   fija: dibuja un solo cuadro (para la imagen fija del LCP) con ese tamaño
 */
export function montarEscena(contenedor, d, avance, opciones = {}) {
  const r = azar(d.semilla ?? 11);
  const fija = !!opciones.fija;
  const medida = () => ({
    w: fija ? opciones.ancho : contenedor.clientWidth,
    h: fija ? opciones.alto : contenedor.clientHeight,
  });
  let aspecto = medida().w / medida().h;
  const ligera = d.ligera?.(aspecto) ?? false;
  const sombras = !!d.sombras && !ligera;
  const renderer = new WebGLRenderer({ antialias: !ligera, preserveDrawingBuffer: fija });
  renderer.setPixelRatio(fija || ligera ? 1 : Math.min(devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = d.exposicion ?? 1;
  renderer.shadowMap.enabled = sombras;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(d.cielo ?? '#000000');
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const escena = new Scene();
  if (d.niebla) escena.fog = new Fog(new Color(d.niebla.color), d.niebla.cerca, d.niebla.lejos);
  escena.add(new HemisphereLight(d.luz.cielo, d.luz.suelo, d.luz.ambiente));
  const sol = new DirectionalLight(d.luz.sol, d.luz.intensidad);
  sol.position.set(...d.luz.posicion);
  if (sombras) {
    sol.castShadow = true;
    sol.shadow.mapSize.set(fija ? 2048 : 1024, fija ? 2048 : 1024); // en vivo, la mitad: casi igual y 4× más barato
    Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, far: 60 });
    sol.shadow.radius = 6;
    sol.shadow.bias = -0.0004;
  }
  escena.add(sol);

  const camara = new PerspectiveCamera(d.fov ?? 35, 1, 0.1, 100);
  const mundo = d.fondo(escena, aspecto, { sombras, ligera, renderer }) ?? {};

  const piezas = [];
  let i = 0;
  (d.grupos ?? []).forEach((grupo, g) => {
    // Versión ligera: la mitad de las piezas de cada grupo
    const claves = ligera ? grupo.piezas.filter((_, k) => k % 2 === 0) : grupo.piezas;
    claves.forEach((clave, k) => {
      const obj = d.crearPieza(clave);
      obj.traverse((m) => {
        if (m.isMesh) m.castShadow = sombras;
      });
      piezas.push({
        obj,
        i: i++,
        g,
        k,
        n: claves.length,
        azar: Array.from({ length: 6 }, r),
        retraso: (g * 0.08 + k * 0.03) % 0.4,
      });
      escena.add(obj);
    });
  });

  const pose = (o) => ({
    pos: new Vector3(...o.pos),
    rot: new Vector3(...o.rot),
    escala: o.escala ?? 1,
  });
  // Versión ligera: el canvas se dibuja al 70 % y el navegador lo agranda (CSS lo estira al
  // 100 %). Con render por software, la cantidad de píxeles es lo que más cuesta.
  const resolucion = ligera && !fija ? 0.7 : 1;
  function ajustar() {
    const { w, h } = medida();
    renderer.setSize(Math.round(w * resolucion), Math.round(h * resolucion), false);
    aspecto = w / h;
    camara.aspect = aspecto;
    camara.updateProjectionMatrix();
    for (const p of piezas) {
      p.desde = pose(d.inicial(p.i, p.azar, aspecto, p.obj.userData.tipo));
      p.hasta = pose(d.ordenado(p.g, p.k, p.n, aspecto, p.obj.userData.tipo));
    }
  }

  function dibujar(t) {
    for (const p of piezas) {
      const local = suave(Math.min(1, Math.max(0, (t - p.retraso) / 0.6)));
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
    d.cuadro?.(t, { escena, camara, aspecto, ligera, mundo });
    renderer.render(escena, camara);
  }

  /** Centro de cada grupo ya ordenado, en px de pantalla: ahí se anclan las etiquetas. */
  function centros() {
    const c = d.camara(1, aspecto);
    const cam = camara.clone();
    cam.position.set(...c.pos);
    cam.lookAt(...c.mira);
    cam.updateMatrixWorld();
    const { w, h } = medida();
    return (d.grupos ?? []).map((_, g) => {
      const del = piezas.filter((p) => p.g === g);
      const v = del.reduce((s, p) => s.add(p.hasta.pos), new Vector3()).divideScalar(del.length);
      v.project(cam);
      return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
    });
  }

  ajustar();
  const canvas = renderer.domElement;
  if (fija) {
    dibujar(avance());
    return { canvas, centros };
  }

  contenedor.append(canvas);
  let actual = -1;
  const bucle = () => {
    const t = avance();
    if (actual < 0 || Math.abs(t - actual) > 0.0005) {
      actual = actual < 0 ? t : actual + (t - actual) * 0.18; // el scroll llega con inercia
      dibujar(actual);
      if (!contenedor.hasAttribute('data-viva')) contenedor.setAttribute('data-viva', '');
    }
  };
  const encender = () => renderer.setAnimationLoop(document.hidden ? null : bucle);
  document.addEventListener('visibilitychange', encender);
  new ResizeObserver(() => {
    ajustar();
    dibujar(Math.max(0, actual));
  }).observe(contenedor);
  // Los shaders se compilan sin bloquear (si el navegador lo permite); mientras, se ve la imagen fija
  renderer.compileAsync(escena, camara).then(encender);
  return { canvas, centros };
}
