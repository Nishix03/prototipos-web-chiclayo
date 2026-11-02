# Animaciones al seleccionar opciones

La nueva ronda responde a la indicación de Iván: que la interfaz confirme visualmente las elecciones, además de animar la entrada de contenidos. Detalle en [ADR 020](../decisiones/020-confirmacion-de-selecciones.md).

## Cambios visibles

- Filtros y fases: una línea se desplaza desde la opción anterior a la elegida. Las imágenes o rótulos del resultado acompañan el cambio.
- Formularios: al elegir servicio, fecha, hora o motivo aparece una confirmación junto al campo y un contorno breve. Una fecha cerrada o un valor inválido no reciben marca positiva.
- Barbería: la tarjeta del barbero y el campo del turno confirman la elección trasladada desde la carta.
- Gimnasio: las sesiones elegidas quedan marcadas; al retirarlas se limpia su marca y se conserva el plan semanal.
- Dental: la respuesta se confirma en el panel visible después de la transición. El motivo elegido también queda confirmado al ir a la evaluación.
- Restaurante: el contador y la barra responden al cambiar cantidades; elegir entrega resalta la opción activa. La comanda puede repintar sus líneas sin perder la respuesta visual.

Se mantienen los materiales y ritmos de cada marca. Las señales decorativas no desplazan controles, no interceptan el puntero y no añaden paradas al recorrido de teclado.

## Vista previa

- [Vídeo corto de selección](rondas/selecciones-2026-11-02/selecciones-vista-previa.webm).
- [Recorrido completo de las seis marcas](rondas/selecciones-2026-11-02/selecciones-seis-marcas.webm).
- Capturas de filtro y elección en cada rubro, a 360 y 1440 px: `rondas/selecciones-2026-11-02/`.
- `control.json`: doce combinaciones sin desbordes, imágenes rotas ni errores de JavaScript.

La grabación usa hora de prueba y `?3d=0` para mostrar las respuestas de interfaz sin depender de WebGL. Los datos son los ficticios de los prototipos; no se envían pedidos ni citas.

## Validación

Suite completa: **172 pruebas aprobadas y dos omisiones intencionales por dispositivo**, con dos workers. Incluye filtros, desplegables, selecciones rápidas, tarjetas de barbero, disponibilidad de fases, entrega, cantidades, cuestionario, teclado, movimiento reducido, accesibilidad con Axe y el reposo del motor 3D.

No se añaden librerías ni bucles permanentes. El cliente compartido pasa de 5446 a 7106 bytes gzip respecto a la ronda anterior: **1660 bytes adicionales**, aproximadamente 1,6 KiB. Es una medida del bundle comprimido localmente, no una métrica de campo. Las confirmaciones duran entre 180 y 300 ms y reutilizan sus capas. Los valores y reglas de negocio mantienen su implementación.

Los marcadores siguen siendo visibles con movimiento reducido, mientras se cancelan las animaciones. Con teclado, la opción y el indicador se actualizan de inmediato sin interpolación. Cambiar rápidamente de opción interrumpe la transición anterior; no se acumulan marcas.

## Reproducir

1. `npm run build`.
2. `npx playwright test --workers=2`.
3. `node scripts/control-seleccion.mjs selecciones-2026-11-02`.

En Windows puede definirse `PLAYWRIGHT_CHANNEL=chrome`. Esta iteración está localmente en `codex/feedback-selecciones`; la versión publicada anterior corresponde al merge `59c1875`.
