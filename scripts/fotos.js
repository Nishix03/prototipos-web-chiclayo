// Fotos de stock desde Openverse con la licencia verificada ANTES de descargar.
//
//   npm run fotos -- buscar "arroz con pato"
//       Lista candidatas con licencia permitida (id, licencia, autor, tamaño).
//
//   npm run fotos -- bajar <id> <carpeta>/img/<nombre> [--ancho 900] [--alto 675]
//       Vuelve a consultar la licencia de esa foto, la descarga, la convierte a WebP
//       y escribe el bloque "credito" listo para pegar en negocio.json.
//
// Las licencias permitidas se leen de core/negocio.schema.json: la regla vive en un solo
// lugar y el build rechaza lo mismo que este script (ADR 005). Si Openverse devuelve
// otra licencia (pasó con una foto by-nc-nd), el script se detiene con un error en español.

import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const raiz = resolve(import.meta.dirname, '..');
const esquema = JSON.parse(readFileSync(resolve(raiz, 'core/negocio.schema.json'), 'utf8'));
const PERMITIDAS = esquema.$defs.credito.properties.licencia.enum;
const API = 'https://api.openverse.org/v1/images/';
const CABECERAS = { 'User-Agent': 'prototipos-web-chiclayo/1.0 (demo educativa)' };

function fallar(mensaje) {
  console.error(`\n✘ ${mensaje}\n`);
  process.exit(1);
}

async function pedir(url) {
  const respuesta = await fetch(url, { headers: CABECERAS });
  if (!respuesta.ok) fallar(`Openverse respondió ${respuesta.status} para ${url}`);
  return respuesta;
}

/** Corta si la licencia no está en la lista del esquema. Es la comprobación clave. */
function exigirLicencia(foto) {
  if (!PERMITIDAS.includes(foto.license)) {
    fallar(
      `La foto "${foto.title}" (${foto.id}) tiene licencia "${foto.license}". ` +
        `Solo se aceptan: ${PERMITIDAS.join(', ')}. Elige otra.`,
    );
  }
}

async function buscar(consulta) {
  const parametros = new URLSearchParams({
    q: consulta,
    license: PERMITIDAS.join(','),
    page_size: '12',
  });
  const { results } = await (await pedir(`${API}?${parametros}`)).json();
  // El filtro de la API no basta: se vuelve a comprobar cada resultado
  const validas = results.filter((foto) => PERMITIDAS.includes(foto.license));
  const descartadas = results.length - validas.length;
  for (const foto of validas) {
    const tamano = foto.width ? `${foto.width}×${foto.height}` : '¿?';
    console.log(
      `${foto.id}  ${foto.license.padEnd(5)} ${tamano.padEnd(10)} ${foto.title} — ${foto.creator}`,
    );
  }
  if (descartadas) console.log(`\n(${descartadas} descartadas por licencia no permitida)`);
}

async function bajar(id, destino, opciones) {
  if (!id || !destino)
    fallar('Uso: npm run fotos -- bajar <id> <carpeta>/img/<nombre> [--ancho N] [--alto N]');
  const foto = await (await pedir(`${API}${id}/`)).json();
  exigirLicencia(foto);

  const original = Buffer.from(await (await pedir(foto.url)).arrayBuffer());
  const salida = resolve(raiz, `${destino.replace(/\.webp$/, '')}.webp`);
  mkdirSync(dirname(salida), { recursive: true });

  let imagen = sharp(original).rotate();
  imagen = opciones.alto
    ? imagen.resize(opciones.ancho, opciones.alto, { fit: 'cover', position: 'attention' })
    : imagen.resize({ width: opciones.ancho, withoutEnlargement: true });
  const info = await imagen.webp({ quality: 78 }).toFile(salida);

  const credito = {
    titulo: foto.title,
    autor: foto.creator,
    licencia: foto.license,
    ...(foto.license_version && { version: foto.license_version }),
    urlFuente: foto.foreign_landing_url,
  };
  console.log(`✔ ${salida} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
  console.log('\nPega esto en la imagen, dentro de negocio.json:\n');
  console.log(JSON.stringify({ credito }, null, 2));
}

const [accion, ...args] = process.argv.slice(2);
const opcion = (nombre, defecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i === -1 ? defecto : Number(args[i + 1]);
};

if (accion === 'buscar') await buscar(args.join(' '));
else if (accion === 'bajar')
  await bajar(args[0], args[1], { ancho: opcion('ancho', 1600), alto: opcion('alto') });
else fallar('Uso: npm run fotos -- buscar "<consulta>"  |  npm run fotos -- bajar <id> <destino>');
