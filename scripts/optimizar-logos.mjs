import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const logos = JSON.parse(readFileSync('docs/visual/imagenes/manifest-logos.json', 'utf8'));
mkdirSync('docs/visual/imagenes/logos', { recursive: true });
for (const l of logos) {
  copyFileSync(l.path, `docs/visual/imagenes/logos/${l.rubro}.png`);
  const dir = `${l.rubro}/img/marca`;
  mkdirSync(dir, { recursive: true });
  const recorte = await sharp(l.path).trim({ threshold: 10 }).png().toBuffer();
  for (const ancho of [48, 96, 192])
    writeFileSync(
      `${dir}/simbolo-${ancho}.webp`,
      await sharp(recorte)
        .resize(ancho, ancho, { fit: 'contain', background: '#00000000' })
        .webp({ lossless: true, effort: 5 })
        .toBuffer(),
    );
  writeFileSync(
    `${dir}/favicon.png`,
    await sharp(recorte)
      .resize(64, 64, { fit: 'contain', background: '#00000000' })
      .png()
      .toBuffer(),
  );
  const archivo = `${l.rubro}/negocio.json`;
  const d = JSON.parse(readFileSync(archivo, 'utf8'));
  d.imagenes.logo = {
    src: 'img/marca/simbolo-192.webp',
    variantes: ['img/marca/simbolo-48.webp', 'img/marca/simbolo-96.webp'],
    alt: `Símbolo de ${d.nombre.split(' · ')[0]}`,
    creditoIA: { herramienta: 'ChatGPT / Codex (image_gen)', fecha: '2026-11-01' },
  };
  d.imagenes.icono = 'img/marca/favicon.png';
  writeFileSync(archivo, JSON.stringify(d, null, 2) + '\n');
  console.log(l.rubro);
}
