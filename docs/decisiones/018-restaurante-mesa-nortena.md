# 018 · Restaurante: una mesa servida

Fecha: 2026-11-02. Estado: implementado para revisión visual.

Iván rechaza la escena anterior del restaurante y pide rehacerla con otra dirección más cercana a su temática. Se sustituye el mostrador con ingredientes suspendidos por un bodegón de comida servida: ceviche norteño, camote, choclo, cebolla criolla, limón y ají sobre cerámica de la marca. El sello se integra en el borde del plato. Madera y un camino de mesa tejido acompañan la comida.

## Contrato

- Paleta: madera #754c34, cerámica #f3e8ce, barro #994321, ají #df9d16 y verde #486c28. Fraunces y Figtree siguen en la interfaz.
- Escritorio: comanda a la izquierda, plato a la derecha. Se reduce la comanda a 36 rem para reservar espacio al bodegón.
- Móvil: encuadre propio de la mesa en el tercio inferior; se mantienen las acciones al alcance.
- La comida está apoyada en la mesa. El gesto de exploración es un desplazamiento corto de cámara, ligado al scroll, sin animación autónoma.

| Antes                                              | Después                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| Ingredientes suspendidos que caían en cuatro bowls | Ceviche servido y guarniciones apoyadas en un único plato protagonista          |
| Cámara frontal al mostrador                        | Vista oblicua sobre una mesa, con recorrido corto al explorar                   |
| Etiquetas móviles de categorías sobre los bowls    | Categorías en la carta; se retira la capa de etiquetas que dejó de corresponder |

## Coste

Modelado en código y materiales Lambert; dos mapas procedurales pequeños para madera/tejido y un mapa compartido de sombra de contacto. Pescado, cilantro y choclo usan instancias. No hay modelos descargables, mapas de entorno, reflejos ni segunda pasada de sombras. Se conservan el render en reposo y los modos de ahorro/movimiento reducido del motor común. Para este rubro la carga al explorar también se aplica al escritorio: primer movimiento del cursor, scroll, toque o teclado. El modo forzado de Control monta el motor sin esperar interacción.

Los pósters se exportan desde el modelo definitivo: escritorio 37,9 KB (1440) y 21,5 KB (960); móvil 59,7 KB (900) y 33,6 KB (600). Todos quedan dentro del ADR 008. El exportador ajusta la calidad solo si necesita respetar el límite de cada tamaño.

En teléfonos de hasta 600 px se limita el recurso decorativo a la variante de 600 px, incluso con DPR alto: son 33,6 KB en lugar de 59,7 KB. El texto y los controles son HTML; la imagen no contiene información que deba leerse. Los dispositivos verticales más anchos conservan las dos variantes. Esto evita gastar ancho de banda en un fondo que pronto cede a la versión 3D ligera al explorar.

La escena anterior permanece como archivo de referencia; el montaje de producción usa `restaurante/escena/mesa.js`. Se retiran del flujo activo los selectores de direcciones antiguas que apuntaban a recursos ausentes. Carrito, comanda y reservas mantienen su implementación.

Evidencia: `docs/visual/rondas/restaurante-mesa-2026-11-02/`. Esta ronda sustituye visualmente el restaurante de la comparación anterior; los otros cinco prototipos no cambian.

Verificación final: build y lint correctos, Control a 360 y 1440 con 3D vivo y sin desborde, y 16 pruebas aprobadas de pedido, reservas, filtros y primera interacción. Lighthouse local: 98 móvil (mediana de cinco) y 100 escritorio (una corrida), con accesibilidad/buenas prácticas/SEO en 100. LCP móvil 1,98 s. Las muestras y las rondas intermedias se conservan en la carpeta de evidencia; los puntajes no representan datos de campo.
