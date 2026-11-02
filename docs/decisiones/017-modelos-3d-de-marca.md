# 017 · Modelos 3D vinculados a cada marca

Fecha: 2026-11-02. Estado: implementado para revisión visual.

## Contexto

Iván pide personalizar también los modelos, de modo que toda la landing tenga la misma identidad. Se conservan las escenas propias de cada rubro y su estrategia de carga. Los símbolos son de empresas ficticias creadas para estas demos.

## Decisión

Los PNG maestros se convierten fuera del navegador en contornos simplificados. `scripts/relieves-marca.mjs` escribe `img/marca/relieve.json`; `core/marca3d.js` los extruye y reutiliza geometrías y materiales entre instancias. Los contornos se trazan a 256 px y se simplifican para evitar bordes escalonados sin transportar la imagen original al 3D.

| Marca             | Modelo y material                                                                          | Relación con el movimiento                                  |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Filo              | F dorada en relieve sobre cromo; se retira el texto genérico repetido del material         | Barrido de luz y giro corto al bajar                        |
| Remanso           | R mineral ámbar sobre el agua cálida                                                       | Inclinación mínima con el puntero; deriva lenta con el agua |
| Sonrisa Clara     | Firma S de vidrio estilizado y arcadas azul glaciar                                        | La firma termina de alinearse al ordenar la sonrisa         |
| Latido            | Emblema L/pulso con profundidad sobre el monitor lima                                      | Cambio de profundidad e inclinación según avance del scroll |
| Trufa             | Chapas de mascota con el símbolo dentro del propio accesorio                               | Siguen al puntero y se ordenan junto a los demás accesorios |
| Sabores del Norte | Cerámica alternada, bordes de ají y sellos en relieve que siguen la curvatura de cada bowl | Los ingredientes caen en sus recipientes identificados      |

## Presupuesto

No se añaden archivos de modelos, mapas de entorno ni texturas de alta resolución. Los materiales se capturan en pequeños canvas y la geometría llega con el módulo 3D diferido. Un símbolo tiene entre 376 y 1204 triángulos; los sellos repetidos comparten geometría.

Se compensa el detalle: cromo de 140 a 96 columnas en escritorio, arcadas de 24 a 20 piezas, accesorios de Trufa de 24 a 18 y monitor de cinco a tres líneas. Se mantienen la versión móvil ligera, carga al explorar, movimiento reducido, render bajo demanda y pausa de pestaña oculta.

Los nuevos pósters se renderizan desde estas mismas escenas. Los 24 encuadres/tamaños quedan por debajo de los límites del ADR 008. En Sabores del Norte también se sirven las fotos de la carta en 320, 480 y 640 px para reducir transferencia y decodificación.

## Verificación

Control a 360 y 1440 con 3D forzado y capturas en `docs/visual/rondas/marcas-3d-2026-11-02/`. Pruebas de teclado, accesibilidad y comprobación de que el motor no dibuja en reposo. La medición de carga automática distingue móvil (póster al inicio) de escritorio; el Control fuerza el modelo real en ambos tamaños.
