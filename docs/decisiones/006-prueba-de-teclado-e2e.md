# 006 – Prueba de teclado end-to-end con Playwright

- **Estado:** aceptada
- **Fecha:** 2026-10-26
- **Fase:** 2

## Contexto

El checklist de cada prototipo pide «0 violaciones en Axe, incluida la prueba de teclado». `npm run a11y` (`@axe-core/cli`) revisa el HTML, pero no puede saber si alguien sin mouse logra armar un pedido: si el foco se pierde al ocultar un botón, si la comanda atrapa el foco, si Escape la cierra. La prueba de teclado del servidor MCP de Axe falla en Windows y se dejó para más adelante.

## Qué es una prueba end-to-end (y en qué se diferencia de una unitaria)

|               | Prueba unitaria                                                                                                  | Prueba end-to-end (E2E)                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Qué prueba    | Una pieza aislada: `mensajePedido()` arma bien el texto, `estadoHorario()` dice «abierto» un viernes a las 23:00 | El recorrido completo, como una persona: abre la página, pulsa Tab, Enter, Escape, y mira qué pasa |
| Dónde corre   | En Node, sin navegador                                                                                           | En un navegador real (Chromium) con el sitio construido                                            |
| Velocidad     | Milisegundos                                                                                                     | Segundos                                                                                           |
| Qué encuentra | Errores de lógica                                                                                                | Errores de integración: foco perdido, modales que no cierran, eventos que se pisan                 |
| En Java       | JUnit sobre un método                                                                                            | Selenium manejando la aplicación                                                                   |

Las dos se complementan. Esta decisión es sobre la E2E de teclado; las unitarias no forman parte del plan por ahora.

## Opciones consideradas

1. **Recorrido manual con agent-browser** en cada PR. No queda en el repo ni se puede repetir igual.
2. **Prueba automatizada con Playwright** guardada en `pruebas/teclado/`. Se repite idéntica en cada rubro y se puede sumar al workflow de CI.
3. **Esperar al MCP de Axe.** Su prueba de teclado (igt) es semiautomática y depende de un servicio externo.

## Decisión

Opción 2: `npm run test:teclado` construye el sitio, lo sirve con `vite preview` y Playwright lo recorre **solo con teclado**, a 360 px y a 1440 px, con la hora fija en Lima para que «Abierto ahora» no cambie. Cada rubro tiene su `pruebas/teclado/<rubro>.spec.js`, con las ayudas compartidas de `pruebas/teclado/ayudas.js`.

Qué comprueba en el restaurante:

- Tab recorre la página en el orden visual y cada elemento enfocado se ve (contorno y en pantalla).
- Shift+Tab vuelve exactamente por el mismo camino.
- «Saltar a la carta» lleva el foco a la carta.
- Pedido completo sin mouse: agregar platos (el foco no se pierde cuando «+ Agregar» se convierte en − n +), abrir la comanda, foco atrapado, Escape la cierra y devuelve el foco a «Ver mi pedido», error claro si falta la dirección, y **el enlace de WhatsApp es exactamente el que arma `pedido.js`**.
- Quitar todo desde la comanda: estado vacío, envío deshabilitado, foco en «Volver a la carta».
- Filtros de la carta con Enter.
- Reserva: un lunes muestra «Los lunes no abrimos. Elige otra fecha.» y un martes abre WhatsApp con los datos.

## Consecuencias

- La primera ejecución encontró un **error real**: si se reabría la comanda antes de 400 ms, el cierre animado pendiente la volvía a cerrar. Quedó corregido y la prueba lo vigila.
- Sobre la trampa de foco: un `<dialog>` modal nativo deja que Tab salga a la interfaz del navegador y vuelva. La prueba acepta eso y falla solo si el foco toca la página que está detrás.
- Requiere Chromium de Playwright (`npx playwright install chromium`, una vez).
- No reemplaza a `npm run a11y`: Axe revisa el HTML y esta prueba revisa el uso. Juntas cubren el ítem del checklist.
