# 020 · Respuesta visual al elegir opciones

Fecha: 2026-11-02. Estado: implementado para revisión.

Iván pide que las elecciones tengan animaciones visibles. La ronda anterior animaba portadas y fotografías; los cambios de opción aún dependían principalmente del color del botón y de gestos breves en títulos.

## Decisión

Se añade `core/seleccion.js` con `core/seleccion.css`, separado de las entradas al recorrer. Escucha cambios reales de `aria-pressed` y eventos nativos de formulario. Los flujos que trasladan una elección a otro campo emiten `seleccion-confirmada` después de actualizar el estado.

| Antes                                                                  | Después                                                                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| El filtro cambiaba de color y los títulos se movían ligeramente        | Una línea recorre la distancia entre la opción anterior y la nueva; las fotos o rótulos del resultado acompañan el cambio |
| Un desplegable cambiaba su valor sin otra respuesta                    | El campo confirma la elección con una marca y un contorno breve, sin desplazar el control                                 |
| Elegir barbero desplazaba la página hacia el turno                     | La tarjeta queda marcada y el campo del turno confirma el barbero recibido                                                |
| Añadir o quitar una clase cambiaba el texto del botón                  | La ficha de clase confirma su estado; la marca desaparece al retirarla y no se acumula al repetir                         |
| La fase del spa dependía del color del botón                           | El indicador se mueve al tramo elegido; las horas y el paso muestran una respuesta de actualización                       |
| El cuestionario dental cambiaba de panel con View Transition           | El panel visible confirma la respuesta después de la transición y el motivo elegido se marca en la evaluación             |
| La cantidad del pedido se actualizaba y el papel volaba hacia la barra | Se confirma también el contador actual y la opción de entrega; se resuelve la línea nueva si la comanda repintó el DOM    |

## Marca y comportamiento

Filo usa oro con marcas rectas y respuesta de 190 ms; Latido, lima y 180 ms. Sonrisa Clara usa azul clínico y 230 ms; Trufa, turquesa y 230 ms. Remanso usa arcilla, formas suaves y 280 ms. Sabores mantiene terracota, contorno de sello y 230 ms. El contorno de confirmación dura como máximo 300 ms.

Las marcas indican la elección y respetan el estado del formulario. Una fecha cerrada o un valor inválido no recibe confirmación positiva. Los valores, precios, disponibilidad y mensajes siguen perteneciendo a los módulos de negocio; esta capa no los modifica.

## Rendimiento y accesibilidad

- Sin bibliotecas nuevas ni bucles. Se observan solo los atributos de selección en grupos concretos.
- Transformación y opacidad de capas decorativas; no se anima la posición del botón, input o select.
- El indicador guarda su posición visible para interrumpir una transición si se elige otra opción rápidamente.
- Una marca y un contorno reutilizables por tarjeta o campo; no se acumulan adornos con cada pulsación.
- Los elementos añadidos son `aria-hidden`, no reciben foco y no interceptan el puntero. La semántica sigue en `aria-pressed`, `checked` y el valor nativo.
- El teclado recibe el estado final sin interpolación. Movimiento reducido conserva las marcas y cancela las animaciones activas.
- El cambio de tamaño recoloca el indicador. Una pestaña oculta cancela los gestos activos.
- No se cambia la implementación del carrito, las reglas de disponibilidad ni el motor 3D.

La ronda de evidencia es `docs/visual/rondas/selecciones-2026-11-02/`. `scripts/control-seleccion.mjs` reproduce elecciones en las seis marcas y guarda capturas y vídeo. Los ensayos usan `?3d=0` para aislar la respuesta de interfaz.
