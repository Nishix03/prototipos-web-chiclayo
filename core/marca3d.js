import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Mesh,
  MeshMatcapMaterial,
  Path,
  Shape,
  SRGBColorSpace,
  Vector2,
} from 'three';

// Geometría pequeña derivada del símbolo real, precalculada fuera del navegador.
// Se comparte entre instancias: los cuatro sellos de un bowl no duplican vértices ni texturas.
const geometrias = new WeakMap();
const materiales = new Map();
export function materialMarca(color) {
  if (materiales.has(color)) return materiales.get(color);
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const base = new Color(color);
  const d = g.createRadialGradient(44, 36, 3, 64, 64, 72);
  d.addColorStop(0, `#${base.clone().lerp(new Color('#ffffff'), 0.62).getHexString()}`);
  d.addColorStop(0.5, color);
  d.addColorStop(1, `#${base.clone().multiplyScalar(0.35).getHexString()}`);
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  const textura = new CanvasTexture(c);
  textura.colorSpace = SRGBColorSpace;
  const material = new MeshMatcapMaterial({ matcap: textura });
  materiales.set(color, material);
  return material;
}
export function relieveMarca(
  datos,
  { color = '#d4a937', ancho = 1, profundidad = 0.07, bisel = 0.008, material } = {},
) {
  let cache = geometrias.get(datos);
  if (!cache) {
    cache = new Map();
    geometrias.set(datos, cache);
  }
  const clave = `${profundidad}/${bisel}`;
  if (!cache.has(clave)) {
    const formas = datos.contornos.map((c) => {
      const s = new Shape(c.exterior.map((p) => new Vector2(...p)));
      s.closePath();
      s.holes = c.huecos.map((h) => {
        const hueco = new Path(h.map((p) => new Vector2(...p)));
        hueco.closePath();
        return hueco;
      });
      return s;
    });
    const geometria = new ExtrudeGeometry(formas, {
      depth: profundidad,
      steps: 1,
      bevelEnabled: bisel > 0,
      bevelSize: bisel,
      bevelThickness: bisel,
      bevelSegments: 1,
      curveSegments: 3,
    });
    geometria.translate(0, 0, -profundidad / 2);
    cache.set(clave, geometria);
  }
  const mesh = new Mesh(cache.get(clave), material ?? materialMarca(color));
  mesh.scale.setScalar(ancho);
  return mesh;
}
