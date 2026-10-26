# Prototipos web por rubro · Chiclayo

Prototipos web para negocios locales (restaurante, spa, barbería, veterinaria, clínica dental y gimnasio) construidos sobre un **núcleo común**. Cada prototipo se personaliza cambiando un solo archivo, `negocio.json`, sin tocar código.

- Plan técnico: [docs/PLAN.md](docs/PLAN.md)
- Decisiones de arquitectura (ADR): [docs/decisiones/](docs/decisiones/)
- Sitio publicado: https://nishix03.github.io/prototipos-web-chiclayo/

## Requisitos

- Node.js 22 o superior (en WSL: `nvm install --lts`)
- Para `npm run a11y`, una sola vez: `npx browser-driver-manager install chrome`

## Comandos

| Comando           | Qué hace                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `npm install`     | Instala las dependencias                                                 |
| `npm run dev`     | Servidor de desarrollo con recarga al guardar (incluido `negocio.json`)  |
| `npm run build`   | Valida cada `negocio.json`, genera el HTML y deja el sitio en `dist/`    |
| `npm run preview` | Sirve `dist/` para revisar la versión de producción                      |
| `npm run lint`    | Revisa el código con ESLint                                              |
| `npm run format`  | Da formato a todo con Prettier                                           |
| `npm run a11y`    | Construye y audita la accesibilidad de cada página con Axe (WCAG 2.1 AA) |

## Cómo funciona

```text
negocio.json ──► core/validar.js ──► core/render.js ──► componentes ──► HTML completo en dist/
 (datos)          (ajv + esquema)    (plugin de Vite)   (hero, mapa…)    (se lee sin JavaScript)
```

1. Cada carpeta con `index.html` + `negocio.json` es una página (`_ejemplo/` hoy; un rubro por carpeta desde la fase 2).
2. Al construir, `core/render.js` valida el JSON contra [core/negocio.schema.json](core/negocio.schema.json) y reemplaza los marcadores del HTML:
   - `<!-- @head -->` → título, descripción, Open Graph, colores del negocio y datos estructurados `LocalBusiness`;
   - `<!-- @componente hero -->` → el HTML del componente.
3. En el navegador, `app.js` solo añade lo que depende del momento de la visita, como "Abierto ahora" con la hora de Lima.

## Crear un prototipo nuevo

1. Copiar `_ejemplo/` con el nombre del rubro o del negocio.
2. Editar `negocio.json`: VS Code autocompleta y marca los errores gracias al esquema.
3. Poner las fotos en `img/` en formato WebP.
4. `npm run dev` para verlo; `npm run build` y `npm run a11y` antes de publicar.

Si `"demo": true`, la página muestra un aviso de demostración: nunca se presenta contenido ficticio como real.

## Estructura

```text
core/
  tokens.css · base.css · core.css   design tokens, estilos base y punto de entrada
  negocio.schema.json · validar.js   esquema (única fuente de verdad) y validación
  render.js                          prerender: negocio.json → HTML (plugin de Vite)
  whatsapp.js · horario.js           enlaces wa.me y horario con hora de Lima
  componentes/                       hero, galería, reseñas, mapa, footer, botón flotante
_ejemplo/                            página de prueba y plantilla para copiar
docs/decisiones/                     ADR
scripts/a11y.js                      auditoría con Axe
.github/workflows/deploy.yml         publica en GitHub Pages en cada push a main
```
