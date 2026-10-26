# Plan técnico – Prototipos web por rubro

Oct 25, 2026 · @Iván

## Resumen

Se construyen 6 prototipos web, uno por rubro (restaurante, spa, barbería, veterinaria, clínica dental y gimnasio), sobre una sola plantilla base. Cada prototipo se personaliza para un negocio real cambiando un archivo de datos, sin tocar el código, así una demo toma unos 30 minutos en vez de una tarde.

Todo usa lo que ya sabes de tus cursos: HTML, CSS, JavaScript (ES6 y DOM), Git, GitHub y npm. Las webs son estáticas y se publican gratis en GitHub Pages. Las funciones "de servidor" (reservas, pedidos) se resuelven en esta fase con enlaces a WhatsApp con el mensaje ya escrito, y en la fase siguiente con el chatbot que venderás como upgrade.

Cada rubro tiene una función estrella que lo diferencia de una web genérica: es lo que muestras primero en la visita al negocio.

El proyecto tiene dos metas a la vez: prototipos de nivel profesional, auditados con skills especializadas de diseño y calidad, y que tú aprendas arquitectura web viendo cómo se construyen, con cada decisión documentada y un ejercicio práctico por fase.

## Arquitectura común

Un solo repositorio con un núcleo compartido y una carpeta por rubro; cada demo es una copia de la carpeta del rubro con su propio `negocio.json`.

### Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Estructura | HTML5 semántico | Lo dominas y Google lo indexa bien |
| Estilos | CSS moderno: variables como design tokens, Grid, `clamp()` para tipografía fluida, container queries | Lo que usan los equipos profesionales hoy, sin framework |
| Lógica | JavaScript ES6+ con módulos (`import`/`export`), sin framework | Practicas DOM y ES6 sin capas que oculten cómo funciona |
| Build | Vite (vía npm) | Servidor de desarrollo con recarga instantánea; en producción minifica; las imágenes se optimizan con vite-plugin-image-optimizer + sharp (ADR 003) |
| Datos | `negocio.json` convertido en HTML al construir (prerender con Vite) | Personalizar sin tocar código |
| Calidad de código | Prettier + ESLint | Código consistente, errores detectados antes de publicar |
| Despliegue | GitHub Actions → GitHub Pages | Cada `git push` a `main` se publica solo: tu primer pipeline CI/CD |
| Auditoría | Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO) | Calidad medida con números, no a ojo |
| Mapas | iframe de Google Maps | Sin API key |
| Reservas/pedidos (fase 1) | Enlace `https://wa.me/51XXXXXXXXX?text=...` con el mensaje armado por JS | Cero backend; el dueño recibe todo en su WhatsApp |

### Estructura de carpetas

```text
prototipos/
├─ .github/workflows/deploy.yml   # publica en GitHub Pages en cada push
├─ docs/decisiones/               # ADRs: por qué se eligió cada cosa
├─ graphify-out/                  # mapa del repo, regenerado al cierre de cada fase
├─ core/
│  ├─ tokens.css        # design tokens: colores, espacios, tipografía
│  ├─ base.css          # reset, grid, botones
│  ├─ render.js         # convierte negocio.json en HTML al construir
│  ├─ whatsapp.js       # arma mensajes y enlaces wa.me
│  ├─ horario.js        # "Abierto ahora" según la hora de Lima
│  └─ componentes/      # hero, galería, reseñas, mapa, footer, botón flotante
├─ restaurante/   index.html · estilo.css · app.js · negocio.json · img/
├─ spa/  barberia/  veterinaria/  dental/  gimnasio/
├─ package.json · vite.config.js · eslint.config.js · .prettierrc
└─ README.md
```

### El archivo `negocio.json`

Guarda todo lo que cambia entre negocios: nombre, eslogan, teléfono de WhatsApp, dirección, coordenadas del mapa, horario por día, paleta de colores, fotos, reseñas destacadas y la lista propia del rubro (carta, servicios, planes…). `render.js` lo lee al cargar y construye la página con el DOM.

### Componentes que comparten los 6 rubros

- **Hero** con foto, nombre, eslogan y botón principal de acción.
- **Indicador "Abierto ahora / Cerrado"** calculado con el horario y la hora de Lima.
- **Botón flotante de WhatsApp** siempre visible en el celular.
- **Reseñas destacadas** (3 a 5 frases cortas de Google Maps, con permiso del dueño).
- **Mapa y cómo llegar**, con botón que abre Google Maps.
- **Diseño mobile-first**: la mayoría de clientes llegan desde el celular.

### Reglas de calidad para todas

- El contenido principal está en el HTML y se lee aunque JavaScript falle. Carga en menos de 2 segundos en 4G: imágenes en WebP y con `loading="lazy"`.
- Etiquetas `<title>`, `meta description` y Open Graph para que el enlace se vea bien al compartirlo por WhatsApp.
- Contraste y tamaños de texto legibles; botones de al menos 44 px de alto.

## Planificación visual

Cada rubro empieza con un brief visual que tú apruebas, y no se escribe código hasta entonces. Es el paso que hace un estudio de diseño antes de construir: decide cómo debe verse y moverse la página, y lo prueba con una maqueta. Las 8 etapas de calidad aseguran que sea correcta; esta etapa asegura que sea vistosa.

[embedded content: planificación visual · 6 pasos y tu aprobación]

Si pides cambios, el brief vuelve al paso que corresponda; la maqueta del hero se rehace hasta que la apruebes.

| Paso | Skills | Entregable |
| --- | --- | --- |
| 1. Referencias reales | `anti-ui-slop`, guía de nicho de `crear-web-como-servicio` | Las 3 mejores webs reales del rubro con lo que hacen bien y qué espera ver el cliente de ese negocio |
| 2. Concepto y dirección de arte | `frontend-design`, arquetipos de `crear-web-como-servicio` | El concepto en una frase ("la carta como portada de periódico"), el arquetipo elegido y por qué, y el momento firma de la página |
| 3. Sistema visual | `ui-ux-pro-max`, `design-system` | Paleta con contraste verificado, par tipográfico con escala fluida, grid, radios y sombras, como tokens del rubro |
| 4. Guion de movimiento | `web-animation-design`, `emil-design-engineering`, `make-interfaces-feel-better`, catálogo de efectos de `crear-web-como-servicio` | Tabla de cada animación: elemento, disparador, duración, curva y versión con movimiento reducido, más el presupuesto de rendimiento |
| 5. Maqueta del hero | `frontend-design` | Hero y función estrella en HTML estático, con capturas a 360 px y 1440 px de ancho |
| 6. Revisión experta | `audit-as-design-eng`, `design-critique` | Veredicto (aprobar, aprobar con cambios o rehacer) y las correcciones aplicadas antes de mostrártelo |

Todo queda en `docs/visual/<rubro>.md` con sus capturas. Claude Code se detiene ahí y te pide aprobación.

**Tu revisión, en 5 segundos:** mira las capturas como si fueras el dueño del negocio. Si no te dan ganas de tocar el botón principal, no está aprobado. Cuando puedas, muéstralas también a una persona externa.

### Reglas de movimiento y efectos

- **Cada animación tiene un propósito:** guía la mirada, explica un cambio o confirma una acción. La rapidez va antes que el espectáculo.
- **Interfaz:** entre 150 y 300 ms, curva ease-out para lo que entra; solo se animan `transform` y `opacity`; nunca `transition: all`.
- **GSAP permitido** para las animaciones ligadas al scroll; CSS moderno para todo lo demás.
- **Un solo momento 3D por página, en el hero,** con Three.js: carga después del contenido y se reemplaza por una imagen fija en celulares de gama baja y con movimiento reducido.
- **Presupuesto:** LCP menor a 2.5 s en 4G, CLS menor a 0.1 y 90 o más en rendimiento de Lighthouse móvil. Si un efecto rompe el presupuesto, se quita el efecto.

## Calidad y diseño de vanguardia

Cada prototipo pasa por ocho etapas con skills especializadas, en este orden, antes de darse por terminado: primero los textos, luego el diseño y al final las auditorías.

| Etapa | Skill | Qué aporta |
| --- | --- | --- |
| 1. Textos de la página | `landing-page-copy`, `copy-edit` (Copywriting Kit) | Titular, subtítulo y llamados a la acción escritos para cada rubro, solo con datos reales del negocio |
| 2. Dirección visual | `frontend-design` | Un concepto estético propio por rubro (tipografía, color, composición), para que ningún prototipo parezca plantilla |
| 3. Sistema de diseño | `ui-ux-pro-max`, `design-system` (Design) | Paletas, tipografías y patrones UX por tipo de negocio; `design-system` revisa que los tokens sean consistentes entre rubros |
| 4. Referencias reales | `anti-ui-slop` | Contrasta el diseño con pantallas reales de la industria y fija un "contrato de diseño" con los estados obligatorios |
| 5. Microtextos | `ux-copy` (Design) | Botones, mensajes de error, confirmaciones y estados vacíos de los formularios de reserva |
| 6. Crítica de diseño | `design-critique` (Design) | Revisión estructurada de jerarquía, usabilidad y consistencia con ojos frescos; se corrige lo que encuentre |
| 7. Accesibilidad | `mcp-audit` (Axe), `web-design-guidelines`, `accessibility-review` (Design) | Axe escanea la página y prueba el teclado en un bucle hasta 0 violaciones; las otras dos cubren pautas de interfaz y WCAG 2.1 AA |
| 8. SEO local y control final | `seo-audit`, `copy-proof-check` (Copywriting Kit), `anti-ui-slop` | Datos estructurados `LocalBusiness`, afirmaciones de los textos verificadas contra los datos del negocio y control de salida del diseño |

Axe necesita conectar su servidor una sola vez con `mcp-setup` y una cuenta de Deque; lo configuramos al empezar la fase 1.

**Técnicas de vanguardia que usarán los prototipos:**

- Tipografía fluida con `clamp()`: se adapta sola del celular al escritorio.
- Animaciones al hacer scroll con CSS (scroll-driven animations) o GSAP, según las reglas de movimiento de la planificación visual, siempre respetando `prefers-reduced-motion`.
- View Transitions API para pasar entre pasos de los formularios con suavidad.
- Container queries: las tarjetas se adaptan al espacio que tienen, no solo al tamaño de la pantalla.
- Imágenes en AVIF/WebP con `srcset`, para cargar rápido en datos móviles.

La meta medible: 90 o más en las cuatro categorías de Lighthouse en cada prototipo. La skill `anti-ui-slop` usa un servicio externo de referencias; si no está disponible, ese paso se hace con `frontend-design` y `ui-ux-pro-max`, y se avisa.

## Skills de construcción y venta

Dos skills aportan el motor para construir y vender: `crear-web-como-servicio` para webs de clientes y `crear-web-micro-saas` para herramientas que funcionan solo en el navegador.

| Skill | Qué se toma de ella | Dónde entra |
| --- | --- | --- |
| `crear-web-como-servicio` (diseño) | 10 arquetipos visuales (uno distinto por prototipo), catálogo de más de 40 efectos, reglas para no clonar diseños, reglas de robustez (movimiento reducido, caché, todo en WebP) y su checklist antes de publicar | Fases 1 a 3, junto a `frontend-design` en la etapa de dirección visual |
| `crear-web-como-servicio` (imágenes) | Fotos de stock gratis (Openverse) convertidas a WebP; imágenes con IA solo si hay clave de OpenAI | Mientras no haya fotos reales del negocio |
| `crear-web-como-servicio` (IA) | Asistente de chat con Gemini, lector de documentos o fotos, calculadoras interactivas y captura de contactos, con la clave guardada solo en el servidor | Fase siguiente, como upgrade vendible junto al chatbot de WhatsApp |
| `crear-web-como-servicio` (venta) | Guía de nicho, argumento de venta y paso de demo a cliente; el contenido de demo siempre marcado como demo | Fase 4, visitas a prospectos |
| `crear-web-micro-saas` | Recetas de herramientas que corren en el navegador sin servidor: generador de QR, calculadoras | QR de la carta (restaurante) y calculadora de IMC (gimnasio); más adelante, un posible proyecto propio de micro SaaS |

**Decisiones que cambian por estas skills:**

1. **El contenido va en el HTML, no solo en JavaScript.** La skill exige que el texto esté en el HTML y que JS solo lo enriquezca, porque Google y la vista previa de WhatsApp leen mejor así. Por eso Vite generará el HTML de cada prototipo desde `negocio.json` al construir (prerender), en vez de pintarlo en el navegador con `fetch()`. Se mantiene la idea de "cambiar de negocio = cambiar el JSON". Será el ADR 002: un buen ejemplo de revisar una decisión de arquitectura con nueva información.
2. **Se mantienen los módulos ES con Vite,** por el objetivo de aprendizaje, aunque la skill usa scripts clásicos sin build. El resultado publicado es igual de estático, así que sus reglas de robustez se aplican sobre ese resultado.
3. **Dos hostings con roles distintos.** GitHub Pages, gratis, para las demos. Hostinger para clientes que pagan: dominio propio y PHP, que el asistente de IA necesita. Hostinger tiene costo mensual, que se cubre con la cuota de mantenimiento.
4. **Datos personales y la IA gratuita.** El plan gratis de Gemini usa lo que se le envía para entrenar. Cualquier función que reciba datos de clientes (fotos, documentos, síntomas de una mascota) pasa a una clave de pago antes de usarse con personas reales; esto aplica sobre todo a la clínica dental y la veterinaria.

## Cómo vas a aprender mientras construyo

Aprendes por observación guiada: cada decisión queda escrita en el repositorio, cada cambio llega explicado y cada fase termina con un ejercicio que haces tú.

- **Decisiones documentadas (ADR).** En `docs/decisiones/` cada elección importante tiene su archivo: contexto, opciones, decisión y consecuencias. Ejemplo: `001-vite-en-vez-de-live-server.md`.
- **Commits pequeños y explicados.** Formato Conventional Commits (`feat:`, `fix:`, `refactor:`) y un Pull Request por rubro, para que leas el diff y el porqué.
- **Explicación al cerrar cada componente.** Te cuento en pocas líneas qué hace, por qué está hecho así y qué alternativa descarté. Puedes preguntar en cualquier momento.
- **Mapa del repo con Graphify al cierre de cada fase.** Se corre `graphify .` sobre el proyecto y se guarda el resultado en `graphify-out/`: un grafo interactivo de cómo se conectan `render.js`, los componentes y cada `negocio.json`. Comparar el mapa de una fase con el de la siguiente muestra cómo crece la arquitectura, y con `graphify explain` puedes preguntar por qué dos archivos están relacionados. Ya lo tienes instalado (v0.9.95).
- **Bitácora en Notion.** Visual y conectada a tus apuntes; se detalla abajo.

| Fase | Conceptos de arquitectura que verás | Ejercicio para ti |
| --- | --- | --- |
| 1. Núcleo | Separar datos de presentación, módulos ES, design tokens, renderizado desde JSON, Vite y npm scripts | Escribir el `negocio.json` de un prospecto real de tu base y verlo renderizado |
| 2. Primeros 3 | Componentes reutilizables, estado en el cliente (carrito), formularios accesibles, flujo con ramas y PR | Crear tú un componente nuevo, por ejemplo "promoción del día" |
| 3. Siguientes 3 | Refactor y reutilización, rendimiento con Lighthouse, SEO técnico y datos estructurados | Subir un prototipo de 85 a 95+ en Lighthouse |
| 4. Demos reales | CI/CD con GitHub Actions, dominios propios, trabajo con clientes | Publicar una demo para un prospecto sin ayuda |

### Bitácora de arquitectura en Notion

La bitácora se construye sobre tus Apuntes de Estudio: cada concepto nuevo arranca enlazando la nota que ya tienes y termina mostrando dónde vive en el repo.

[embedded content: conexión entre tus apuntes y el proyecto · 5 ejemplos]

Dos de esas notas están sin terminar (NPM en progreso, Git/GitHub por hacer): el proyecto las completa con práctica real.

**Estructura:** una base de datos "Bitácora de arquitectura" dentro de tu workspace, con una relación a "Apuntes de Estudio v1". Así cada apunte viejo muestra en qué entradas del proyecto se usó.

| Propiedad | Para qué sirve |
| --- | --- |
| Fase | 1 a 4, como en la hoja de ruta |
| Concepto | Nombre corto: "Design tokens", "CI/CD" |
| Parte de | Relación con tu apunte previo (CSS, JavaScript, NPM, Git/GitHub…) |
| Tipo | Refuerza lo que sabías / Totalmente nuevo |
| Diagrama | Imagen de portada para la vista en galería |
| Commit / PR | Enlace al cambio exacto en GitHub |

**Cómo es cada entrada (siempre gráfica):**

1. **Lo que ya sabías:** mención a tu apunte y una frase que lo conecta. Si viene de Java, la comparación directa (por ejemplo, un módulo ES frente a una clase en Java).
2. **El concepto en un diagrama:** un diagrama Mermaid, que Notion dibuja directo desde un bloque de código.
3. **Cómo quedó en el proyecto:** captura del prototipo, el fragmento clave de código (10 líneas como máximo) y el enlace al commit.
4. **El mapa de Graphify** de esa fase como imagen, para ver la arquitectura completa.
5. **Pruébalo tú:** el mini ejercicio, con una casilla para marcarlo.

**Vistas:** galería con el diagrama de portada (la vista principal), línea de tiempo por fase y tablero "Refuerza / Nuevo". Además, una página "Mapa de conocimientos" con un diagrama que crece en cada fase: tus apuntes a la izquierda, los conceptos nuevos a la derecha y las flechas entre ellos.

## Restaurante

Objetivo: que el cliente vea la carta con fotos y reserve o pida en menos de un minuto. Prospectos de prueba: URUMANKA, Picantería del Mar y Sea Shore.

**Función estrella: carta digital con "armar pedido".** El cliente marca platos, ve el total en vivo y envía el pedido por WhatsApp con un toque.

**Secciones:** Hero con plato insignia · Carta por categorías · Reservar mesa · Galería del local · Reseñas · Horario y mapa.

| Función | Cómo se implementa |
| --- | --- |
| Carta con filtros (entradas, fondos, bebidas) | Array `carta` en el JSON; pestañas que filtran con `Array.filter()` |
| Carrito y total | Estado en un objeto JS; contador +/- por plato; total con `reduce()` |
| Enviar pedido | `whatsapp.js` arma: "Hola, quiero pedir: 2x Ceviche (S/ 70)…" y abre `wa.me` |
| Reservar mesa | Formulario (fecha, hora, personas, nombre) que también termina en WhatsApp |
| Plato del día / menú | Campo `menuDelDia` en el JSON; el dueño lo cambia y se actualiza solo |
| Código QR de la carta | Imagen QR que apunta a la web, para imprimir en las mesas |

**Estilo:** fotos grandes de comida, colores cálidos (terracota, crema), tipografía con carácter para los títulos.

**Upgrade de chatbot:** bot de WhatsApp que toma reservas y pedidos solo y responde horario y ubicación.

## Spa / Estética

Objetivo: transmitir calma y confianza, mostrar precios claros y llevar a agendar una cita. Prospectos de prueba: Epilare, SPELLO, Talentosspa y Vital Spa.

**Función estrella: armador de cita paso a paso.** El cliente elige servicio, ve duración y precio, escoge día y franja horaria, y la solicitud llega al WhatsApp del spa.

**Secciones:** Hero relajante · Servicios con precio y duración · Paquetes y promociones · Antes/después · Equipo · Reseñas · Agendar cita.

| Función | Cómo se implementa |
| --- | --- |
| Catálogo por categoría (faciales, masajes, uñas, cabello) | Tarjetas desde el array `servicios`, con filtro por categoría |
| Asistente de cita (3 pasos) | Formulario dividido en pasos con JS; valida que el día esté dentro del horario |
| Franjas horarias | Genera horas cada 30 min desde el horario del JSON; oculta las ya pasadas si es hoy |
| Comparador antes/después | Dos imágenes superpuestas y un `<input type="range">` que mueve el corte |
| Paquetes regalo | Tarjeta "Regala una experiencia" con mensaje de WhatsApp prellenado |

**Estilo:** tonos suaves (verde salvia, arena, blanco), mucho espacio en blanco, tipografía serif elegante en títulos.

**Upgrade de chatbot:** bot que agenda, confirma y envía recordatorio el día anterior.

## Barbería

Objetivo: mostrar el estilo de los cortes y que el cliente reserve con su barbero favorito. Prospectos de prueba: MI JAI, Baldera Estilistas y Navajas.

**Función estrella: "elige tu corte y tu barbero".** Galería de cortes con nombre (low fade, mullet, clásico…); al tocar uno, el cliente elige barbero y hora y reserva por WhatsApp.

**Secciones:** Hero oscuro con video o foto en acción · Catálogo de cortes · Nuestros barberos · Precios · Reseñas · Reservar.

| Función | Cómo se implementa |
| --- | --- |
| Galería de cortes con filtro por estilo | Grid de imágenes desde el array `cortes`; modal al tocar |
| Perfil de cada barbero | Tarjetas con foto, especialidad y días que atiende (array `barberos`) |
| Reserva con barbero | Selects encadenados: corte → barbero (solo los que atienden ese día) → hora |
| Tiempo de espera estimado | Texto que el dueño actualiza en el JSON ("Hoy: sin espera"); fase 2 lo controla el bot |
| Programa de fidelidad | Tarjeta "Tu 6.º corte gratis" explicada (sin lógica, solo informativa en fase 1) |

**Estilo:** fondo oscuro, acentos dorados o rojos, tipografía condensada y fuerte, fotos en blanco y negro.

**Upgrade de chatbot:** bot de reservas con cola de turnos por barbero.

## Veterinaria

Objetivo: que un dueño preocupado encuentre en segundos cómo comunicarse por una urgencia, y que agende consultas y baños en días normales. Prospectos de prueba: Veterinaria San Bernardo, Pets Park y D'Motas.

**Función estrella: botón de urgencias 24 h.** Franja roja fija arriba con "¿Emergencia? Llama ahora" (enlace `tel:`) y WhatsApp directo, visible en todo momento.

**Secciones:** Barra de urgencias · Hero con mascotas · Servicios (consulta, vacunas, cirugía, baño y corte) · Calendario de vacunas · Equipo de veterinarios · Reseñas · Agendar cita.

| Función | Cómo se implementa |
| --- | --- |
| Urgencias siempre visible | Barra `position: sticky` con enlaces `tel:` y `wa.me` |
| Recordatorio de vacunas | El dueño elige especie y edad; JS muestra qué vacunas tocan según una tabla en el JSON que valida la veterinaria |
| Agendar consulta o baño | Formulario con nombre de mascota, especie, motivo y hora, enviado a WhatsApp |
| Ficha de servicios con precios "desde" | Tarjetas desde el array `servicios` |
| Consejos de cuidado | 3–4 artículos cortos (ayudan a aparecer en Google) |

**Estilo:** colores frescos (turquesa, blanco, toques de naranja), ilustraciones o fotos de mascotas, tono cercano.

**Upgrade de chatbot:** bot que responde fuera de horario, clasifica si es urgencia y avisa al veterinario de turno.

## Clínica dental

Objetivo: quitar el miedo y la duda (¿cuánto cuesta?, ¿duele?) y convertir visitas en citas de evaluación. Prospectos de prueba: TAPIA y Consultorio Dental Olano.

**Función estrella: "¿Qué tratamiento necesito?".** Un cuestionario de 4 preguntas (¿te duele?, ¿quieres mejorar la estética?, ¿te falta una pieza?…) recomienda el tratamiento y ofrece agendar la evaluación.

**Secciones:** Hero con sonrisa · Tratamientos · Cuestionario · Antes/después · Doctores y credenciales · Preguntas frecuentes · Reseñas · Agendar evaluación.

| Función | Cómo se implementa |
| --- | --- |
| Cuestionario orientador | Árbol de decisión en el JSON (pregunta → opciones → resultado); JS recorre el árbol |
| Tratamientos con precio "desde" y duración | Tarjetas desde el array `tratamientos` |
| Antes/después | Mismo comparador deslizable del spa (componente compartido) |
| Preguntas frecuentes | Acordeón con `<details>`/`<summary>`, sin JS extra |
| Credenciales | Nombre del doctor y número de colegiatura (COP), que da confianza |
| Agendar evaluación | Formulario a WhatsApp que incluye el resultado del cuestionario |

**Estilo:** blanco limpio, azul o verde menta, fotos reales del consultorio, tono tranquilizador.

**Upgrade de chatbot:** bot de citas con recordatorios y respuestas a preguntas frecuentes (precios, seguros, formas de pago).

## Gimnasio

Objetivo: motivar, mostrar planes y horarios de clases sin tener que preguntar, y conseguir que agenden una clase de prueba. Prospectos de prueba: World Light SUMA, New Power Gym y Gym Max.

**Función estrella: horario de clases interactivo.** Tabla semanal filtrable por tipo de clase (funcional, spinning, box…) que marca en vivo "en curso" y "siguiente clase".

**Secciones:** Hero enérgico · Planes y precios · Horario de clases · Instalaciones y máquinas · Entrenadores · Calculadora · Reseñas · Clase de prueba gratis.

| Función | Cómo se implementa |
| --- | --- |
| Horario semanal con filtro | Array `clases` (día, hora, tipo, entrenador); grid CSS por día; resalta la clase actual con la hora de Lima |
| Comparador de planes | Tarjetas mensual / trimestral / anual con el ahorro calculado por JS |
| Calculadora de IMC y calorías | Formulario simple; resultado con mensaje que invita a la clase de prueba |
| Promoción con cuenta regresiva | Fecha de fin en el JSON; contador en vivo con `setInterval` |
| Clase de prueba | Formulario (nombre, objetivo, horario preferido) enviado a WhatsApp |

**Estilo:** fondo oscuro, un color neón (verde lima o naranja), tipografía gruesa en mayúsculas, fotos de gente entrenando.

**Upgrade de chatbot:** bot que responde precios y horarios, inscribe a clases de prueba y recuerda el vencimiento de la membresía.

## Hoja de ruta

Se empieza por el núcleo compartido y por los 3 rubros con más prospectos de prioridad Alta; los otros 3 reutilizan casi todos los componentes.

[embedded content: hoja de ruta · 4 fases, 3 controles]

Cada fase pasa a la siguiente solo cuando cumple su control (los rombos).

### Checklist de "terminado" para cada prototipo

- [ ] Su brief visual se aprobó antes de construir, y se ve bien en un celular de 360 px de ancho y en escritorio
- [ ] Todo el contenido sale de `negocio.json` (cambiar de negocio = cambiar el JSON)
- [ ] La función estrella funciona y termina en un mensaje de WhatsApp correcto
- [ ] "Abierto ahora" coincide con el horario real
- [ ] 90 o más en las 4 categorías de Lighthouse
- [ ] 0 violaciones en Axe, incluida la prueba de teclado
- [ ] Pasó `design-critique`, `web-design-guidelines` y el control final de `anti-ui-slop`
- [ ] Textos sin afirmaciones inventadas (`copy-proof-check`)
- [ ] Pasó el checklist previo a publicar de crear-web-como-servicio y tiene su ADR y sus commits explicados
- [ ] Publicado en GitHub Pages con su propia URL

### Siguiente fase: chatbots

Cuando un negocio ya usa su web, el chatbot reemplaza los enlaces de WhatsApp por respuestas automáticas. Esa fase necesita backend y la planificamos aparte.
