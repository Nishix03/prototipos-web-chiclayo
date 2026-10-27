# Progreso de los 6 prototipos

**Modo autónomo desde el 2026-10-26** (orden de Iván): se trabaja sin paradas de aprobación hasta terminar los 6 rubros, en este orden:

1. restaurante v2
2. barbería
3. clínica dental
4. spa
5. veterinaria
6. gimnasio

Si se reinicia el contexto de Claude Code, **se retoma desde este archivo**.

## Reglas del modo autónomo

1. **Planificación visual completa por rubro.**
   - En el paso 2 se hacen 3 direcciones con storyboard (3 cuadros a 360 y 1440 px, con el 3D renderizado).
   - Claude Code elige con una tabla de puntaje: exigencias, identidad distinta de los rubros anteriores y costo de rendimiento.
   - Todo queda en `docs/visual/<rubro>.md`.
2. **Control de exigencias** (ADR 009), con una captura por punto, antes de construir y al final. Se corrige en bucle hasta que pase todo.
3. **Construcción** con las 8 etapas de calidad y el checklist de terminado.
4. **Rendimiento** (ADR 008):
   - Lighthouse móvil con 3D entre 85 y 89: se acepta y se anota en el ADR.
   - Bajo 85: se aligera la escena hasta llegar a 85.
5. **Una rama y un PR por rubro.**
   - Se fusiona con merge commit solo si pasan lint, build, `test:teclado`, `a11y`, Lighthouse y los checks de GitHub.
   - Nunca push directo a `main` ni force push.
6. **Solo se detiene si:**
   - falta una clave, una contraseña o un pago (sin clave de OpenAI se usa la imagen fija del 3D);
   - una acción borraría trabajo o no se puede deshacer;
   - una prueba falla 3 veces seguidas con el mismo error sin avance.

## Estado por rubro

| Rubro          | Estado                 | Dirección elegida | Lighthouse móvil / escritorio | Axe | PR           |
| -------------- | ---------------------- | ----------------- | ----------------------------- | --- | ------------ |
| Restaurante v2 | Construido; PR abierto | C «El pase»       | 92 / 89                       | 0   | ver bitácora |
| Barbería       | pendiente              | —                 | —                             | —   | —            |
| Clínica dental | pendiente              | —                 | —                             | —   | —            |
| Spa / Estética | pendiente              | —                 | —                             | —   | —            |
| Veterinaria    | pendiente              | —                 | —                             | —   | —            |
| Gimnasio       | pendiente              | —                 | —                             | —   | —            |

## Bitácora

### 2026-10-26 · Restaurante v2

- **«La olla manda»** (ronda 1): no aprobada. De ahí salieron las exigencias de diseño (ADR 009).
- **«La cocina abierta»** (ronda 2):
  - 3 storyboards en `docs/visual/restaurante-cocina-abierta/`; los 3 pasan los puntos medibles del Control.
  - **Elegida: C «El pase».** La tabla de puntaje está en `docs/visual/restaurante-cocina-abierta.md`.
- **Qué sigue:** pasos 3 a 6 del restaurante con la dirección C y luego la construcción en `restaurante/`.
  - No cambian la lógica (`carrito.js`, comanda, reservas) ni los ganchos `data-*` que usan las pruebas.
- **Construido (pasos 3 a 6 y las 8 etapas):** `restaurante/` con la dirección C.
  - **Núcleo nuevo (lo reusan los rubros que vienen):**
    - `core/escena3d.js`: motor 3D común, con versión ligera para celular;
    - `core/carga3d.js`: cuándo se carga el 3D;
    - estado «Abierto · hoy de…» con enlace al horario;
    - scripts `poster`, `control`, `lighthouse` y `video`.
  - **Lighthouse** (mediana de 5): móvil 92 · escritorio 89 (aceptado y anotado en el ADR 008). LCP 1.30 s.
  - **Pruebas:** Axe 0 violaciones · `test:teclado` 24/24 (4 workers y 60 s por prueba).
  - **Control de exigencias final:** pasa a 360 y 1440 px.
- **Qué sigue:** fusionar el PR del restaurante y empezar la **barbería** («Filo») en `feat/rubro-barberia`.
