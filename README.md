# Prototipos web por rubro · Chiclayo

Prototipos web para negocios locales (restaurante, spa, barbería, veterinaria, clínica dental y gimnasio) construidos sobre un **núcleo común**. Cada prototipo se personaliza cambiando un solo archivo, `negocio.json`, sin tocar código.

- Plan técnico: [docs/PLAN.md](docs/PLAN.md)
- Decisiones de arquitectura (ADR): [docs/decisiones/](docs/decisiones/)
- Sitio publicado: https://nishix03.github.io/prototipos-web-chiclayo/

## Requisitos

- Node.js 22 o superior (en WSL: `nvm install --lts`)
- Para `npm run a11y`, una sola vez: `npx browser-driver-manager install chrome`
- Para `npm run test:teclado`, una sola vez: `npx playwright install chromium`

## Comandos

| Comando                                              | Qué hace                                                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm install`                                        | Instala las dependencias                                                                            |
| `npm run dev`                                        | Servidor de desarrollo con recarga al guardar (incluido `negocio.json`)                             |
| `npm run build`                                      | Valida cada `negocio.json`, genera el HTML y deja el sitio en `dist/`                               |
| `npm run preview`                                    | Sirve `dist/` para revisar la versión de producción                                                 |
| `npm run lint`                                       | Revisa el código con ESLint                                                                         |
| `npm run format`                                     | Da formato a todo con Prettier                                                                      |
| `npm run a11y`                                       | Construye y audita la accesibilidad de cada página con Axe (WCAG 2.1 AA)                            |
| `npm run test:teclado`                               | Construye y prueba cada página solo con teclado (Playwright, ADR 006), con la hora de Lima simulada |
| `npm run fotos -- buscar "<consulta>"`               | Busca fotos en Openverse con licencia permitida (cc0, by, by-sa)                                    |
| `npm run fotos -- bajar <id> <carpeta>/img/<nombre>` | Descarga la foto en WebP tras verificar su licencia y escribe su `credito`                          |
| `npm run fuentes`                                    | Recorta las fuentes de cada rubro a los caracteres del español y a los pesos que usa                |
| `npm run poster -- <rubro>`                          | Genera la imagen fija (LCP) desde la escena 3D del rubro y verifica su límite de peso (ADR 008)     |
| `npm run control -- <rubro>`                         | Control de exigencias (ADR 009) sobre el build: mide la primera pantalla y captura 3 cuadros        |
| `npm run lighthouse -- <rubro>`                      | Lighthouse 12 sobre build + preview, mediana de 5 en celular y escritorio                           |
| `node scripts/video.mjs <rubro>`                     | Graba el recorrido a 360 y 1440 px (con `FFMPEG=<ruta>` deja MP4)                                   |
| `npm run storyboard`                                 | Sirve los storyboards del paso 2 del restaurante (`docs/visual/restaurante-cocina-abierta/`)        |

## Cómo funciona

```text
negocio.json ──► core/validar.js ──► core/render.js ──► componentes ──► HTML completo en dist/
 (datos)          (ajv + esquema)    (plugin de Vite)   (hero, mapa…)    (se lee sin JavaScript)
```

1. Cada carpeta con `index.html` + `negocio.json` + `rubro.schema.json` es una página (`_ejemplo/`, `restaurante/`…).
2. Al construir, `core/render.js` valida el JSON contra el `rubro.schema.json` de su carpeta, que extiende [core/negocio.schema.json](core/negocio.schema.json) (ADR 005), y reemplaza los marcadores del HTML:
   - `<!-- @head -->` → título, descripción, Open Graph, colores del negocio y datos estructurados `LocalBusiness`;
   - `<!-- @componente hero -->` → el HTML del componente (los de `core/componentes/` más los de `<carpeta>/componentes/`).
3. En el navegador, `app.js` solo añade lo que depende del momento de la visita, como "Abierto ahora" con la hora de Lima.

## Crear un prototipo nuevo

1. Copiar `_ejemplo/` con el nombre del rubro o del negocio.
2. Si el rubro tiene campos propios (carta, servicios…), agregarlos en su `rubro.schema.json`.
3. Editar `negocio.json`: VS Code autocompleta y marca los errores gracias al esquema.
4. Poner las fotos en `img/` en formato WebP (las de stock, con `npm run fotos`).
5. `npm run dev` para verlo; `npm run lint`, `npm run test:teclado` y `npm run a11y` antes de cada commit.

Si `"demo": true`, la página muestra un aviso de demostración: nunca se presenta contenido ficticio como real.

## Estructura

```text
core/
  tokens.css · base.css · core.css   design tokens, estilos base y punto de entrada
  negocio.schema.json · validar.js   esquema (única fuente de verdad) y validación
  render.js                          prerender: negocio.json → HTML (plugin de Vite)
  whatsapp.js · horario.js           enlaces wa.me y horario con hora de Lima
  escena3d.js · carga3d.js           motor 3D común (Three.js) y cuándo cargarlo (ADR 008)
  componentes/                       hero, galería, reseñas, mapa, footer, botón flotante, comparador
_ejemplo/                            página de prueba y plantilla para copiar
restaurante/                         rubro 1 «El pase»: riel de comandas, ingredientes 3D que caen en sus bowls, comanda y reservas
barberia/                            rubro 2 «Filo»: cromo líquido 3D, letrero con la espera de hoy y turno con corte, día, barbero y hora
dental/                              rubro 3 «Calma clínica»: sonrisa de vidrio 3D, cuestionario «¿Qué tratamiento necesito?» y precios «desde»
spa/                                 rubro 4 «Agua quieta»: agua 3D (shader), cita en 3 pasos que respira, paquetes y comparador antes/después
veterinaria/                         rubro 5 «Juego y urgencia»: barra de urgencias 24 h, juguetes 3D que siguen al cursor y calendario de vacunas
docs/decisiones/                     ADR
docs/visual/                         brief visual de cada rubro, con maqueta y capturas
pruebas/teclado/                     pruebas E2E con Playwright (teclado y horario)
scripts/a11y.js · scripts/fotos.js   auditoría con Axe y fotos de Openverse con licencia verificada
.github/workflows/deploy.yml         publica en GitHub Pages en cada push a main
```
