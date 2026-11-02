import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

// Convierte la silueta del logo en contornos simplificados. Solo corre fuera del navegador.
const rubros = ['restaurante', 'barberia', 'dental', 'spa', 'veterinaria', 'gimnasio'];
const area = (p) =>
  p.reduce((s, a, i) => {
    const b = p[(i + 1) % p.length];
    return s + a[0] * b[1] - b[0] * a[1];
  }, 0) / 2;
function dentro(p, pol) {
  let c = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const a = pol[i],
      b = pol[j];
    if (
      a[1] > p[1] !== b[1] > p[1] &&
      p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      c = !c;
  }
  return c;
}
function distancia(p, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function simplificar(p, t = 1.1) {
  if (p.length < 4) return p;
  let d = 0,
    k = 0;
  for (let i = 1; i < p.length - 1; i++) {
    const x = distancia(p[i], p[0], p.at(-1));
    if (x > d) {
      d = x;
      k = i;
    }
  }
  return d > t
    ? [...simplificar(p.slice(0, k + 1), t).slice(0, -1), ...simplificar(p.slice(k), t)]
    : [p[0], p.at(-1)];
}
for (const rubro of rubros) {
  const original = `docs/visual/imagenes/logos/${rubro}.png`;
  const { data, info } = await sharp(original)
    .trim({ threshold: 10 })
    .resize({ width: 256, height: 256, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const llena = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < w &&
    y < h &&
    data[(y * w + x) * 4 + 3] > 127 &&
    Math.min(data[(y * w + x) * 4], data[(y * w + x) * 4 + 1], data[(y * w + x) * 4 + 2]) < 238;
  const edges = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (llena(x, y)) {
        if (!llena(x, y - 1))
          edges.push([
            [x, y],
            [x + 1, y],
          ]);
        if (!llena(x + 1, y))
          edges.push([
            [x + 1, y],
            [x + 1, y + 1],
          ]);
        if (!llena(x, y + 1))
          edges.push([
            [x + 1, y + 1],
            [x, y + 1],
          ]);
        if (!llena(x - 1, y))
          edges.push([
            [x, y + 1],
            [x, y],
          ]);
      }
  const porInicio = new Map();
  edges.forEach((e, i) => {
    const k = e[0].join(',');
    if (!porInicio.has(k)) porInicio.set(k, []);
    porInicio.get(k).push(i);
  });
  const vistos = new Set(),
    lazos = [];
  for (let i = 0; i < edges.length; i++)
    if (!vistos.has(i)) {
      const p = [];
      let actual = i;
      while (actual !== undefined && !vistos.has(actual)) {
        vistos.add(actual);
        p.push(edges[actual][0]);
        actual = porInicio.get(edges[actual][1].join(','))?.find((x) => !vistos.has(x));
      }
      if (p.length > 8 && Math.abs(area(p)) > 3) lazos.push(p);
    }
  const exteriores = lazos.filter((p) => area(p) > 0).map((exterior) => ({ exterior, huecos: [] }));
  for (const hole of lazos.filter((p) => area(p) < 0)) {
    const padre = exteriores
      .filter((x) => dentro(hole[0], x.exterior))
      .sort((a, b) => Math.abs(area(a.exterior)) - Math.abs(area(b.exterior)))[0];
    padre?.huecos.push(hole);
  }
  const convertir = (p) =>
    simplificar([...p, p[0]])
      .slice(0, -1)
      .map(([x, y]) => [
        Number(((x - w / 2) / Math.max(w, h)).toFixed(4)),
        Number(((h / 2 - y) / Math.max(w, h)).toFixed(4)),
      ]);
  const contornos = exteriores
    .map((x) => ({ exterior: convertir(x.exterior), huecos: x.huecos.map(convertir) }))
    .filter((x) => x.exterior.length >= 3);
  writeFileSync(`${rubro}/img/marca/relieve.json`, JSON.stringify({ contornos }) + '\n');
  console.log(
    rubro,
    contornos.length,
    'formas',
    contornos.reduce((s, x) => s + x.exterior.length + x.huecos.flat().length, 0),
    'puntos',
  );
}
