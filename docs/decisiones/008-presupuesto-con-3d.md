# 008 – Presupuesto de rendimiento con 3D

- **Estado:** aceptada
- **Fecha:** 2026-10-26
- **Fase:** 2

## Contexto

La versión 1 del restaurante salió correcta pero plana: cumplía las 8 etapas de calidad, pero ninguna exigía que la página impresionara. El plan del 26 de octubre agrega una **inmersión mínima obligatoria** en cada prototipo:

- un momento firma 3D en el hero (Three.js o un shader WebGL), que reacciona al scroll o al cursor;
- al menos 3 coreografías ligadas al scroll con GSAP ScrollTrigger;
- microinteracciones en la función estrella;
- View Transitions entre estados.

El choque está en el presupuesto. Three.js minificado pesa unos 150 KB comprimidos, un modelo glTF puede pesar más que toda la página y compilar shaders bloquea el hilo principal. Las demos se abren en celulares de gama media con datos móviles, y el plan exige:

- LCP menor a 2.5 s en 4G;
- CLS menor a 0.1;
- 90 o más en las 4 categorías de Lighthouse.

Punto de partida medido antes de agregar 3D: restaurante v1 con las fuentes recortadas (commit `259e051`), Lighthouse 12 sobre `npm run build` + `npm run preview`, mediana de 5 corridas. El margen frente a la meta es de solo 90 ms.

|            | Rendimiento | LCP    | CLS | Elemento LCP         |
| ---------- | ----------- | ------ | --- | -------------------- |
| Móvil      | 98          | 2.41 s | 0   | foto del hero (WebP) |
| Escritorio | 100         | 0.46 s | 0   | foto del hero (WebP) |

## Opciones consideradas

1. **Sin 3D.** Cumple el presupuesto, pero no cumple la inmersión mínima del plan.
2. **El 3D carga con la página,** como un `<script>` normal en el hero.
   - A favor: es lo más simple.
   - En contra: Three.js, el modelo y la compilación de shaders se suman al camino crítico. El hero queda vacío o con un spinner hasta que todo llega. El LCP y el TBT se van mucho más allá de la meta en 4G.
3. **Póster primero, 3D después.** El hero se pinta con una imagen fija de la misma escena y la escena real se carga cuando la página ya es usable.
   - A favor: el LCP no cambia, y quien no puede o no quiere el 3D ve la misma composición.
   - En contra: hay que producir un póster por rubro y mantener dos caminos, póster y escena.

## Decisión

Opción 3, con estas reglas:

1. **El LCP es un póster.** Es una imagen fija AVIF o WebP de la misma escena 3D, con `srcset`, `fetchpriority="high"`, ancho y alto. Un `<canvas>` no es candidato a LCP; el póster sí, y es lo que Lighthouse medirá.
2. **El 3D carga con `import()` dinámico después del primer pintado.**
   - Espera a que la página termine de cargar y a un momento libre del hilo principal (`requestIdleCallback`, con `setTimeout` de respaldo).
   - Three.js va en su propio fragmento de JavaScript: no entra en el bundle inicial.
3. **Modelos glTF comprimidos** con Draco o meshopt, y texturas en KTX2 o WebP. Mientras sea posible, la geometría se genera en código (sin modelo).
4. **Se pausa fuera de pantalla.** Un `IntersectionObserver` detiene el bucle de `requestAnimationFrame` cuando el hero sale de la vista, y también cuando la pestaña se oculta.
5. **El póster se queda,** y el 3D ni siquiera se descarga, si:
   - el sistema pide movimiento reducido (`prefers-reduced-motion: reduce`);
   - hay ahorro de datos (`navigator.connection.saveData`);
   - la memoria es poca (`navigator.deviceMemory` menor a 4);
   - el navegador no tiene WebGL2.
6. **El cambio de póster a escena no mueve nada.** El `<canvas>` ocupa exactamente la caja del póster, entra con un fundido de `opacity` y no aporta CLS.
7. **Si el rendimiento móvil baja de 90 por el 3D,** Claude Code se detiene y muestra dos opciones con números: aceptar 85 o aligerar la escena. Decide Iván.
8. **Las auditorías corrigen, no borran.** Un efecto solo se quita si rompe el presupuesto medido, y queda escrito en el brief del rubro con los números.

El presupuesto se mide siempre igual que el punto de partida: Lighthouse 12 sobre build + preview, mediana de 5, móvil y escritorio.

## Consecuencias

- **Lo que ganamos:**
  - El LCP depende solo del póster, que ya sabemos optimizar (ADR 003 y `srcset`).
  - Quien ve el póster ve la misma escena, sin huecos.
  - Los dispositivos débiles no pagan el costo del 3D.
- **Lo que hay que vigilar:**
  - El margen actual en móvil es de solo 90 ms, así que el póster no puede pesar más que la foto de hoy.
  - El TBT, medido después de que el 3D carga: la compilación de shaders no debe congelar el scroll.
  - La memoria, si la página queda abierta mucho tiempo: hay que liberar geometrías y texturas al pausar.
- **Lo que cuesta:** un póster por rubro, renderizado desde la propia escena, y una ruta de código más que probar.
  - `test:teclado` y `a11y` corren con el póster (Playwright con movimiento reducido).
  - Se agrega una prueba que fuerce la escena.
- **Dependencias nuevas:** `three` y `gsap`. Ninguna es React ni Tailwind, y las dos se cargan solo en las páginas que las usan.
