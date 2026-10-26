// Plugin de Vite que convierte negocio.json en HTML al construir (prerender).
//
// Para cada index.html que tenga un negocio.json al lado:
//   1. lee y valida el JSON contra el rubro.schema.json de su carpeta (si falla, el build se detiene);
//   2. mide todas las imágenes con sharp para escribir width/height y junta sus créditos;
//   3. reemplaza <!-- @head --> por title, meta, Open Graph, colores y JSON-LD;
//   4. reemplaza cada <!-- @componente nombre --> por el HTML del componente
//      (los de core/componentes más los de <carpeta>/componentes, si existen);
//   5. inserta el aviso de demo si "demo": true.
// El resultado es HTML completo: Google, WhatsApp y un navegador sin JS ven todo el contenido.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { validarNegocio } from './validar.js';
import { html, crudo, escapar } from './componentes/html.js';
import { textoLegibleSobre } from './contraste.js';

const CORE_COMPONENTES = fileURLToPath(new URL('./componentes/index.js', import.meta.url));

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

function leerNegocio(archivo, carpeta, raiz) {
  let negocio;
  try {
    negocio = JSON.parse(readFileSync(archivo, 'utf8'));
  } catch (error) {
    throw new Error(`${archivo} no es JSON válido: ${error.message}`, { cause: error });
  }
  const esquema = join(carpeta, 'rubro.schema.json');
  if (!existsSync(esquema)) throw new Error(`Falta ${esquema} (copiarlo de _ejemplo/)`);
  const errores = validarNegocio(negocio, esquema, raiz);
  if (errores.length) {
    throw new Error(`${archivo} tiene errores:\n  - ${errores.join('\n  - ')}`);
  }
  return negocio;
}

const esImagen = (valor) =>
  valor && typeof valor === 'object' && typeof valor.src === 'string' && 'alt' in valor;

/**
 * Recorre todo el negocio (imágenes, fotos de la carta, de los barberos…) y le añade a cada
 * imagen su ancho y alto reales. Devuelve también la lista de créditos sin repetir.
 */
async function medirImagenes(negocio, carpeta) {
  const creditos = new Map();
  const recorrer = async (valor) => {
    if (Array.isArray(valor)) return Promise.all(valor.map(recorrer));
    if (!valor || typeof valor !== 'object') return valor;
    if (esImagen(valor)) {
      const ruta = join(carpeta, valor.src);
      if (!existsSync(ruta)) throw new Error(`No existe la imagen ${ruta}`);
      const { width, height } = await sharp(ruta).metadata();
      if (valor.credito) creditos.set(valor.src, valor.credito);
      return { ...valor, ancho: width, alto: height };
    }
    const copia = {};
    for (const [clave, hijo] of Object.entries(valor)) copia[clave] = await recorrer(hijo);
    return copia;
  };
  return { negocio: await recorrer(negocio), creditos: [...creditos.values()] };
}

/**
 * Carga los componentes del núcleo y los propios de la página.
 * En desarrollo usa el cargador de Vite (ssrLoadModule), que ve los cambios sin reiniciar;
 * al construir usa import() normal.
 */
async function cargarComponentes(carpeta, servidor) {
  const cargar = (archivo) =>
    servidor ? servidor.ssrLoadModule(archivo) : import(pathToFileURL(archivo).href);
  const nucleo = await cargar(CORE_COMPONENTES);
  const archivoPropios = join(carpeta, 'componentes', 'index.js');
  const propios = existsSync(archivoPropios) ? (await cargar(archivoPropios)).componentes : {};

  const repetidos = Object.keys(propios).filter((nombre) => nombre in nucleo.componentes);
  if (repetidos.length) {
    throw new Error(`${archivoPropios} repite componentes del núcleo: ${repetidos.join(', ')}`);
  }
  return { componentes: { ...nucleo.componentes, ...propios }, avisoDemo: nucleo.avisoDemo };
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
    <meta name="theme-color" content="${tema.fondo}" />
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
      /* :root:root gana a los :root de los CSS que se cargan después (más especificidad) */
      :root:root {
        --color-marca: ${tema.marca};
        --color-sobre-marca: ${textoLegibleSobre(tema.marca)};
        --color-acento: ${tema.acento};
        --color-sobre-acento: ${textoLegibleSobre(tema.acento)};
        --color-fondo: ${tema.fondo};
        --color-texto: ${tema.texto};
      }
    </style>

    <script type="application/ld+json">
      ${crudo(jsonEnScript(datosEstructurados(negocio, urlPagina)))}
    </script>
    <script type="application/json" id="datos-negocio">
      ${crudo(jsonEnScript({ horario: negocio.horario, whatsapp: negocio.contacto.whatsapp }))}
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

    // En desarrollo: cambiar datos, esquemas o componentes recarga el navegador,
    // porque todos influyen en el HTML que genera este plugin.
    configureServer(servidor) {
      const influyeEnHtml = /negocio\.json$|\.schema\.json$|[\\/]componentes[\\/].+\.js$/;
      servidor.watcher.on('change', (archivo) => {
        if (influyeEnHtml.test(archivo)) servidor.ws.send({ type: 'full-reload' });
      });
    },

    transformIndexHtml: {
      // 'pre': antes de que Vite procese el HTML, para que también optimice
      // las imágenes y enlaces que generan los componentes.
      order: 'pre',
      async handler(contenido, { filename, server: servidor }) {
        const carpeta = dirname(filename);
        const archivoNegocio = join(carpeta, 'negocio.json');
        if (!existsSync(archivoNegocio)) return contenido;

        const leido = leerNegocio(archivoNegocio, carpeta, config.root);
        const { negocio, creditos } = await medirImagenes(leido, carpeta);
        const { componentes, avisoDemo } = await cargarComponentes(carpeta, servidor);

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
            return String(componente(negocio, { creditos, urlPagina }));
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
