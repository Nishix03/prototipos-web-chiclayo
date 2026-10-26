# Brief visual · Restaurante v2 inmersivo («Sabores del Norte · Demo»)

- **Estado:** pasos 1 y 2 hechos. **Falta que Iván elija una de las 3 direcciones.** Los pasos 3 a 6 empiezan después.
- **Fecha:** 2026-10-26
- **Identidad de partida:** «Fuego y barro», la cocina de leña de una picantería ([identidad.md](identidad.md)).
- **Alcance:** solo cambia la capa de presentación de la v1 ([restaurante.md](restaurante.md)).
  - No cambian: carrito, comanda, reservas, `negocio.json` ni las pruebas.
  - `test:teclado` y `a11y` deben seguir pasando.
- **Presupuesto:** [ADR 008](../decisiones/008-presupuesto-con-3d.md).
  - Punto de partida: LCP móvil 2.41 s y rendimiento 98, con las fuentes ya recortadas.

---

## Paso 1 · Referencias

**Skills usadas:**

- **`anti-ui-slop`:** se cargó con su guía para trabajo nuevo, pero su servicio de pantallas reales (UIZZE) **no está conectado** en esta sesión, así que no aportó referencias. Como prevé el plan, las referencias salieron de búsqueda web y de capturas propias.
- **`crear-web-como-servicio`:** de su guía de nicho, la recomendación para restaurantes (reserva y carta, más un asistente como mejora vendible). De sus archivos de arquetipos y de reglas de diversidad, qué no repetir del ejemplo de restaurante que trae la skill: el carrusel horizontal fijo de 8 a 12 platos, el degradado de malla rojo y los caracteres decorativos.

Las capturas de webs de terceros se guardaron fuera del repo y no se suben.

### Las 3 mejores webs reales del rubro

| Web                                                  | Qué hace bien                                                                                                                                                                                                            | Qué tomamos                                                                                                                 | Qué no copiamos                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [Ekstedt](https://www.ekstedt.nu/) (Estocolmo)       | Un restaurante que cocina solo con leña. Su primera pantalla es un video de humo y fuego, y la frase explica el método: «Birchwood and smoke are our most powerful tools». «Reservation» aparece 3 veces antes de bajar. | El fuego **explica** la cocina, no la adorna. Aquí: la leña de algarrobo y la olla de barro son el método de la picantería. | Video de 2 a 4 MB en la primera pantalla: en 4G rompe el LCP. Nosotros usamos el póster del ADR 008.                                 |
| [Central](https://centralrestaurante.com.pe/) (Lima) | La página es «un recorrido vertical por el territorio peruano»: el scroll baja por alturas, del mar a la Amazonía. Dos fotos macro de ingredientes, de borde a borde, sin texto encima.                                  | **El scroll como recorrido con sentido.** Aquí: del humo del fogón a la olla, y de la olla a tu mesa (la comanda).          | No hay precios ni carta en la portada. A 360 px la primera pantalla es solo fotos y el botón de reservar queda escondido en el menú. |
| [Isolina](https://isolina.pe/) (Lima)                | Taberna criolla con foto cenital de comida a pantalla completa y las 5 acciones (Reservas, Para recoger, Delivery…) visibles desde la primera pantalla. Es la que más se parece a lo que vende un negocio de Chiclayo.   | **Acciones visibles de entrada**, que la v1 ya cumple con «Armar mi pedido» y el menú del día con su precio.                | La carta vive en otra página.                                                                                                        |

**Lo que el rubro espera** sigue igual que en la v1: carta con precios en la página, horario y dirección a la vista, y un solo botón claro para pedir. **La oportunidad es la misma, con una diferencia:** ninguna de las tres convierte la cocina en algo que se pueda tocar. Ekstedt la filma y Central la fotografía. Aquí la olla de barro se mueve con tu dedo y el plato cae en tu pedido.

### 5 referencias de inmersión (premiadas por movimiento o 3D)

Son de cualquier rubro. Los premios se verificaron en la página de Awwwards de cada sitio o en fuentes que la citan.

| Referencia                                           | Premio                                                      | Técnica que tomamos                                                                                                                                                                 | Cómo la adaptamos                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Oryzo](https://oryzo.ai/), de Lusion                | Awwwards Site of the Month, abril de 2026                   | **Un solo objeto 3D con textura de material real**, un posavasos de corcho que gira y se acerca con el scroll. Con el título a un lado y el texto al otro, el objeto es la portada. | La olla o el plato de barro, con la porosidad del barro cocido y el hollín en la base. En nuestra captura (Chromium sin GPU, no representa un celular) seguía en su pantalla de carga a los 8 s. Nosotros mostramos el póster desde el primer pintado. |
| [Igloo Inc](https://www.igloo.inc/)                  | Awwwards Site of the Year 2024 (Developer Award)            | **Partículas y niebla que se arman y se disuelven con el scroll**, con refracción tipo prisma sobre bloques de hielo.                                                               | El vapor de la olla como partículas que suben, más densas al llegar al menú del día y que se disipan al bajar. Sin pantalla de carga.                                                                                                                  |
| [Explore Primland](https://explore.ownprimland.com/) | Awwwards Site of the Day, febrero de 2026                   | **Cámara que se desliza con el scroll sobre un terreno real**, entre bancos de niebla.                                                                                              | El humo del fogón como capas de niebla que la cámara atraviesa del hero a la carta. Solo en la dirección B (escena persistente).                                                                                                                       |
| [Hubtown](https://hubtown.co.in/), de Unseen Studio  | Awwwards Site of the Day, junio de 2026                     | **Objeto que brilla desde dentro, y el cursor revela detalle en su luz**. El titular se arma letra por letra.                                                                       | La brasa bajo la olla, que se aviva donde pasa el cursor o el dedo. El titular que «se arma» es una de las 3 coreografías de scroll.                                                                                                                   |
| [SŌM](https://www.drinksom.eu/), de .RAW             | Awwwards Site of the Day, 4 de abril de 2026 (food & drink) | **Interacción 3D con el mouse en una marca de bebida**, que no estorba la compra: el carrito está siempre visible.                                                                  | La regla de oro para nosotros: el 3D nunca tapa «Armar mi pedido» ni la barra del pedido. Lo que no tomamos: su ventana de país, que tapa la primera pantalla.                                                                                         |

**Conclusión del paso 1:** los sitios premiados ganan con **un objeto memorable y un recorrido con sentido**, pero Oryzo e Igloo abren con una pantalla de carga (en nuestra captura sin GPU seguían ahí a los 8 s). Nuestra ventaja posible: la misma sensación con contenido desde el primer pintado (ADR 008).

---

## Paso 2 · Tres direcciones

**Skills usadas:**

- **`frontend-design`:** la advertencia que más pesó aquí es que «fondo crema + acento terracota + serif de titular» es hoy la combinación que más delata una página hecha por IA, y es justo el color de partida de la matriz («terracota, carbón, crema»). Por eso ninguna dirección usa crema de fondo: la de partida se convierte en **adobe, hollín o cal**, colores que sí están en una picantería.
- **`crear-web-como-servicio`:** los arquetipos y sus reglas de diversidad. Dos arquetipos ya están tomados: barbería **02 Dark Warm** y dental **01 Light Cream**. La v1 usó **09 Newspaper**.

**Lo que no cambia en ninguna de las tres:**

- El contenido sigue en el HTML.
- El LCP es el póster de la escena (ADR 008).
- El 3D se hace con Three.js, sin modelo descargado: la olla y el plato se modelan en código, con un torno (`LatheGeometry`).
- Las coreografías de scroll se hacen con GSAP ScrollTrigger y las View Transitions al abrir y cerrar la comanda.
- La función estrella cumple la matriz: **el plato cae a la comanda y el ticket se imprime**.

Contraste medido sobre los hex propuestos (texto normal ≥ 4.5:1). El paso 3 lo vuelve a verificar con los tokens definitivos.

### A · «La olla manda»

> La olla de barro es la portada: gira con tu scroll, suelta vapor y todo lo demás (carta, pedido, reserva) pasa a su alrededor.

- **Arquetipo:** 10 Spline Embed Premium, adaptado. Un solo objeto 3D en el hero, hecho con Three.js en vez de Spline (ADR 008), y el resto de la página sobrio. Su paleta neón de manual se reemplaza por la de barro.
- **Momento firma:** la olla de barro de Mórrope (Lambayeque), con su textura de barro paleteado, sobre brasas de algarrobo.
  - Gira media vuelta con el scroll del hero.
  - Las partículas de vapor suben más rápido sobre el menú del día.
  - El cursor o el dedo avivan la brasa bajo la olla (técnica de Hubtown).
- **Paleta:**

  | Rol                    | Color        | Hex       | Contraste                   |
  | ---------------------- | ------------ | --------- | --------------------------- |
  | Fondo                  | adobe        | `#d6a27a` | hollín sobre adobe: 7.88:1  |
  | Texto                  | hollín       | `#22150e` |                             |
  | Botón principal        | barro cocido | `#9c4a26` | con texto `#fff7ee`: 5.78:1 |
  | Resaltador             | ají amarillo | `#f2b705` | con texto hollín: 9.78:1    |
  | Superficie de la carta | ceniza clara | `#e8e1d9` | texto hollín: 13.71:1       |

  Un fondo de color medio (adobe) es poco común y es lo primero que se recuerda.

- **Par tipográfico:**
  - **Bricolage Grotesque** variable en titulares: grotesca de trazo irregular, como letra pintada a mano en un letrero; usa sus ejes de ancho y tamaño óptico.
  - **Literata** en el texto: serif de lectura, cálida y abierta.

- **Lenguaje de movimiento:** pesado y generoso, como una olla llena.
  - Las entradas pesan: curva ease-out larga, sin rebote, de 400 a 600 ms en lo decorativo y de 150 a 250 ms en botones.
  - El plato agregado cae en arco a la barra del pedido.
  - El ticket se imprime línea por línea, como en la v1.
- **Las 3 coreografías de scroll:**
  1. La olla gira y la cámara se acerca hasta el borde.
  2. El titular se arma palabra por palabra.
  3. Las categorías de la carta suben en capas, como el vapor.
- **Costo estimado:** bajo. Es una sola escena en el hero que se pausa al salir de pantalla, el caso ideal del ADR 008.
- **Riesgo:** parecerse a Oryzo (objeto redondo café que gira). Se evita con la composición: la olla va de lado, abierta y humeante, con la carta debajo, y no centrada como un producto en un estudio.

```text
360 px                         1440 px
┌──────────────────┐           ┌───────────────────────────────────────────┐
│ Sabores del Norte│           │ Sabores del Norte        Carta  Reservar  │
│   ~ ~ vapor ~ ~  │           │                     ~ ~ vapor ~ ~         │
│   ╭──────────╮   │           │  Arroz con pato,     ╭──────────────╮     │
│   │  OLLA 3D │   │           │  cabrito y ceviche   │   OLLA 3D    │     │
│   ╰──────────╯   │           │  …                   │  (póster =   │     │
│   ▒▒ brasas ▒▒   │           │  [Armar mi pedido]   │   LCP)       │     │
│ Arroz con pato,  │           │  Menú del día S/ 18  ╰──────────────╯     │
│ cabrito y …      │           │                      ▒▒▒ brasas ▒▒▒       │
│ [Armar mi pedido]│           ├───────────────────────────────────────────┤
│ Menú del día S/18│           │ carta sobre ceniza clara …                │
└──────────────────┘           └───────────────────────────────────────────┘
```

### B · «Fogón de noche»

> Entras a la cocina de la picantería al anochecer: el scroll te lleva a través del humo hasta el fuego, y del fuego a la mesa.

- **Arquetipo:** 03 Cinematic 3D Storytelling. Una escena 3D persistente detrás de toda la página, con la cámara guiada por el scroll.
- **Momento firma:** el fogón completo, con leña de algarrobo, brasas, la olla encima y humo en capas.
  - La cámara baja del humo a las llamas en el hero (técnica de Primland).
  - Se acerca a la olla en el menú del día.
  - Termina sobre la mesa en la reserva.
  - Las chispas siguen al cursor.
- **Paleta:**

  | Rol              | Color      | Hex       | Contraste                |
  | ---------------- | ---------- | --------- | ------------------------ |
  | Fondo            | hollín     | `#17100c` |                          |
  | Texto            | humo claro | `#f1e6da` | 15.30:1                  |
  | Texto secundario | ceniza     | `#b8ada3` | 8.55:1                   |
  | Botón            | brasa      | `#ff6a1f` | con texto hollín: 6.57:1 |
  | Destello         | llama      | `#ffb347` | solo para resaltar       |
  | Superficie       | barro      | `#8a3d22` | tarjetas de la carta     |

- **Par tipográfico:**
  - **Fraunces** variable en titulares, con sus ejes «soft» y «wonk»: serif blanda, como letra que se derrite con el calor.
  - **Figtree** en el texto: sans clara para leer sobre fondo oscuro.
- **Lenguaje de movimiento:** respira como el fuego.
  - Parpadeo lento de la luz, de 2 a 4 s.
  - Los cambios de sección se funden a través del humo.
  - El plato agregado sube como una chispa hasta el pedido.
  - El ticket se imprime iluminado por la brasa.
- **Las 3 coreografías de scroll:**
  1. La cámara recorre el humo, el fuego, la olla y la mesa.
  2. La niebla se abre para dejar ver cada sección.
  3. El titular se enciende letra por letra, como brasa.
- **Costo estimado:** **alto**.
  - La escena nunca sale de pantalla, así que la pausa del ADR 008 no aplica: solo se puede bajar su ritmo.
  - Un póster oscuro comprime bien, pero el TBT y la batería sufren en gama media.
  - Es la dirección con más riesgo de bajar de 90.
- **Riesgos:**
  - Fondo casi negro con un solo acento es uno de los rasgos «por defecto» que señala `frontend-design`.
  - Además queda cerca de la barbería (02, negro y dorado).
  - Para distinguirlos: aquí el fondo es café hollín, el acento es naranja vivo y nada es cromado. El ritmo también es opuesto: lento y orgánico frente a cortes secos.

```text
360 px                         1440 px
┌──────────────────┐           ┌───────────────────────────────────────────┐
│░░░ humo ░░░░░░░░░│           │░░░░░░░░░░ humo ░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ Sabores del Norte│           │ Sabores del Norte             [Reservar]  │
│░░░░░░░░░░░░░░░░░░│           │░░░░  Arroz con pato,  ░░░░░░░░░░░░░░░░░░░░│
│  ^ ^ llamas ^ ^  │           │░░░░  cabrito y ceviche    ^ ^ ^ llamas    │
│  ╱╲ leña ╱╲ ╱╲   │           │      [Armar mi pedido]   ╱╲ ╱╲ leña ╱╲    │
│ Arroz con pato…  │           │   (escena fija detrás de toda la página)  │
│ [Armar mi pedido]│           │                                           │
└──────────────────┘           └───────────────────────────────────────────┘
```

### C · «Pizarra y torno»

> La picantería de barrio a la luz del mediodía: paredes de cal, la pizarra con el menú del día pintada a mano y un plato de barro que gira como en el torno del alfarero.

- **Arquetipo:** 07 Brutalist, en versión cálida.
  - Grilla estricta y tipografía enorme, como los letreros pintados de las picanterías.
  - Ninguno de los arquetipos tomados (02, 01, 09) se le parece.
- **Momento firma:** un plato de barro de Mórrope con un ceviche o un arroz con pato modelado en volúmenes simples.
  - Gira con el scroll como en el torno del alfarero.
  - Suelta vapor.
  - Al agregar un plato a la carta, una copia pequeña del plato 3D «cae» en la barra del pedido.
- **Paleta:**

  | Rol                   | Color        | Hex       | Contraste                               |
  | --------------------- | ------------ | --------- | --------------------------------------- |
  | Fondo                 | cal          | `#e6e9e4` | blanco frío de pared encalada, no crema |
  | Texto                 | hollín       | `#201a17` | 14.03:1                                 |
  | Bloques de la pizarra | verde pared  | `#46705a` | con texto blanco: 5.64:1                |
  | Botón                 | barro        | `#9a3f22` | con texto de cal: 5.51:1                |
  | Resaltador            | ají amarillo | `#f2b705` | con texto hollín: 9.46:1                |

- **Par tipográfico:**
  - **Bungee** en titulares y precios: letra de rótulo, hecha para letreros y que se lee de lejos.
  - **Archivo** en el texto: ya está recortada y precargada, así que el costo de fuentes no sube.
- **Lenguaje de movimiento:** el gesto del pintor y del alfarero.
  - Los titulares se pintan de izquierda a derecha, con un barrido de recorte (`clip-path`) de 300 a 400 ms.
  - El plato gira con el scroll y se detiene con inercia.
  - El plato agregado cae a la barra con un rebote corto.
  - El ticket se imprime.
- **Las 3 coreografías de scroll:**
  1. El torno: el plato gira y se inclina para mostrar el contenido.
  2. Los titulares de cada sección se pintan al entrar.
  3. Los bloques de la pizarra (menú del día, horario) se deslizan a su lugar de la grilla.
- **Costo estimado:** bajo, similar al de A. Tiene una sola escena en el hero y reutiliza Archivo. Bungee es una fuente estática liviana.
- **Riesgos:**
  - El estilo brutalista puede sentirse frío. Se compensa con el barro, el vapor y el amarillo ají.
  - Bungee en mayúsculas cansa en párrafos: va solo en titulares y precios.

```text
360 px                         1440 px
┌──────────────────┐           ┌───────────┬───────────────┬───────────────┐
│ SABORES DEL NORTE│           │ SABORES   │               │ MENÚ DEL DÍA  │
├──────────────────┤           │ DEL NORTE │   ╭───────╮   │ ▓▓ S/ 18 ▓▓▓▓ │
│    ╭────────╮    │           │           │   │PLATO  │   │ ▓ Causa ▓▓▓▓▓ │
│    │PLATO 3D│    │           │ ARROZ CON │   │ 3D    │   │ ▓ Arroz c/pato│
│    ╰────────╯    │           │ PATO,     │   ╰───────╯   │ (pizarra      │
│ ARROZ CON PATO,  │           │ CABRITO…  │   ~ vapor ~   │  verde)       │
│ CABRITO Y …      │           │[Armar mi pedido]          │               │
│[Armar mi pedido] │           ├───────────┴───────────────┴───────────────┤
│▓ MENÚ DEL DÍA 18▓│           │ carta en grilla estricta …                │
└──────────────────┘           └───────────────────────────────────────────┘
```

### Comparación y recomendación

|                        | A · La olla manda         | B · Fogón de noche            | C · Pizarra y torno                      |
| ---------------------- | ------------------------- | ----------------------------- | ---------------------------------------- |
| Sensación              | cálida, artesanal, de día | cinematográfica, nocturna     | popular, gráfica, de mediodía            |
| Riesgo de presupuesto  | bajo                      | **alto** (escena persistente) | bajo                                     |
| Distancia con barbería | grande                    | **poca** (las dos oscuras)    | grande                                   |
| Distancia con dental   | grande (adobe, no crema)  | grande                        | media (fondo claro, pero frío y gráfico) |
| Costo de fuentes       | 2 fuentes nuevas          | 2 fuentes nuevas              | 1 nueva (Archivo se queda)               |
| Se recuerda por        | la olla humeante          | el viaje por el fuego         | el plato en el torno y la pizarra        |

**Recomendación: A.**

- Es la que mejor cumple la matriz: el momento firma es literalmente la olla de barro con vapor.
- Su costo encaja en el ADR 008 con margen.
- El fondo adobe es su propio sello, sin chocar con la barbería ni con la clínica.

**C es la alternativa** si quieres más personalidad gráfica y menos «producto». **B es la más vistosa en video,** pero es la que más probablemente te obligue a la decisión del ADR 008 (aceptar 85 o aligerar).

**Elige una (A, B o C) o una mezcla explícita.** Por ejemplo, la tipografía de C con la escena de A. Con tu elección sigo con el paso 3 (sistema visual).
