# Plan de mejora de diseño: 6 prototipos de Chiclayo

Borrador. Destino final: `docs/` del repo `prototipos-web-chiclayo`.
Se apoya en la lista de verificación del portafolio (§13 de `plan-diseno-frontend-portafolio.md`), en tus ADR 008 y 009, y en lo que vi hoy en las páginas publicadas.

**Límite de lo que vi:** solo la primera pantalla de cada rubro en escritorio, con el 3D en movimiento. No vi el scroll, el móvil ni la función estrella. Lo demás sale de tu README y tus ADR.

## 1. Cómo trabajas (inferido de tu repo)

Es una inferencia mía a partir de `PLAN.md`, `PROGRESO.md`, los ADR, los scripts y tu `CLAUDE.md`. **Confirmado por Iván (1/11/2026)**, con una adición: prefieres aprender conceptos más que sintaxis.

| Rasgo de tu proceso                                                            | Evidencia                                                                                                                                                                                      | Cómo lo respeta este plan                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planificas por escrito antes de construir, con un «por qué» para cada elección | `PLAN.md` con tabla de stack y columna «Por qué»                                                                                                                                               | Este documento viene antes de tocar código                                                                                                                                                                                                                    |
| Documentas cada decisión como ADR                                              | ADR 000 a 009                                                                                                                                                                                  | Se proponen ADR 010 a 012 (§6)                                                                                                                                                                                                                                |
| Conviertes un «no me gusta» en reglas verificables                             | La «olla» fue rechazada y de ahí salió el ADR 009. En LeeContigo hiciste lo mismo con las garantías G1 a G5 (por ejemplo, «ninguna pista contiene la respuesta») y las probaste con Playwright | Cada rechazo de Iván agrega un criterio a la lista; lo de juicio se vuelve medible cuando se puede                                                                                                                                                            |
| Exploras 3 direcciones sobre la página real y eliges con tabla de puntaje      | `?direccion=a\|b\|c` y `docs/visual/<rubro>.md`                                                                                                                                                | Cada rubro hace A, B y C; lo de abajo es solo la hipótesis A                                                                                                                                                                                                  |
| Todo se dirige por datos                                                       | `negocio.json` + `rubro.schema.json`; el build falla con error en español                                                                                                                      | Los componentes nuevos se configuran desde JSON y se validan al construir                                                                                                                                                                                     |
| Mides con herramientas propias, no a ojo                                       | Scripts `control`, `lighthouse` (mediana de 5), `video`, `hoja`                                                                                                                                | Se amplía el Control en vez de revisar a ojo                                                                                                                                                                                                                  |
| Trabajas en ciclos cortos y trazables                                          | Un rubro por rama y PR con checks; `PROGRESO.md` para retomar                                                                                                                                  | Se mantiene                                                                                                                                                                                                                                                   |
| Das autonomía con reglas de parada                                             | Modo autónomo con condiciones explícitas                                                                                                                                                       | Se mantiene, con aprobación tuya en el criterio 7                                                                                                                                                                                                             |
| Aprendes mientras construyes                                                   | «Un ejercicio práctico por fase»; tu `CLAUDE.md` pide explicar cada cambio                                                                                                                     | Cada fase lleva un ejercicio y una explicación en español, centrada en el **concepto** (qué problema resuelve, por qué funciona y qué alternativas hay) y no en memorizar sintaxis. Al implementar, primero se explica la idea y después se muestra el código |
| Eres honesto con el contenido                                                  | Aviso «(demo)», sin inventar resultados                                                                                                                                                        | Se mantiene                                                                                                                                                                                                                                                   |
| Piensas con sistemas de progresión y referencias                               | Niveles y XP en LeeContigo, plan de reparto de commits, colección de referencias que combinas                                                                                                  | La gamificación aparece solo como mecánica sutil y como hipótesis, nunca impuesta                                                                                                                                                                             |

## 2. Principios

1. **Cada decisión se explora y se documenta, no se asume.** Los puntos siguientes son hipótesis para que las pruebes con tu método de 3 direcciones.
2. **Los gustos personales entran como mecánicas de interfaz**, no como tema ni personajes (menú de comandos, rangos, cartas, fases del día). Son negocios reales y el criterio 6 pide identidades distintas. **Aceptado por Iván, con una condición: los prototipos mantienen un tono serio.** Ninguna mecánica puede leerse como un juego.
3. **Una sola idea nueva por rubro**, ligada a su función estrella.
4. **No se migra a Astro ni a React. Tailwind CSS 4 sí entra (decidido por Iván, §10).** El repo ya es Vite + JavaScript vanilla + Three.js + GSAP, con ganchos `data-*` y pruebas, y se respeta. Tailwind se añade con `@tailwindcss/vite` sin cambiar de framework. Coinciden GSAP, Three.js, Prettier, Playwright y axe.
5. **Reglas de movimiento de §11 del portafolio** (con Tailwind para el CSS y GSAP para el scroll, §10): solo `transform`, `opacity`, `filter` y `clip-path`; nada de `transition: all`; versión reducida siempre.
6. **Rendimiento según el ADR 008.** No se agrega 3D nuevo; el peso nuevo se compensa.

## 3. Diagnóstico visual de hoy

| Rubro                           | Lo que vi                                                                             | Fortaleza                                    | Riesgo frente a los criterios                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Restaurante «Sabores del Norte» | Cuencos 3D con ingredientes sobre terracota, tarjeta de titular arriba a la izquierda | La más fuerte y propia                       | La tarjeta del titular es pequeña                                                       |
| Barbería «Filo»                 | Negro y dorado, letras cromadas, caja centrada con borde dorado                       | Cromo llamativo; «Espera hoy» en la cabecera | Caja centrada tipo plantilla (criterio 4); móvil en 86                                  |
| Dental «Sonrisa Clara»          | Burbujas de vidrio menta, titular en pregunta                                         | Titular claro y funcional                    | Burbujas genéricas, sonrisa no visible (criterio 3); menta parecido al spa (criterio 6) |
| Spa «Remanso»                   | Fondo verde grisáceo casi liso, ondas casi invisibles                                 | Calma y legibilidad                          | **El más plano** (criterio 4); verde parecido al dental (criterio 6)                    |
| Veterinaria «Trufa»             | Crema con huesos y pelotas 3D, barra roja de urgencias                                | Alegre, con identidad                        | No evaluado más allá del hero                                                           |
| Gimnasio «Latido»               | Lima neón sobre negro con ondas de pulso                                              | Fuerte y coherente                           | Contraste del texto pequeño sobre las ondas                                             |

## 4. Hipótesis A por rubro

Cada una se enfrenta a una B y una C que se definen en el paso 2 de cada rubro. Estas son solo el punto de partida.

| Rubro                         | Hipótesis A                                                                                                                                                                                                                                                   | Mecánica                       | Cambios de datos (`negocio.json` / esquema)                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Spa** (prioridad 1)         | Agua como protagonista que reacciona al cursor y cambia con la hora; cita en 3 pasos con un dial de fases del día; paleta cálida; paquetes escalonados; comparador antes/después con **imágenes generadas con IA por ChatGPT/Codex, siempre rotuladas** (§11) | Dial de fases                  | `paquetes[].franja` (amanecer, tarde, noche); `comparador.antes`, `comparador.despues` y `comparador.etiqueta` |
| **Dental** (prioridad 2)      | Las piezas de vidrio se cierran en sonrisa al cargar; paleta azul glaciar y blanco; cuestionario con barra segmentada sobria                                                                                                                                  | Barra de progreso              | Sin cambios; conservar la validación existente                                                                 |
| **Barbería** (prioridad 3)    | Hero recompuesto, con el titular reflejado en el cromo y el botón dentro de la escena; barbero elegido con cartas                                                                                                                                             | Selector de personaje          | `barberos[].especialidad` y `espera`                                                                           |
| **Gimnasio** (prioridad 4)    | Horario como menú de comandos con la clase en curso en fragmento diagonal; intensidad I a V por clase; «Plan semanal» local de diseño sobrio                                                                                                                  | Menú de comandos               | `clases[].intensidad`                                                                                          |
| **Veterinaria** (prioridad 5) | Ficha de mascota generada en el navegador, de diseño sobrio y sin efectos de juego; carnet de vacunas con sellos                                                                                                                                              | Ficha, inspirada en las cartas | `vacunas[].sello`                                                                                              |
| **Restaurante** (prioridad 6) | Solo pulido: tarjeta del titular más grande, carta como lista de comandos, total animado                                                                                                                                                                      | Menú de comandos               | Sin cambios; no tocar `carrito.js`, la comanda ni las reservas                                                 |

**Cuidados concretos**

- **Spa:** el shader cuesta en móvil (hoy 93). Si baja de 85, se aligera.
  - **Imágenes antes/después con IA (decidido):** tu dental descartó el antes/después por «fabricar resultados», así que esto se justifica en un ADR 014 y se cuida así:
    - rótulo siempre visible: «Imagen generada con IA · resultado ilustrativo (demo)»;
    - sin rostros reconocibles y sin prometer resultados; mejor manos, piel de cerca o cabello;
    - el estilo se fija con un prompt base y se anota la herramienta y su licencia;
    - si un negocio real lo adopta, se sustituyen por fotos reales con consentimiento. Las reglas de publicidad de resultados en estética conviene revisarlas con la normativa peruana de publicidad (por verificar).
- **Dental:** son datos de salud, así que sin tono de juego. Conservar «sin antes y después», el aviso de orientación y el sello «COP 00000 (demo)».
- **Barbería:** móvil en 86; no se agrega peso 3D.
- **Gimnasio:** el texto inclinado solo en formas, nunca en el texto corrido. El «Plan semanal» no usa niveles, rangos ni lenguaje de videojuego.
- **Veterinaria:** la ficha se genera en el navegador, sin subir fotos ni guardar datos. Sin holo ni efectos de juego; si se quiere un acabado, un brillo sutil solo con puntero fino, que se apaga con movimiento reducido.
- **Restaurante:** escritorio en 89; no empeorar.

## 5. Tabla de puntaje para elegir entre A, B y C

Sigue tu tabla actual (exigencias, identidad distinta, costo de rendimiento), con dos criterios nuevos y una puerta de seriedad pedida por Iván.

| Criterio                       | Qué mide                                                                                         | Tipo                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Exigencias del ADR 009         | Pasa los puntos medibles del Control                                                             | Puerta: si no pasa, queda fuera         |
| **Seriedad (nuevo)**           | Ante el dueño del negocio se ve profesional; ninguna mecánica de tus gustos se lee como un juego | Puerta: si parece un juego, queda fuera |
| Identidad distinta             | No se parece a los otros 5 en la hoja de contactos                                               | Puntaje                                 |
| Costo de rendimiento           | Lighthouse móvil y escritorio frente a la línea base                                             | Puntaje                                 |
| **Ajuste al negocio (nuevo)**  | Un dueño de ese rubro en Chiclayo lo vería como suyo                                             | Puntaje, juicio de Iván                 |
| **Costo de construir (nuevo)** | Piezas nuevas de `core/` frente a piezas reutilizadas                                            | Puntaje                                 |

## 6. ADR propuestos (en el repo de prototipos)

- **ADR 010 – Mecánicas de interfaz por rubro:** qué se toma de tus gustos y qué no, con el motivo.
- **ADR 011 – Paletas separadas (aceptado por Iván):** dental pasa a azul glaciar y blanco; spa a arena, ámbar y arcilla. Los demás se mantienen. Con esto el verde de tu portafolio no coincide con ningún prototipo, salvo el lima neón del gimnasio.
- **ADR 012 – Componentes compartidos en `core/componentes/`:** `lista-comandos`, `carta-seleccion`, `paso-progreso`, `contador-animado`. Cada rubro los viste con sus tokens para no parecerse.
- **ADR 013 – Agente como simulación mientras no haya backend** (ver §9).
- **ADR 014 – Imágenes generadas con IA:** por qué se aceptan pese a la regla del dental (sin antes y después), quién las genera (ChatGPT/Codex), las salvaguardas y el rótulo (§11).
- **ADR 015 – Tailwind CSS 4 en los prototipos:** por qué se añade, cómo se integra sin romper lo existente y qué sigue en GSAP y Three.js (§10).

## 7. Ciclo por rubro

1. **Revisión:** Iván mira la página actual contra los criterios 1 a 6 y anota qué falla.
2. **Tres direcciones** (A, B, C) como variantes de la página real, capturadas con `npm run control -- <rubro> <a|b|c>`.
3. **Puntaje** en `docs/visual/<rubro>.md` y **aprobación de Iván** con los storyboards (criterio 7).
4. **Construcción** con Control de exigencias al inicio y al final; los esquemas y el build validan los datos nuevos.
5. **Rendimiento, axe y teclado** en verde; una rama y un PR con los checks.
6. **Cierre:** se actualiza `PROGRESO.md` y se escribe el ADR del rubro.
7. **Ejercicio práctico** del rubro, con una explicación en español del concepto nuevo (por ejemplo, `clip-path` para el fragmento diagonal o por qué un shader cuesta en móvil).

Un rubro se cierra completo antes de empezar el siguiente. La regla de salida del tope de 6-8 semanas del portafolio sigue vigente.

## 8. Orden y herramientas

- **Orden:** 0) integración de Tailwind (piloto en el spa), piezas compartidas y la simulación del asistente en `core/` (§9 y §10), 1) spa, 2) dental, 3) barbería, 4) gimnasio, 5) veterinaria, 6) restaurante. Por impacto: primero los que fallan criterios.
- **Scripts a ampliar (no a crear desde cero):**
  - `control`: añadir el criterio 6 (hoja de contactos con los 6 heros) como comparación automática.
  - `hoja.mjs`: guardar la hoja por ronda para compararla con la anterior.
- **Skills:** las del plan del portafolio (§12), con la corrección de tu ADR 009: `frontend-design` con las exigencias, `copy-edit` y `brand-voice`, y las auditorías que corrigen sin borrar. Para las animaciones se añaden `hzblj-skills:tailwind`, `css-animations`, `ui-motion` y `audit-suite:web-animation-design`.
- **Imágenes:** no hay un skill de Codex disponible en esta sesión. La generación la hace Iván en ChatGPT o Codex con el encargo de §11.

## 9. Agente de IA: simulación (solo interfaz)

**Estado: por implementar, solo frontend.** Sin backend y sin funcionalidad real. Es un marcador de posición que muestra cómo se vería el asistente en el sitio de un negocio.

### 9.1 Qué es y qué no es

- Es una **simulación** visual: no entiende preguntas, no consulta ningún modelo y no guarda nada. Las respuestas son fijas y están escritas en `negocio.json`.
- **No es un agente de IA** y no se presenta como tal, ni en la web del prototipo ni en el portafolio.
- Riesgo a evitar: un chat que finge responder engaña al visitante. De ahí las reglas de abajo.

### 9.2 Reglas de honestidad

- Rótulo permanente y visible en todo el panel: **«Simulación · asistente virtual (próximamente)»**.
- **No hay campo de texto.** Hay 3 o 4 chips de preguntas con respuestas fijas (decidido por Iván) y un botón «Escribir por WhatsApp» con el mensaje ya armado.
- No simula escritura («...») ni responde a texto libre; cada chip da siempre la misma respuesta.
- Dental y veterinaria: ningún chip contiene consejo clínico ni respuestas sobre salud.
- No recoge datos.

### 9.3 Contrato mínimo en `negocio.json`

```json
"agente": {
  "activo": true,
  "estado": "proximamente",
  "nombre": "Asistente de Sabores del Norte",
  "simulacion": [
    { "pregunta": "¿Tienen delivery?", "respuesta": "Sí, dentro de Chiclayo (demo). Arma tu comanda por WhatsApp." },
    { "pregunta": "¿Hasta qué hora atienden?", "respuesta": "Hoy atendemos hasta las 16:00 (demo)." }
  ]
}
```

El esquema lo valida. Si falta `simulacion` (entre 2 y 4 chips) o `estado` no es `"proximamente"`, el build se detiene con un error en español, como ya haces con el dental. Con `"activo": false` no se renderiza nada. Las respuestas deben coincidir con los datos del demo (se revisa en el criterio 10 de §13 del portafolio).

### 9.4 Chips de ejemplo por rubro

| Rubro       | Pregunta de un chip                                                  |
| ----------- | -------------------------------------------------------------------- |
| Restaurante | «¿Tienen delivery?»                                                  |
| Barbería    | «¿Hay espera hoy?»                                                   |
| Dental      | «¿Cuánto cuesta una limpieza?» (precio «desde», sin consejo clínico) |
| Spa         | «¿Cuánto dura el masaje?»                                            |
| Veterinaria | «¿Atienden urgencias?» (responde 24 h y el botón de llamar)          |
| Gimnasio    | «¿Qué clase hay ahora?»                                              |

### 9.5 Diseño, rendimiento y pruebas

- Componente `asistente-simulacion` en `core/componentes/`, junto al botón flotante de WhatsApp, vestido con los tokens de cada rubro.
- Peso mínimo: HTML, CSS y muy poco JavaScript. Carga con `import()` tras el primer pintado, no cuenta para el LCP y Lighthouse no puede bajar.
- Accesibilidad: `role="dialog"`, foco atrapado y devuelto al cerrar, Esc cierra, todo con teclado.
- Animación según §11 del portafolio: apertura 300 ms, cierre 150 ms, versión reducida.
- Pruebas con Playwright: abre y cierra, teclado, cada chip muestra su respuesta fija, el rótulo «Simulación» sigue visible tras pulsar un chip, enlace de WhatsApp correcto, `activo: false` no renderiza, y axe en 0.

### 9.6 Camino futuro (no se implementa ahora)

El bloque `agente` reserva el lugar. Cuando exista un backend, `estado` pasaría a `"activo"` y se añadiría un `endpoint`, sin rediseñar la interfaz.
Las versiones del borrador anterior (asistente por reglas, embeddings en el navegador, modelo por endpoint) quedan **fuera de este plan**. Si se retoman, exigen un ADR nuevo con reglas de seguridad: llaves de API fuera del navegador, límite de uso, y la Ley 29733 de protección de datos personales si hay datos de salud (por verificar con una fuente oficial).

### 9.7 ADR 013

«Agente como simulación mientras no haya backend»: contexto (webs sin backend), opciones (solo interfaz, chips con respuestas fijas, reglas, modelo por endpoint), decisión (chips rotulados como simulación) y consecuencias.

### 9.8 Relación con el portafolio

- La simulación **no sostiene** el mensaje «agentes de IA para negocios»: es una maqueta.
- **El demo de IA real será el de GastroClinic** (decidido por Iván); en los prototipos solo hay simulaciones. LeeContigo aporta IA real hecha por el equipo.
- El hito «GastroClinic con IA» del Journey sigue bloqueado hasta que exista.

## 10. Tailwind CSS 4 y animaciones

### 10.1 Decisión y alcance

- **Decidido por Iván:** Tailwind para las animaciones de los prototipos (ADR 015).
- Se añade `tailwindcss` 4 y `@tailwindcss/vite` al Vite que ya tiene el repo. **No cambia el framework**: sigue Vite + JavaScript vanilla.
- Hoy el repo no usa Tailwind. Su CSS común es pequeño (`core/tokens.css`, `base.css` y `core.css`, unos 10 KB en total) y cada rubro tiene su propia tipografía.

### 10.2 Qué hace Tailwind y qué no

Tailwind es CSS por utilidades. Sirve para animaciones **de CSS**; no es un motor de animación. Por eso el reparto es:

| Herramienta              | Se encarga de                                                                       | Ejemplos en los prototipos                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Tailwind (CSS)**       | Transiciones de estado, entradas, microinteracciones, variantes de accesibilidad    | Selección diagonal de la lista de comandos, cartas de barbero, barra segmentada, panel del asistente, pulsación `0.96` |
| **GSAP + ScrollTrigger** | Coreografías ligadas al scroll y secuencias (el ADR 009 exige al menos 3 por rubro) | Revelados, capas en parallax, textos que se arman                                                                      |
| **Three.js / shaders**   | La escena 3D del hero                                                               | Agua del spa, cromo de la barbería, monitor del gimnasio                                                               |

Lo que da calidad a una animación es el diseño del movimiento y las reglas de §11 del portafolio, no la herramienta. Tailwind aporta consistencia (tokens y variantes) y menos CSS escrito a mano.

Utilidades de Tailwind 4 que encajan (verificar contra la versión instalada): `transition-[opacity,transform]`, `duration-*`, `ease-*`, `motion-safe:` y `motion-reduce:`, `starting:` para entradas, `data-[...]:` para estados, `active:scale-[0.96]`, y keyframes propios dentro de `@theme`.

### 10.3 Integración sin romper lo existente

1. **Se pilota en el spa** (primer rubro del orden). Tailwind solo se carga donde se usa.
2. **Sin reset de Tailwind (`preflight`)**: se importan solo el tema y las utilidades, para no alterar el reset de `core/base.css` en los rubros que ya funcionan.
3. **Los tokens siguen en `core/tokens.css`** y se exponen a Tailwind con `@theme` (colores, espaciados, easing y duraciones). Una sola fuente de valores.
4. **Las clases se escriben completas en el código.** Tailwind no detecta nombres armados por concatenación; `core/render.js` y los componentes deben respetarlo.
5. **Un solo lenguaje por rubro** (criterio 5): un componente nuevo usa Tailwind; el CSS viejo que quede se migra o se aísla, no se mezcla para lo mismo.
6. **Compatibilidad por verificar:** el repo usa Vite 8 y no sé si `@tailwindcss/vite` ya lo soporta. Se comprueba al instalar, antes de decidir nada más.
7. **Orden de clases:** el plugin de Prettier para Tailwind es una dependencia extra; queda por decidir (§12).

### 10.4 Reglas de animación aplicadas con Tailwind

- Solo `transform`, `opacity`, `filter` y `clip-path`. Prohibidos `transition-all` y `transition` sin propiedades: siempre `transition-[opacity,transform]`.
- Toda animación lleva su variante `motion-reduce:`.
- Duraciones y easing salen de `@theme` (`--dur-fast` 150 ms, `--dur` 300 ms, `--ease`), no de valores sueltos.
- Seriedad (puerta de §5): 150 a 300 ms, ease-out, sin rebotes ni efectos de juego.

### 10.5 Qué animaciones viven en Tailwind

| Rubro                  | En Tailwind (CSS)                                                       | Sigue en GSAP o Three                                    |
| ---------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Spa                    | Dial de fases, entrada escalonada de paquetes, comparador antes/después | Agua (shader), ondas con el cursor, revelados por scroll |
| Dental                 | Barra de progreso segmentada, estados del cuestionario                  | Sonrisa de vidrio (3D)                                   |
| Barbería               | Selección de cartas de barbero, HUD de espera                           | Cromo 3D, scroll                                         |
| Gimnasio               | Lista de comandos con selección diagonal                                | Monitor de luz (shader)                                  |
| Veterinaria            | Ficha de mascota, sellos del carnet                                     | Juguetes 3D                                              |
| Restaurante            | Lista de comandos de la carta                                           | Cuencos 3D, riel de comandas, total animado              |
| Asistente (simulación) | Apertura y cierre del panel, chips                                      | Nada                                                     |

### 10.6 Concepto para aprender

Por qué solo se animan `transform` y `opacity`, qué es una utilidad frente a una clase semántica, y para qué sirve `@theme`. Se explica con un ejercicio en el spa antes de extenderlo.

### 10.7 Riesgos

- **Peso del CSS:** el LCP del restaurante tiene solo 90 ms de margen (ADR 008). Se mide el CSS de cada rubro con Tailwind.
- **Reset:** si se importara `preflight` por error, podrían cambiar estilos de rubros ya aprobados.
- **Clases dinámicas** que Tailwind no ve.
- **Mezcla de estilos** dentro de un rubro.

## 11. Imágenes con IA (delegadas a ChatGPT / Codex)

### 11.1 Estado y límite

- **Decidido por Iván:** la creación de las imágenes se delega a ChatGPT (skill de Codex).
- **No tengo ese skill ni acceso a ChatGPT en esta sesión**, así que no puedo generar las imágenes. Este plan deja el encargo listo para que se lo pases tú.
- **Lo que sí hago yo:** escribir el encargo, revisar los resultados, optimizarlos con `sharp`, integrarlos en `negocio.json` y correr las pruebas.

### 11.2 Dónde caben las imágenes de IA

Según el esquema del repo, `imagenes.hero` es obligatorio y hay `galeria`, `og` y un campo `credito` por imagen. Pero **el póster del hero no puede ser una imagen de IA**: por el ADR 008 es un cuadro de la propia escena 3D (`npm run poster`).

| Rubro       | Hoy tiene                                                                       | Imágenes de IA propuestas                                                        | Cuidados                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Restaurante | 19 imágenes (hero, local, platos como ceviche, cabrito, arroz con pato y jalea) | Ninguna por defecto; solo si falta un plato                                      | Un plato generado puede no parecerse al que sirve el negocio. Se mantienen las fotos con licencia, si lo son (por verificar) |
| Barbería    | Solo pósters del hero                                                           | Galería de 4 a 6: ambiente del local, cortes (nuca, perfil, manos), herramientas | Sin retratos de «barberos» falsos salvo rotulados                                                                            |
| Dental      | Solo pósters                                                                    | Galería de 4 a 6: consultorio, instrumental limpio, sala de espera               | Sin pacientes en procedimiento ni imágenes médicas; sin antes y después                                                      |
| Spa         | `comparador-antes.webp` y `comparador-despues.webp`                             | 2 o 3 pares nuevos (piel de cerca, manos o uñas, cabello) y 2 de ambiente        | Mismo encuadre y luz en cada par; rótulo obligatorio                                                                         |
| Veterinaria | Solo pósters                                                                    | Galería de 4 a 6: perros y gatos para la ficha, sala de espera                   | No fingir pacientes reales                                                                                                   |
| Gimnasio    | Solo pósters                                                                    | Galería de 4 a 6: salas, equipamiento, clases sin rostros                        | Sin marcas ni logos de equipos                                                                                               |

Las cantidades son una propuesta; se ajustan en el paso 2 de cada rubro.

### 11.3 El encargo para ChatGPT / Codex

Un documento por rubro en `docs/visual/imagenes/<rubro>.md` con:

1. **Hoja de estilo:** paleta del rubro (ADR 011), luz, lente y tono. Realista y sobrio, no ilustración infantil (puerta de seriedad).
2. **Prompt base** compartido y una variación por imagen. Se pide generar toda la serie en el mismo hilo para mantener la coherencia.
3. **Prohibiciones:** sin texto dentro de la imagen, sin logos ni marcas, sin rostros reconocibles ni personas reales, sin contenido médico explícito.
4. **Entrega:** el original en alta calidad (lado largo de 2400 px). Después pasa por el optimizador (`vite-plugin-image-optimizer` y `sharp`, ADR 003) y se publica en WebP con el `srcset` actual. La imagen para compartir mide 1200×630.
5. **Registro:** prompt, herramienta, fecha y condiciones de uso del proveedor para uso comercial (por verificar).
6. **Texto alternativo** descriptivo y el `credito` en `negocio.json`, por ejemplo «Generada con IA · ChatGPT · 2026».

### 11.4 Flujo

1. Yo preparo el encargo de un rubro.
2. Iván lo entrega a ChatGPT o Codex.
3. Los originales vuelven a `docs/visual/imagenes/<rubro>/originales/`, fuera del build.
4. Yo reviso con esta lista: defectos típicos de IA (manos, texto garabateado, simetrías), coherencia con la paleta y el peso final.
5. Se integran con alt y crédito.
6. Se corren el Control, axe, teclado y Lighthouse (sin regresión).

### 11.5 Honestidad en la interfaz

- Spa: rótulo visible junto a cada par: «Imagen generada con IA · resultado ilustrativo (demo)».
- Los demás rubros: leyenda en la galería, «Imágenes generadas con IA (demo)».
- Cuando un negocio real adopte el sitio, las imágenes se sustituyen por fotos reales con consentimiento.

## 12. Decisiones de Iván (1/11/2026)

**Resueltas**

1. **Lectura del proceso:** correcta, con la adición de que prefieres aprender conceptos más que sintaxis (§1).
2. **«Mecánica, no tema»:** aceptada, con la condición de mantener la seriedad (§2 y la puerta de §5).
3. **Paletas del dental y del spa:** cambian (ADR 011).
4. **Spa, antes/después:** se mantiene con imágenes generadas con IA, rotuladas (§4, §11 y ADR 014).
5. **Ficha de mascota y plan semanal:** se mantienen con diseño sobrio, sin aspecto de juego (§4).
6. **Asistente:** chips con respuestas fijas, rotulados como «Simulación» (§9).
7. **Demo de IA real:** será el de GastroClinic; los prototipos solo simulan (§9.8).
8. **Tailwind CSS 4** para las animaciones de los prototipos, sobre el Vite existente (§10 y ADR 015).
9. **Imágenes con IA** delegadas a ChatGPT/Codex; el encargo lo preparo yo (§11).
10. **Nombres de demo:** «Remanso Spa», «Trufa Veterinaria» y «Latido Gym» están confirmados como no usados. Falta reflejarlo en `PROGRESO.md` del repo de prototipos, que aún los marca como pendientes.

**Abiertas**

- Aprobación de Iván (criterio 7) de los 5 rubros elegidos por Claude Code.
- ChatGPT o Codex: cuál se usa, con qué plan, y si sus condiciones permiten uso comercial de las imágenes (por verificar).
- Peso máximo por imagen para no empeorar el LCP.
- Compatibilidad de `@tailwindcss/vite` con Vite 8 (por verificar al instalar).
- Plugin de Prettier para ordenar clases de Tailwind: ¿sí o no?
- Normativa peruana de publicidad de resultados en estética (por verificar con una fuente oficial).
