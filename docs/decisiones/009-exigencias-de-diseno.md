# 009 – Exigencias de diseño y skills que dejan de usarse

- **Estado:** aceptada
- **Fecha:** 2026-10-26
- **Fase:** 2

## Contexto

La primera maqueta del restaurante v2 («La olla manda») pasó las auditorías técnicas y Lighthouse, pero Iván no la aprobó. Los motivos fueron 4:

- **La olla:** era realista y se veía anticuada frente a una interfaz minimalista, y además estaba suelta al costado del texto.
- **El titular:** tenía 10 palabras y 5 líneas.
- **El horario:** no se veía en la primera pantalla.
- **La composición se sentía de plantilla:** texto a un lado, objeto al otro, dos botones redondeados y fondo plano.

Ninguna etapa del plan medía eso. Las auditorías revisan que la página sea correcta, no que sea propia. Además, varias skills empujaban hacia lo genérico:

- **Los arquetipos de `crear-web-como-servicio`:** son 10 diseños fijos.
- **`ui-ux-pro-max`:** entrega el promedio de cada tipo de negocio. Para este restaurante propuso rojo rosado con Playfair.
- **`landing-page-copy`:** sus titulares salen largos y llenos de palabras clave.

## Opciones consideradas

1. **Seguir igual y corregir a ojo en cada revisión.**
   - A favor: no cambia nada del proceso.
   - En contra: el mismo error se repetiría en los 6 rubros, y Iván lo descubriría al final de cada uno.
2. **Exigencias escritas y verificables, con una captura como prueba, antes de mostrar nada.**
   - A favor: el error se detecta en el paso 2 y no en el 6.
   - En contra: hay que construir storyboards con el 3D ya renderizado desde el paso 2, lo que adelanta trabajo.

## Decisión

Opción 2, tal como está en [docs/PLAN.md](../PLAN.md) («Exigencias de diseño para todos los rubros»):

1. **La primera pantalla informa:** nombre, titular, estado con el horario de hoy y enlace al horario completo, y el botón de la función estrella, a 360 y a 1440 px.
2. **Titulares cortos:** el principal de 6 palabras o menos, en 2 líneas como máximo en escritorio y 3 en celular. Los de sección, de 5 palabras o menos.
3. **El 3D es inmersivo y coherente con la interfaz:** usa el mismo lenguaje visual, ocupa el encuadre y la interfaz vive dentro de él.
4. **Nada de plantilla:** hay estructuras prohibidas, y cada rubro tiene al menos 2 componentes propios de su negocio.
5. **Un solo lenguaje de principio a fin.**

El paso 2 ahora entrega **3 storyboards de 3 cuadros** (inicio, mitad del scroll y función estrella) a 360 y 1440 px, con el 3D renderizado. El **Control de exigencias** lleva una captura por punto y se corre antes de mostrarle nada a Iván.

**Skills que dejan de usarse en el diseño:**

| Skill                                   | Qué la reemplaza                                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Arquetipos de `crear-web-como-servicio` | `frontend-design` con las exigencias. Se mantienen el catálogo de efectos, las reglas de robustez y el checklist |
| `ui-ux-pro-max`                         | `design-system`, solo para ordenar los tokens                                                                    |
| `landing-page-copy`                     | `copy-edit` y `brand-voice`, con los límites de la exigencia 2                                                   |
| `anti-ui-slop`                          | El Control de exigencias y las referencias de inmersión                                                          |

`seo-audit` sigue en el proceso, pero no puede pedir que el titular sea más largo. Las palabras clave van en el `title`, la `meta description`, el subtítulo y el JSON-LD.

## Consecuencias

- **Lo que ganamos:** el «no se siente propio» se vuelve verificable. El Control tiene puntos medibles (palabras, líneas, qué está en la primera pantalla) y puntos de juicio, cada uno con su captura.
- **Lo que cuesta:** el paso 2 se vuelve más caro, porque hay que construir 3 escenas 3D para elegir una. Se compensa con que los pasos 3 a 6 parten de algo ya probado.
- **Lo que se conserva del intento anterior:**
  - el ADR 008 (imagen fija liviana como LCP, 3D diferido y redibujado solo cuando cambia algo);
  - la lógica del sitio (carrito, comanda, reservas, pruebas);
  - las herramientas de la maqueta (recorte de fuentes, póster con límite de peso, grabación con Axe).
- **El brief de «La olla manda»** queda en el repo como historia, marcado como no aprobado.
