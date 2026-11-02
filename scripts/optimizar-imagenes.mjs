import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

// Postproducción reproducible: las imágenes se generan con image_gen, aquí solo se comprimen.
const raiz = resolve(import.meta.dirname, '..');
const archivo = resolve(raiz, process.argv[2] ?? 'docs/visual/imagenes/manifest-generacion.json');
const manifest = JSON.parse(readFileSync(archivo, 'utf8'));
const rubros = ['spa', 'dental', 'barberia', 'gimnasio', 'veterinaria', 'restaurante'];
const datos = Object.fromEntries(
  rubros.map((r) => [r, JSON.parse(readFileSync(resolve(raiz, r, 'negocio.json'), 'utf8'))]),
);
const resultados = [];
async function optimizar(item, prefijo, anchos) {
  if (!rubros.includes(item.rubro) || !item.path || !/^[a-z0-9-]+$/.test(prefijo))
    throw Error('Entrada de imagen no válida.');
  const carpeta = resolve(raiz, item.rubro, 'img/generadas');
  mkdirSync(carpeta, { recursive: true });
  const variantes = [];
  for (const ancho of anchos) {
    let salida;
    const limite = ancho <= 320 ? 22_000 : ancho <= 480 ? 40_000 : ancho <= 960 ? 110_000 : 185_000;
    for (const quality of [76, 70, 64]) {
      salida = await sharp(item.path)
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toBuffer();
      if (salida.length <= limite) break;
    }
    const src = `img/generadas/${prefijo}-${ancho}.webp`;
    writeFileSync(resolve(raiz, item.rubro, src), salida);
    variantes.push(src);
    resultados.push({ rubro: item.rubro, src, bytes: salida.length });
  }
  return {
    src: variantes.at(-1),
    variantes: variantes.slice(0, -1),
    creditoIA: { herramienta: 'ChatGPT / Codex (image_gen)', fecha: '2026-11-01' },
  };
}
const editoriales = {
  spa: [
    'El tiempo se siente distinto',
    'Masajes, faciales y cuidado personal. Elige tu servicio con su precio y duración a la vista.',
    '#servicios',
    'Explorar los servicios',
    'Rincón de spa con agua ámbar, piedra cálida y toallas de lino',
  ],
  dental: [
    'Tu consulta, con calma',
    'Conoce los tratamientos, sus precios desde y la duración orientativa antes de pedir tu evaluación.',
    '#tratamientos',
    'Ver los tratamientos',
    'Consultorio dental ilustrativo con sillón blanco y mobiliario azul glaciar',
  ],
  barberia: [
    'El detalle hace el corte',
    'Clásicos, degradados y barba. Mira los estilos y elige quién se encarga de tu próximo corte.',
    '#cortes',
    'Encontrar mi corte',
    'Sillón de barbería de cuero negro, reflejos de cromo y luz dorada',
  ],
  gimnasio: [
    'Tu próxima sesión empieza aquí',
    'Funcional, spinning y box. Encuentra una clase que encaje en tu semana y añádela a tu plan.',
    '#clases',
    'Elegir mi próxima clase',
    'Zona de entrenamiento con mancuernas negras y pista de suelo lima',
  ],
  veterinaria: [
    'Un lugar para cuidarlos',
    'Consulta, vacunas y cuidado de tu mascota, con los precios desde y el acceso a urgencias siempre visibles.',
    '#servicios',
    'Ver cómo podemos ayudar',
    'Perro y gato en un ambiente veterinario ilustrativo con asientos turquesa',
  ],
  restaurante: [
    'Así sabe el norte',
    'Arroz con pato, cabrito y sabores de la casa. Elige tus platos y arma la comanda para WhatsApp.',
    '#carta',
    'Explorar la carta',
    'Plato ilustrativo de arroz con pato y salsa criolla sobre mesa terracota',
  ],
};
for (const item of manifest.ambientes) {
  const [titulo, texto, enlace, accion, alt] = editoriales[item.rubro];
  const foto = { ...(await optimizar(item, 'ambiente', [480, 960, 1440])), alt };
  datos[item.rubro].imagenes.editorial = { foto, titulo, texto, enlace, accion };
}
const listas = {
  barberia: 'cortes',
  spa: 'servicios',
  dental: 'tratamientos',
  veterinaria: 'servicios',
  gimnasio: 'tiposClase',
};
const alt = {
  'barberia/clasico': 'Corte clásico a tijera con raya al lado, referencia de estilo',
  'barberia/low-fade': 'Degradado bajo alrededor de la oreja con volumen arriba',
  'barberia/mid-fade': 'Degradado a media altura con textura en la parte superior',
  'barberia/mullet': 'Mullet moderno con lados cortos y nuca más larga',
  'barberia/buzz': 'Corte muy corto uniforme con máquina',
  'barberia/barba': 'Detalle de barba perfilada con líneas limpias',
  'barberia/corte-barba': 'Corte degradado acompañado de barba perfilada',
  'spa/relajante': 'Aceite de masaje y toallas de lino sobre piedra cálida',
  'spa/descontracturante': 'Utensilios de madera y bálsamo para masaje sobre toallas',
  'spa/piedras': 'Piedras de basalto para masaje sobre bandeja y toallas',
  'spa/limpieza-facial': 'Utensilios de limpieza facial y toalla sobre piedra arena',
  'spa/hidratacion': 'Mascarilla hidratante y brocha en un cuenco de vidrio ámbar',
  'spa/manicure': 'Mano con manicure en tono ámbar sobre lino',
  'spa/pedicure': 'Pies sobre toallas junto a un baño de pies',
  'dental/limpieza': 'Espejo, instrumental y pulidor dental en una bandeja azul',
  'dental/resina': 'Modelo de molar y guía de tonos para resina dental',
  'dental/endodoncia': 'Instrumental de endodoncia junto a un modelo dental',
  'dental/blanqueamiento': 'Lámpara y equipo ilustrativo de blanqueamiento dental',
  'dental/ortodoncia': 'Alineador transparente sobre un modelo de arcada dental',
  'dental/implante': 'Implante de titanio y corona cerámica de demostración',
  'veterinaria/consulta': 'Perro en una sala de consulta veterinaria ilustrativa',
  'veterinaria/vacuna': 'Carné y material de vacunación cerrado sobre una mesa turquesa',
  'veterinaria/desparasitacion': 'Gato junto a transportador y material veterinario cerrado',
  'veterinaria/cirugia': 'Sala veterinaria preparada sin animales ni procedimientos',
  'veterinaria/bano': 'Perro recién cepillado junto a una toalla y utensilios de baño',
  'gimnasio/funcional': 'Zona de funcional con pesas rusas y cuerda de entrenamiento',
  'gimnasio/spinning': 'Bicicletas de spinning negras en un estudio de entrenamiento',
  'gimnasio/box': 'Saco de box y guantes lima en un espacio de entrenamiento',
};
for (const item of manifest.servicios) {
  const fila = datos[item.rubro][listas[item.rubro]].find((x) => x.id === item.id);
  if (!fila) throw Error(`No existe el servicio ${item.rubro}/${item.id}`);
  fila.foto = {
    ...(await optimizar(item, `servicio-${item.id}`, [320, 480, 960])),
    alt: alt[`${item.rubro}/${item.id}`],
  };
}
// La carta conserva el original con licencia y entrega copias adaptables comprimidas.
manifest.stockOriginales ??= Object.fromEntries(
  datos.restaurante.carta
    .flatMap((c) => c.platos)
    .filter((p) => p.foto)
    .map((p) => [p.id, p.foto.src]),
);
for (const categoria of datos.restaurante.carta)
  for (const plato of categoria.platos) {
    if (!plato.foto) continue;
    const variantes = [];
    for (const ancho of [320, 480, 640]) {
      const src = `img/generadas/plato-${plato.id}-${ancho}.webp`;
      const buffer = await sharp(resolve(raiz, 'restaurante', manifest.stockOriginales[plato.id]))
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toBuffer();
      writeFileSync(resolve(raiz, 'restaurante', src), buffer);
      variantes.push(src);
      resultados.push({ rubro: 'restaurante', src, bytes: buffer.length });
    }
    plato.foto.src = variantes.at(-1);
    plato.foto.variantes = variantes.slice(0, -1);
  }
writeFileSync(archivo, JSON.stringify(manifest, null, 2) + '\n');
for (const [r, d] of Object.entries(datos))
  writeFileSync(resolve(raiz, r, 'negocio.json'), JSON.stringify(d, null, 2) + '\n');
writeFileSync(
  resolve(raiz, 'docs/visual/imagenes/pesos.json'),
  JSON.stringify(resultados, null, 2) + '\n',
);
console.log(
  `${manifest.ambientes.length} ambientes, ${manifest.servicios.length} servicios, ${resultados.length} archivos WebP. Total ${(resultados.reduce((s, x) => s + x.bytes, 0) / 1024).toFixed(0)} KB.`,
);
