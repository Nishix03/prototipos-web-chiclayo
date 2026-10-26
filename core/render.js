// Plugin de Vite que convierte negocio.json en HTML al construir (prerender).
//
// Para cada index.html que tenga un negocio.json al lado:
//   1. lee y valida el JSON contra core/negocio.schema.json (si falla, el build se detiene);
//   2. mide las imágenes con sharp para escribir width/height;
//   3. reemplaza <!-- @head --> por title, meta, Open Graph, colores y JSON-LD;
//   4. reemplaza cada <!-- @componente nombre --> por el HTML del componente;
//   5. inserta el aviso de demo si "demo": true.
// El resultado es HTML completo: Google, WhatsApp y un navegador sin JS ven todo el contenido.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';
import { validarNegocio } from './validar.js';
import { componentes, avisoDemo } from './componentes/index.js';
import { html, crudo, escapar } from './componentes/html.js';
import { textoLegibleSobre } from './contraste.js';

const MARCA_HEAD = /<!--\s*@head\s*-->/;
const MARCA_COMPONENTE = /<!--\s*@componente\s+([\w-]+)\s*-->/g;

const TIPO_SCHEMA = {
  ejemplo: 'LocalBusiness',
  restaurante: 'Restaurant',
  spa: 'DaySpa',
  barberia: 'HairSalon',
  veterinaria: 'VeterinaryCare',
  dental: 'Dentist',
  gimnasio: 'ExerciseGym',
};
const DIA_SCHEMA = {
  lun: 'Monday',
  mar: 'Tuesday',
  mie: 'Wednesday',
  jue: 'Thursday',
  vie: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
};

function leerNegocio(archivo) {
  let negocio;
  try {
    negocio = JSON.parse(readFileSync(archivo, 'utf8'));
  } catch (error) {
    throw new Error(`${archivo} no es JSON válido: ${error.message}`, { cause: error });
  }
  const errores = validarNegocio(negocio);
  if (errores.length) {
    throw new Error(`${archivo} tiene errores:\n  - ${errores.join('\n  - ')}`);
  }
  return negocio;
}

/** Devuelve una copia de las imágenes con ancho y alto reales. */
async function medirImagenes(imagenes, carpeta) {
  const medir = async (img) => {
    const ruta = join(carpeta, img.src);
    if (!existsSync(ruta)) throw new Error(`No existe la imagen ${ruta}`);
    const { width, height } = await sharp(ruta).metadata();
    return { ...img, ancho: width, alto: height };
  };
  const resultado = { hero: await medir(imagenes.hero) };
  if (imagenes.galeria) resultado.galeria = await Promise.all(imagenes.galeria.map(medir));
  if (imagenes.og) resultado.og = await medir(imagenes.og);
  return resultado;
}

function datosEstructurados(negocio, urlPagina) {
  const { ubicacion: u, contacto, horario } = negocio;
  const datos = {
    '@context': 'https://schema.org',
    '@type': TIPO_SCHEMA[negocio.rubro],
    name: negocio.nombre,
    description: negocio.descripcion,
    url: urlPagina,
    telephone: `+51${contacto.telefono ?? contacto.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: u.direccion,
      addressLocality: u.ciudad,
      addressRegion: u.region,
      addressCountry: 'PE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: u.lat, longitude: u.lng },
    openingHoursSpecification: Object.entries(horario).flatMap(([dia, rangos]) =>
      rangos.map(([opens, closes]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DIA_SCHEMA[dia],
        opens,
        closes,
      })),
    ),
  };
  if (negocio.redes) datos.sameAs = Object.values(negocio.redes);
  return datos;
}

/** JSON seguro dentro de <script>: un "</script>" en los datos no puede cerrar la etiqueta. */
const jsonEnScript = (valor) => JSON.stringify(valor).replace(/</g, '\\u003c');

/** Favicon SVG embebido: la inicial del negocio sobre su color de marca, sin archivo aparte. */
function favicon(nombre, marca) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="${marca}"/>` +
    `<text x="32" y="44" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="${textoLegibleSobre(marca)}">${escapar(nombre.trim()[0].toUpperCase())}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function cabecera(negocio, urlPagina) {
  const { tema, imagenes } = negocio;
  const titulo = `${negocio.nombre} · ${negocio.ubicacion.ciudad}`;
  const imagenOg = imagenes.og ?? imagenes.hero;

  return html`
    <title>${titulo}</title>
    <meta name="description" content="${negocio.descripcion}" />
    <link rel="canonical" href="${urlPagina}" />
    <meta name="theme-color" content="${tema.marca}" />
    <link rel="icon" href="${favicon(negocio.nombre, tema.marca)}" />

    <meta property="og:type" content="website" />
    <meta property="og:locale" content="es_PE" />
    <meta property="og:title" content="${titulo}" />
    <meta property="og:description" content="${negocio.descripcion}" />
    <meta property="og:url" content="${urlPagina}" />
    <meta property="og:image" content="${imagenOg.src}" />
    <meta property="og:image:alt" content="${imagenOg.alt}" />
    <meta name="twitter:card" content="summary_large_image" />

    <style>
      :root {
        --color-marca: ${tema.marca};
        --color-sobre-marca: ${textoLegibleSobre(tema.marca)};
        --color-acento: ${tema.acento};
        --color-fondo: ${tema.fondo};
        --color-texto: ${tema.texto};
      }
    </style>

    <script type="application/ld+json">
      ${crudo(jsonEnScript(datosEstructurados(negocio, urlPagina)))}
    </script>
    <script type="application/json" id="datos-negocio">
      ${crudo(jsonEnScript({ horario: negocio.horario }))}
    </script>
  `;
}

/**
 * @param {{ sitio: string }} opciones  origen público, p. ej. 'https://nishix03.github.io'
 */
export function prerenderNegocio({ sitio }) {
  let config;

  const prerender = {
    name: 'prerender-negocio',

    configResolved(resuelta) {
      config = resuelta;
    },

    // En desarrollo: guardar un negocio.json recarga el navegador
    configureServer(servidor) {
      servidor.watcher.on('change', (archivo) => {
        if (archivo.endsWith('negocio.json')) servidor.ws.send({ type: 'full-reload' });
      });
    },

    transformIndexHtml: {
      // 'pre': antes de que Vite procese el HTML, para que también optimice
      // las imágenes y enlaces que generan los componentes.
      order: 'pre',
      async handler(contenido, { filename }) {
        const carpeta = dirname(filename);
        const archivoNegocio = join(carpeta, 'negocio.json');
        if (!existsSync(archivoNegocio)) return contenido;

        const negocio = leerNegocio(archivoNegocio);
        negocio.imagenes = await medirImagenes(negocio.imagenes, carpeta);

        const ruta = relative(config.root, carpeta).split('\\').join('/');
        const urlPagina = new URL(`${config.base}${ruta ? `${ruta}/` : ''}`, sitio).href;

        if (!MARCA_HEAD.test(contenido)) {
          throw new Error(`${filename} no tiene el marcador <!-- @head -->`);
        }

        let resultado = contenido
          .replace(MARCA_HEAD, () => String(cabecera(negocio, urlPagina)))
          .replace(MARCA_COMPONENTE, (_, nombre) => {
            const componente = componentes[nombre];
            if (!componente) {
              const disponibles = Object.keys(componentes).join(', ');
              throw new Error(
                `Componente desconocido "${nombre}" en ${filename}. Disponibles: ${disponibles}`,
              );
            }
            return String(componente(negocio));
          });

        if (negocio.demo) {
          resultado = resultado.replace(/<body[^>]*>/, (body) => `${body}${avisoDemo()}`);
        }
        return resultado;
      },
    },
  };

  // Segundo paso, al final del build: cuando Vite ya escribió la ruta con hash
  // (/…/assets/og-AbC123.webp), se le antepone el dominio. WhatsApp y Facebook solo
  // aceptan URLs absolutas en og:image.
  const ogAbsoluta = {
    name: 'prerender-negocio:og-absoluta',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, paquete) {
      for (const archivo of Object.values(paquete)) {
        if (archivo.type !== 'asset' || !archivo.fileName.endsWith('.html')) continue;
        archivo.source = String(archivo.source).replace(
          /(<meta property="og:image" content=")(\/[^"]+)"/,
          (_, inicio, ruta) => `${inicio}${new URL(ruta, sitio).href}"`,
        );
      }
    },
  };

  return [prerender, ogAbsoluta];
}
