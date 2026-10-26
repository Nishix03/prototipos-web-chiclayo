# Graph Report - prototipos-web-chiclayo  (2026-10-25)

## Corpus Check
- Corpus is ~11,049 words - fits in a single context window. You may not need a graph.

## Summary
- 280 nodes · 449 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.87)
- Token cost: 76,561 input · 0 output

## Community Hubs (Navigation)
- Decisiones de arquitectura (ADR)
- Dependencias y configuración npm
- Componentes de página
- Datos del negocio (negocio.json)
- Plan por rubro y aprendizaje
- Prerender, head y contraste
- Jobs de GitHub Actions
- Horario y cliente del navegador
- Disparadores y permisos del workflow
- Imágenes del negocio
- Scripts de npm
- Auditoría Axe (a11y.js)
- Flujo de commits y PR

## God Nodes (most connected - your core abstractions)
1. `html()` - 23 edges
2. `Plan tecnico: Prototipos web por rubro` - 17 edges
3. `ADR 002: Prerender al construir en vez de render en el navegador` - 9 edges
4. `ubicacion` - 8 edges
5. `horario` - 8 edges
6. `enlaceWhatsapp()` - 8 edges
7. `scripts` - 8 edges
8. `crudo()` - 7 edges
9. `textoLegibleSobre()` - 7 edges
10. `cabecera()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Arquitectura comun (nucleo compartido + carpeta por rubro)` --semantically_similar_to--> `Nucleo comun (core/)`  [INFERRED] [semantically similar]
  docs/PLAN.md → README.md
- `Archivo negocio.json` --semantically_similar_to--> `negocio.json (datos del negocio)`  [INFERRED] [semantically similar]
  docs/PLAN.md → README.md
- `Indicador Abierto ahora / Cerrado (hora de Lima)` --semantically_similar_to--> `app.js: mejoras del momento de la visita (Abierto ahora, hora de Lima)`  [INFERRED] [semantically similar]
  docs/PLAN.md → README.md
- `README: Prototipos web por rubro Chiclayo` --references--> `Plantilla de ADR (contexto, opciones, decision, consecuencias)`  [INFERRED]
  README.md → docs/decisiones/000-plantilla.md
- `_ejemplo/index.html (pagina de prueba y plantilla)` --implements--> `Marcadores <!-- @head --> y <!-- @componente X -->`  [INFERRED]
  _ejemplo/index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de prerender: negocio.json validado y convertido en HTML estatico** — readme_negocio_json, readme_core_validar, readme_negocio_schema, readme_core_render, readme_marcadores_html, docs_decisiones_002_prerender_en_vez_de_render_en_navegador_prerender_build, _ejemplo_index [INFERRED 0.85]
- **ADRs de la fase 1 basados en la plantilla** — docs_decisiones_000_plantilla, docs_decisiones_001_vite_en_vez_de_live_server, docs_decisiones_002_prerender_en_vez_de_render_en_navegador, docs_decisiones_003_optimizacion_de_imagenes [EXTRACTED 1.00]
- **Seis rubros con funcion estrella sobre el nucleo comun** — docs_plan_restaurante, docs_plan_spa, docs_plan_barberia, docs_plan_veterinaria, docs_plan_clinica_dental, docs_plan_gimnasio, docs_plan_funcion_estrella [EXTRACTED 1.00]

## Communities (13 total, 1 thin omitted)

### Community 0 - "Decisiones de arquitectura (ADR)"
Cohesion: 0.07
Nodes (30): _ejemplo/index.html (pagina de prueba y plantilla), Enlace Saltar al contenido (accesibilidad), Slots de componentes: hero, galeria, resenas, mapa, footer, boton-flotante, Plantilla de ADR (contexto, opciones, decision, consecuencias), ADR 001: Vite en vez de Live Server, base: '/prototipos-web-chiclayo/' para GitHub Pages, Live Server (opcion descartada), ADR 002: Prerender al construir en vez de render en el navegador (+22 more)

### Community 1 - "Dependencias y configuración npm"
Cohesion: 0.08
Nodes (34): description, devDependencies, ajv@^8.20.0, ajv-formats@^3.0.1, @axe-core/cli@^4.14.0, eslint@^10.13.0, eslint-config-prettier@^10.1.8, @eslint/js@^10.0.1 (+26 more)

### Community 2 - "Componentes de página"
Cohesion: 0.16
Nodes (20): avisoDemo(), botonFlotante(), footer(), NOMBRE_RED, galeria(), estadoHorario(), hero(), convertir() (+12 more)

### Community 3 - "Datos del negocio (negocio.json)"
Cohesion: 0.06
Nodes (33): contacto, mensajeWhatsapp, whatsapp, demo, descripcion, eslogan, horario, dom (+25 more)

### Community 4 - "Plan por rubro y aprendizaje"
Cohesion: 0.11
Nodes (28): Render en el navegador con fetch() (plan original, descartado), Plan tecnico: Prototipos web por rubro, Barberia: elige tu corte y tu barbero, Bitacora de arquitectura en Notion, Siguiente fase: chatbots (upgrade vendible), Checklist de terminado por prototipo, Clinica dental: cuestionario Que tratamiento necesito, Comparador antes/despues (componente compartido) (+20 more)

### Community 5 - "Prerender, head y contraste"
Cohesion: 0.13
Nodes (21): escapar(), componentes, contraste(), CONTRASTE_MINIMO, CONTRASTE_NO_TEXTO, luminancia(), textoLegibleSobre(), cabecera() (+13 more)

### Community 6 - "Jobs de GitHub Actions"
Cohesion: 0.10
Nodes (21): runs-on, steps, name, url, jobs, construir, publicar, environment (+13 more)

### Community 7 - "Horario y cliente del navegador"
Cohesion: 0.18
Nodes (16): iniciarNucleo(), seguro(), ABREV_DIA, ahoraEnLima(), aMinutos(), diaAnterior(), DIAS, diaSiguiente() (+8 more)

### Community 8 - "Disparadores y permisos del workflow"
Cohesion: 0.14
Nodes (13): concurrency, cancel-in-progress, group, name, permissions, contents, id-token, pages (+5 more)

### Community 9 - "Imágenes del negocio"
Cohesion: 0.25
Nodes (8): alt, src, imagenes, galeria, hero, og, alt, src

### Community 10 - "Scripts de npm"
Cohesion: 0.25
Nodes (8): scripts, a11y, build, dev, format, format:check, lint, preview

### Community 11 - "Auditoría Axe (a11y.js)"
Cohesion: 0.25
Nodes (4): axe, paginas, raiz, urls

## Knowledge Gaps
- **13 isolated node(s):** `Auditoria de accesibilidad con Axe (scripts/a11y.js, WCAG 2.1 AA)`, `whatsapp.js y horario.js`, `Flujo para crear un prototipo nuevo (copiar _ejemplo/)`, `Enlace Saltar al contenido (accesibilidad)`, `Design tokens (tokens.css)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sharp` connect `Dependencias y configuración npm` to `Prerender, head y contraste`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `Auditoria de accesibilidad con Axe (scripts/a11y.js, WCAG 2.1 AA)`, `whatsapp.js y horario.js`, `Flujo para crear un prototipo nuevo (copiar _ejemplo/)` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Decisiones de arquitectura (ADR)` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Why does `html()` connect `Componentes de página` to `Prerender, head y contraste`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Dependencias y configuración npm` be split into smaller, more focused modules?**
  _Cohesion score 0.0761904761904762 - nodes in this community are weakly interconnected._
- **Why does `Plan tecnico: Prototipos web por rubro` connect `Plan por rubro y aprendizaje` to `Decisiones de arquitectura (ADR)`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Datos del negocio (negocio.json)` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._