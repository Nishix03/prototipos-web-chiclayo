# Movimiento de marca y hero del restaurante

Se atienden las dos indicaciones de Iván: añadir animaciones profesionales a los seis prototipos y ocupar mejor el hero del restaurante. La decisión técnica y la revisión de movimiento están en [ADR 019](../decisiones/019-movimiento-de-marca.md).

## Resultado

Las portadas coordinan titular, descripción, estado, símbolo y rótulo de su acción. Las fotografías se descubren con una cortina del material de marca y tienen un recorrido editorial suave. Los títulos de fichas, días y categorías entran con la cadencia de cada empresa. Filtros, selecciones y cambios de ficha tienen respuestas breves; las áreas pulsables permanecen estables durante las entradas.

El restaurante añade una franja de pizarra con tres platos de su carta: arroz con pato, seco de cabrito y ceviche, con fotografías, precios y accesos directos. Las fotos son recursos existentes con crédito; no se inventan platos ni precios. La franja ocupa la zona inferior izquierda en escritorio alto y continúa después de las acciones principales en móvil.

## Evidencia

- [Hero del restaurante en escritorio](rondas/movimiento-de-marca-2026-11-02/restaurante-hero-1440.png).
- [Hero del restaurante en móvil](rondas/movimiento-de-marca-2026-11-02/restaurante-hero-360.png).
- [Recorrido corto del restaurante](rondas/movimiento-de-marca-2026-11-02/restaurante-vista-previa.webm).
- [Recorrido de las seis interfaces](rondas/movimiento-de-marca-2026-11-02/recorrido-desktop.webm).
- Capturas de portada, editorial y servicios para cada rubro, a 360 y 1440 px, y su `control.json` en la misma ronda. Cero imágenes rotas, errores de JavaScript y desbordes en las doce combinaciones.
- Control del restaurante con 3D forzado en la subcarpeta `restaurante/`: pasa en ambos tamaños, con escena viva y sin desborde.

Las capturas de interfaz y el vídeo usan `?3d=0` para aislar las animaciones nuevas del modelo 3D. La página normal conserva la escena interactiva al explorar. El último Control verifica por separado esa integración real.

## Validación

Suite completa: **140 pruebas aprobadas y dos omisiones intencionales por dispositivo**, con dos workers para evitar saturar la GPU del entorno de pruebas. Incluye teclado, navegación de los nuevos platos aun con filtros, formularios, plan semanal, datos en memoria, accesibilidad con Axe, cambio de preferencia de movimiento y reposo del motor 3D.

Durante la revisión se detectó que mover tarjetas completas podía cambiar la posición de un botón al recibir el foco. Se sustituyó esa entrada por movimiento de títulos y detalles; la acción principal anima su rótulo dentro de un enlace estable. Los tres casos afectados pasaron primero de forma aislada y después dentro de la suite completa.

El cliente compartido contiene el movimiento y las demás mejoras del núcleo. El build deja de incluir GSAP/ScrollTrigger para las páginas. IntersectionObserver se retira al disparar cada entrada; las animaciones terminan y no mantienen un bucle de JavaScript. Las fotos siguen usando espacio reservado, tamaños adaptables y carga diferida.

Las mediciones puntuales de carga se guardan en `rondas/movimiento-de-marca-2026-11-02/lighthouse.json`. Son corridas locales de laboratorio, una por combinación registrada; no deben compararse como medianas con las rondas anteriores.

| Página      | Rendimiento móvil | LCP móvil | TBT móvil |
| ----------- | ----------------: | --------: | --------: |
| Restaurante |                93 |    2,14 s |    251 ms |
| Spa         |                93 |    2,02 s |    278 ms |
| Barbería    |                99 |    1,64 s |    120 ms |
| Dental      |                99 |    1,68 s |     85 ms |
| Gimnasio    |                96 |    2,04 s |    124 ms |
| Veterinaria |                97 |    1,72 s |    157 ms |

Restaurante en escritorio: 99, LCP 0,66 s y TBT 58 ms. Accesibilidad, buenas prácticas y SEO: 100 en las siete corridas. Son mediciones de carga inicial: el 3D táctil permanece diferido hasta explorar y se comprueba por separado.

## Reproducir

1. `npm run build`.
2. `npx playwright test --workers=2` (Windows con Chrome: definir `PLAYWRIGHT_CHANNEL=chrome`).
3. `node scripts/control-movimiento.mjs movimiento-de-marca-2026-11-02`.
4. `node scripts/control.mjs restaurante --ronda=movimiento-de-marca-2026-11-02`.

Esta iteración está preparada localmente en `codex/animaciones-de-marca`; la publicación anterior corresponde al merge `07a2c6f`.
