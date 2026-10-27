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
- «Remanso Spa · Demo» (modo autónomo, 2026-10-27): una búsqueda web no mostró ningún spa con ese nombre en Chiclayo. Pendiente de Iván: confirmarlo en Google Maps.
- «Trufa Veterinaria · Demo» (modo autónomo, 2026-10-27): una búsqueda web no mostró ninguna veterinaria con ese nombre en Chiclayo. Pendiente de Iván: confirmarlo en Google Maps.

El gimnasio usará nombres nuevos, verificados de la misma forma, y quedarán anotados aquí.

## Estado por rubro

| Rubro          | Estado                 | Dirección elegida | Lighthouse móvil / escritorio | Axe | PR           |
| -------------- | ---------------------- | ----------------- | ----------------------------- | --- | ------------ |
| Restaurante v2 | ✔ publicado            | C «El pase»       | 92 / 89                       | 0   | #4           |
| Barbería       | ✔ publicado            | A «Espejo»        | 86 / 98                       | 0   | #5           |
| Clínica dental | ✔ publicado            | A «Arco»          | 93 / 100                      | 0   | #6           |
| Spa / Estética | ✔ publicado            | A «Superficie»    | 93 / 99                       | 0   | #7           |
| Veterinaria    | Construida; PR abierto | B «Estante»       | 92 / 99                       | 0   | ver bitácora |
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
- **Fusionado** el PR #5 con merge commit (checks de GitHub en verde). Publicado en https://nishix03.github.io/prototipos-web-chiclayo/barberia/

### 2026-10-27 · Clínica dental «Calma clínica»

- **3 direcciones** como variantes de la página real: A Arco, B Columna, C Bruma.
- **Elegida: A «Arco».**
  - Las piezas de vidrio se cierran en una sonrisa bajo el titular.
  - B perdía la sonrisa (fila recta).
  - C se parecía al restaurante por la serifa cursiva y la niebla costaba más.
  - La tabla está en `docs/visual/dental.md`.
- **Función estrella:** el cuestionario «¿Qué tratamiento necesito?», una pregunta a la vez, con View Transitions. El resultado:
  - avisa que es una orientación y no un diagnóstico;
  - deja elegido el motivo de la cita de evaluación;
  - agrega una línea al mensaje de WhatsApp.
- **Componentes del rubro:**
  - precios «desde» con duración;
  - equipo con sello de colegiatura «COP 00000 (demo)»;
  - preguntas frecuentes con `details`.
- **Sin antes y después:** con datos de demo sería fabricar resultados.
- **Validación al construir:** si una respuesta del cuestionario apunta a una pregunta o a un tratamiento que no existe, el build se detiene con un error en español.
- **Lighthouse:** móvil 93 · escritorio 100. Axe 0. `test:teclado` 52/52.
- **Qué sigue:** fusionar el PR de la clínica dental y empezar el **spa** («Agua quieta», shader de agua) en `feat/rubro-spa`. Antes, un nombre de demo nuevo verificado con búsqueda web.
- **Fusionado** el PR #6 con merge commit (checks de GitHub en verde). Publicado en https://nishix03.github.io/prototipos-web-chiclayo/dental/

### 2026-10-27 · Spa «Agua quieta»

- **Nombre de demo:** «Remanso Spa · Demo».
- **3 direcciones** como variantes de la página real: A Superficie, B Horizonte, C Gota.
- **Elegida: A «Superficie».**
  - Los anillos del agua salen de detrás del titular.
  - B casi no mostraba el agua.
  - C se parecía al restaurante por la cursiva.
  - La tabla está en `docs/visual/spa.md`.
- **Función estrella:** la cita en 3 pasos (servicio o paquete → día y franja que cabe antes de cerrar → nombre), un paso a la vez, con un anillo que respira.
- **Componentes del rubro:**
  - carta de servicios con minutos y precio, con filtros por categoría;
  - paquetes con la tarjeta de regalo por WhatsApp;
  - comparador antes/después, con dibujos de agua marcados como demo y no como resultados.
- **Núcleo:**
  - `core/componentes/comparador.js`, que podrá usar la clínica dental con fotos reales;
  - `horasPosibles` pasa de la barbería a `core/horario.js`.
- **Corrección de los briefs:**
  - el de la clínica dental (y el primer borrador del spa) afirmaba qué muestran las webs del rubro sin haberlas revisado. Quedó corregido.
  - Revisar las webs de los prospectos queda pendiente antes de mostrarles la demo.
- **Lighthouse:** móvil 93 · escritorio 99. Axe 0. `test:teclado` 66/66.
- **Qué sigue:** fusionar el PR del spa y empezar la **veterinaria** («Juego y urgencia») en `feat/rubro-veterinaria`. Antes, un nombre de demo nuevo verificado con búsqueda web.
- **Fusionado** el PR #7 con merge commit (checks de GitHub en verde). Publicado en https://nishix03.github.io/prototipos-web-chiclayo/spa/

### 2026-10-27 · Veterinaria «Juego y urgencia»

- **Nombre de demo:** «Trufa Veterinaria · Demo».
- **3 direcciones** como variantes de la página real: A Pelotero, B Estante, C Rebote.
- **Elegida: B «Estante».**
  - Es la única portada a la izquierda: barbería, clínica dental y spa ya van centradas.
  - A se veía más juguetona, pero repetía la composición.
  - La tabla está en `docs/visual/veterinaria.md`.
- **Función estrella:** la barra de urgencias 24 h, fija arriba con un punto que late, «Llamar ahora» (`tel:`) y WhatsApp.
- **Componentes del rubro:**
  - el calendario de vacunas por especie, con fechas y la próxima dosis; la tabla está marcada como de demostración;
  - la cita para consulta o baño, que avisa el domingo en la tarde;
  - consejos de cuidado;
  - el equipo con «CMVP 00000 (demo)».
- **Núcleo:** el motor 3D acepta `puntero`. Los juguetes siguen al cursor o al dedo y la escena se redibuja solo mientras el puntero se mueve.
- **Lighthouse:** móvil 92 · escritorio 99. Axe 0. `test:teclado` 78/78.
- **Qué sigue:** fusionar el PR de la veterinaria y empezar el **gimnasio** («Pulso») en `feat/rubro-gimnasio`. Antes, un nombre de demo nuevo verificado con búsqueda web.
