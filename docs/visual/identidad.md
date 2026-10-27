# Identidad por rubro

Cada prototipo tiene un concepto, una escena inmersiva y un ritmo que ningún otro repite. Esta matriz viene de [docs/PLAN.md](../PLAN.md) (sección «Identidad por rubro», revisada el 26 de octubre) y es el punto de partida del paso 2 de la planificación visual: las 3 direcciones de cada rubro son variantes de su fila, nunca de otra.

| Rubro          | Concepto            | Escena inmersiva (punto de partida)                                                                                                                                      | Componentes propios                                                                | Color de partida               |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------ |
| Restaurante    | «La cocina abierta» | Ingredientes del norte (ají limo, limón, cebolla morada, loche) en 3D mate a pantalla completa, con vapor sutil; al bajar se ordenan y forman las categorías de la carta | Carta como comanda que se imprime; horario y menú del día en pizarra               | Terracota, crema, ají amarillo |
| Barbería       | «Filo»              | Superficie de cromo líquido que se deforma con el scroll y refleja el titular, con un barrido de luz                                                                     | Elegir corte y barbero como un turno en la silla; tiempo de espera siempre visible | Negro, dorado                  |
| Clínica dental | «Calma clínica»     | Formas de vidrio esmerilado que se alinean poco a poco con el scroll, como una sonrisa que se ordena                                                                     | Cuestionario como recorrido; precios «desde» con duración                          | Blanco, menta                  |
| Spa / Estética | «Agua quieta»       | Shader de agua a pantalla completa en el que flotan los textos                                                                                                           | Armador de cita al ritmo de la respiración; comparador antes y después             | Verde salvia, arena            |
| Veterinaria    | «Juego y urgencia»  | Formas suaves tipo juguete, mate, que reaccionan al toque y al cursor                                                                                                    | Barra de urgencias que late; calendario de vacunas por especie                     | Turquesa, naranja              |
| Gimnasio       | «Pulso»             | Ondas de luz que responden a la velocidad del scroll, con tipografía cinética                                                                                            | Horario de clases con «en curso» en vivo; cuenta regresiva de la promoción         | Negro, verde lima neón         |

## Reglas que valen para todas las filas

- **Nada de personajes, logos ni marcas reales en las escenas.**
- **Las 5 exigencias de diseño del plan** se verifican con una captura por punto antes de mostrar cada paso (ADR 009):
  1. la primera pantalla informa;
  2. titulares cortos;
  3. el 3D es inmersivo y coherente con la interfaz;
  4. nada de plantilla;
  5. un solo lenguaje de principio a fin.
- **Inmersión mínima en cada rubro:**
  - la escena de su fila, con imagen fija de respaldo (ADR 008);
  - al menos 3 coreografías ligadas al scroll;
  - microinteracciones en la función estrella;
  - View Transitions entre estados.
- **El 3D habla el mismo idioma que la interfaz:** formas limpias, materiales mate o de vidrio y colores de los tokens. Nada de objetos realistas «de época».
- **Lo que distingue a cada fila:** el ritmo. Dos rubros pueden compartir una técnica (por ejemplo, partículas), pero no su duración, su curva ni su intención. Antes de cerrar el paso 2 de un rubro, se compara con las filas ya construidas.
- **Los colores de partida son eso: un punto de partida.** El paso 3 los convierte en tokens con contraste verificado.
- **Las imágenes:**
  - fotos con IA marcadas como ilustrativas, o la imagen fija renderizada del 3D mientras no haya clave;
  - con clientes reales, fotos reales de la visita.

## Estado

| Rubro          | Brief                                                                                                                                                                                                                                                | Dirección elegida |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Restaurante    | v1 funcional (diario) en [restaurante.md](restaurante.md); v2: «La olla manda» no aprobada ([restaurante-inmersivo.md](restaurante-inmersivo.md)); «La cocina abierta» en el paso 2 ([restaurante-cocina-abierta.md](restaurante-cocina-abierta.md)) | C «El pase»       |
| Barbería       | [barberia.md](barberia.md)                                                                                                                                                                                                                           | A «Espejo»        |
| Clínica dental | [dental.md](dental.md)                                                                                                                                                                                                                               | A «Arco»          |
| Spa / Estética | [spa.md](spa.md)                                                                                                                                                                                                                                     | A «Superficie»    |
| Veterinaria    | [veterinaria.md](veterinaria.md)                                                                                                                                                                                                                     | B «Estante»       |
| Gimnasio       | [gimnasio.md](gimnasio.md)                                                                                                                                                                                                                           | A «Monitor»       |
