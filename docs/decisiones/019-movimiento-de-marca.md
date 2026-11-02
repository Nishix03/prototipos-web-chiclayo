# 019 · Movimiento de interfaz independiente del 3D

Fecha: 2026-11-02. Estado: implementado para revisión.

Iván pide animaciones más profesionales y llamativas en los seis prototipos y señala que el hero del restaurante se ve vacío. La capa anterior dependía del montaje 3D y dejaba las fotografías, portadas y varios controles sin una coreografía propia.

## Decisión

Se sustituye la coreografía de interfaz de GSAP por `core/movimiento.js` y `core/movimiento.css`. El núcleo inicia esta mejora al cargar el HTML, independientemente de Three.js. Se usan Web Animations API, IntersectionObserver y transiciones CSS; el recorrido de fotografía editorial usa una línea de vista nativa cuando el navegador la soporta. No se agrega ninguna dependencia.

| Antes                                                             | Después                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Entradas disponibles solo al cargar las mejoras 3D                | Portada y controles con movimiento independiente desde el inicio                      |
| Animaciones concentradas en títulos y listas                      | Portada coordinada, cortinas sobre fotografías y entradas de superficies por marca    |
| Títulos del gimnasio inclinados hasta 12 grados según velocidad   | Entradas cortas y enérgicas; texto estable y legible                                  |
| El comparador del spa cambiaba su valor para demostrar movimiento | El comparador mantiene el valor elegido; el movimiento acompaña fotos, fases y pasos  |
| Seis archivos de coreografías con registro de ScrollTrigger       | Un módulo pequeño con perfiles propios; sin listeners de scroll ni bucle de interfaz  |
| Cambios de filtro y selección abruptos                            | Reordenamiento breve de resultados, respuesta de plan/ficha y botones con press/hover |
| Espacio libre bajo la comanda del restaurante                     | Franja de platos con fotos, precios y enlaces a sus posiciones en la carta            |

## Lenguaje por marca

| Marca         | Cadencia de entrada           | Fotografía y respuesta                                                                           |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Filo          | 440 ms, lateral y precisa     | Cortina dorada horizontal, acercamiento de foto al explorar, brillo breve en la acción principal |
| Remanso       | 950 ms, desplazamiento suave  | Apertura vertical ámbar, arco de foto preservado y pasos de cita que se posan                    |
| Sonrisa Clara | 650 ms, alineación vertical   | Descubrimiento glaciar, tratamientos ordenados y etapas legibles                                 |
| Latido        | 420 ms, impulso corto         | Cortina lima lateral, disciplinas y días en secuencia, respuesta al plan semanal                 |
| Trufa         | 560 ms, gesto corto y cercano | Entrada de fichas, fotografía cálida y asentamiento de la ficha al cambiar especie/fecha         |
| Sabores       | 650 ms, pequeño balanceo      | Papel y pizarra, fotografía descubierta y respuesta breve de la barra de pedido                  |

Las animaciones no ocultan los textos ni retrasan la disponibilidad de controles. Las fotos usan su marco y el crédito sigue visible. Se preservan los nombres accesibles y los focos.

## Restaurante

La portada conserva la mesa norteña 3D y las dos acciones principales. Añade una pequeña carta sobre material de pizarra con arroz con pato, seco de cabrito y ceviche: fotos y precios provienen de `negocio.json`. En escritorio alto ocupa el espacio inferior izquierdo; en teléfonos sigue a la primera pantalla sin desplazar las acciones fuera de ella. Cada enlace va al plato real. Si una categoría está oculta por un filtro, el acceso restablece la carta completa antes de navegar al plato.

## Rendimiento y accesibilidad

- Las entradas son finitas y cada observación se retira al activarse. La interfaz no mantiene un bucle ni listeners de scroll.
- Transformaciones, escala y cortinas compuestas; sin desenfoques, partículas ni vídeo de fondo. El parallax editorial lo resuelve el navegador y solo se aplica si tiene soporte.
- Three.js conserva su carga diferida y render bajo demanda; GSAP/ScrollTrigger dejan de descargarse para la interfaz. La dependencia queda para las maquetas históricas que todavía la usan.
- El contenido es visible por defecto. Fallar JavaScript o carecer de soporte solo elimina la mejora visual.
- Movimiento reducido desactiva las entradas y cancela las animaciones activas, incluso si la preferencia cambia con la página abierta.
- El foco cancela el movimiento de su contenedor. La respuesta con teclado es inmediata y los pasos de cita no se animan al navegar con teclado.
- Las entradas no desplazan tarjetas completas que contengan controles: se mueven sus títulos, horas, fotografías o detalles. En la acción principal se anima el rótulo dentro del enlace, conservando su área pulsable. Esto evita perder un click cuando una entrada coincide con la interacción.
- Una pestaña oculta cancela los gestos activos. No hay animaciones decorativas infinitas.

Evidencia y recorrido en `docs/visual/rondas/movimiento-de-marca-2026-11-02/`. Las capturas y la grabación de interfaz usan `?3d=0` para mostrar que la nueva capa funciona sin montar WebGL; el 3D se comprueba por separado con Control y sus pruebas.
