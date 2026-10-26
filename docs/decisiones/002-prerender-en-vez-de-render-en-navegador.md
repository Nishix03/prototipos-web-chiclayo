# 002 – Prerender al construir en vez de render en el navegador

- **Estado:** aceptada (revisa la idea original del plan)
- **Fecha:** 2026-10-25
- **Fase:** 1

## Contexto

La primera versión del plan decía que `render.js` "lee `negocio.json` al cargar y construye la página con el DOM": el navegador descarga un HTML casi vacío, hace `fetch('negocio.json')` y crea los elementos con JavaScript.

Al sumar la skill `crear-web-como-servicio` apareció una regla que choca con eso: **el contenido debe estar en el HTML y JavaScript solo lo enriquece**. Tres razones concretas:

1. **Vista previa de WhatsApp.** Cuando el dueño comparte el enlace, WhatsApp lee el `<title>` y las etiquetas Open Graph del HTML sin ejecutar JavaScript. Con render en el navegador, la vista previa saldría vacía. Es justo lo primero que verá un prospecto.
2. **Google.** Google sí ejecuta JS, pero en una segunda pasada que puede tardar días; el HTML directo se indexa antes y mejor. Los datos estructurados `LocalBusiness` también se leen del HTML.
3. **Robustez y velocidad.** Si el JS falla (error, red lenta, navegador viejo), con render en el navegador la página queda en blanco. Además el contenido aparece después de descargar y ejecutar el JS, lo que empeora el LCP en datos móviles.

## Opciones consideradas

1. **Render en el navegador con `fetch()`** (plan original). Simple de entender; cambiar el JSON se ve al recargar sin construir. Falla en los tres puntos de arriba.
2. **Escribir el HTML a mano en cada demo.** Contenido en el HTML, pero cada negocio exige editar código: rompe la meta de "cambiar de negocio = cambiar el JSON".
3. **Prerender al construir.** Un plugin de Vite lee `negocio.json` y escribe el HTML final durante `npm run build` (y en cada petición durante `npm run dev`).

## Decisión

**Prerender al construir** con un plugin propio, `core/render.js`. Los componentes son funciones `negocio → HTML` que corren en Node. En el navegador solo quedan las mejoras que dependen del momento de la visita, como "Abierto ahora".

## Consecuencias

- El HTML publicado trae todo: textos, horario, Open Graph con imagen absoluta y JSON-LD. Funciona sin JavaScript.
- "Cambiar de negocio = cambiar el JSON" se mantiene; el JSON además se valida contra `core/negocio.schema.json` y un error detiene el build en vez de publicar una página rota.
- Cada cambio de datos exige volver a construir. En la práctica, GitHub Actions lo hace solo en cada `git push` ([ADR 001](001-vite-en-vez-de-live-server.md)).
- Los datos que el navegador sí necesita (el horario) viajan en una "isla de datos" `<script type="application/json" id="datos-negocio">`, no en un `fetch()` aparte.
- Los componentes no pueden usar `document` ni `window`: corren en Node. La interactividad de la fase 2 (carrito, formularios) irá en módulos aparte que enriquecen el HTML ya generado.
- `<script type="module">`: la skill prefiere scripts clásicos sin build, pero el plan mantiene módulos ES por el objetivo de aprendizaje. Vite los empaqueta en un solo archivo por página, así que el problema que la skill evita (imports relativos que se rompen o se cachean mal) no aparece. La contrapartida es que la página no se abre con doble clic (`file://`); se revisa con `npm run dev` o `npm run preview`.
