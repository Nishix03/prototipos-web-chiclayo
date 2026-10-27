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

## Nombres de demo

Los aprobó Iván en la Fase 2, después de verificar con búsquedas web que no coinciden con negocios conocidos de Chiclayo:

- «Sabores del Norte · Demo»
- «Barbería Filo · Demo»
- «Sonrisa Clara · Demo»

Spa, veterinaria y gimnasio usarán nombres nuevos, verificados de la misma forma, y quedarán anotados aquí.

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
- **Fusionado** el PR #4 con merge commit (checks de GitHub en verde). Publicado en https://nishix03.github.io/prototipos-web-chiclayo/restaurante/

### Método para los rubros que siguen

- **Storyboards:** las 3 direcciones se construyen como variantes de la misma página real (`?direccion=a|b|c`) y se capturan con `npm run control -- <rubro> <a|b|c>`. Así el storyboard ya tiene el 3D renderizado y el contenido verdadero.
- **Después de elegir,** se quitan las variantes no elegidas del código; sus capturas quedan en `docs/visual/control/<rubro>/`.

### 2026-10-27 · Barbería «Filo»

- **3 direcciones** como variantes de la página real: A Espejo, B Charco, C Navaja.
- **Elegida: A «Espejo».**
  - El cromo refleja el titular.
  - B se parecía al agua del spa.
  - C perdía fuerza en celular.
  - La tabla está en `docs/visual/barberia.md`.
- **Función estrella:** el turno (corte → día → barbero que atiende ese día → hora). Hay además un letrero fijo con la espera de hoy y un tablero de turnos por barbero.
- **Núcleo:**
  - `core/escena-cliente.js`, el arranque común del 3D;
  - el motor 3D acepta escenas sin piezas (`cuadro`) y en la versión ligera dibuja al 70 %;
  - `scripts/hoja.mjs` arma la hoja de contactos;
  - `control.mjs` acepta una variante;
  - las pruebas dejan correr el reloj.
- **Lighthouse:** móvil 86 (aceptado, ADR 008) · escritorio 98. Axe 0.
- **Qué sigue:** fusionar el PR de la barbería y empezar la **clínica dental** («Calma clínica», «Sonrisa Clara · Demo») en `feat/rubro-dental`.
