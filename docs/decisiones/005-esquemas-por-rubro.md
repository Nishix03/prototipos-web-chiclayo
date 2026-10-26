# 005 – Un esquema por rubro que extiende el esquema base

- **Estado:** aceptada
- **Fecha:** 2026-10-26
- **Fase:** 2

## Contexto

En la fase 1, `core/negocio.schema.json` describía todo `negocio.json` y cerraba el objeto con `additionalProperties: false` (un campo desconocido es un error). En la fase 2 cada rubro necesita sus propios campos: el restaurante una `carta` y un `menuDelDia`, la barbería `cortes` y `barberos`, la clínica un `cuestionario`. Con el esquema cerrado, ninguno cabía.

## Opciones consideradas

1. **Meter todos los campos de todos los rubros en el esquema base, como opcionales.** Un solo archivo, pero la carta pasaría a ser válida en una clínica y el esquema crecería sin control.
2. **Abrir el esquema base (`additionalProperties: true`).** Cabe todo, pero se pierde la detección de errores de tipeo, que fue la razón de cerrarlo.
3. **Esquema base abierto + un `rubro.schema.json` por página que lo extiende y se cierra.** JSON Schema 2020-12 tiene justo esto: `allOf` para heredar y `unevaluatedProperties: false` para cerrar teniendo en cuenta lo heredado.

## Decisión

Opción 3. Cada carpeta (`_ejemplo/`, `restaurante/`…) tiene su `rubro.schema.json`:

```json
{
  "type": "object",
  "allOf": [{ "$ref": "../core/negocio.schema.json" }],
  "properties": { "rubro": { "const": "restaurante" }, "carta": { … } },
  "unevaluatedProperties": false
}
```

`negocio.json` apunta a él con `"$schema": "./rubro.schema.json"` y `core/validar.js` lo compila al construir. Los `$defs` comunes (`precio`, `imagen`, `credito`) se reutilizan con `$ref` al esquema base.

## Consecuencias

- Sigue habiendo **una sola fuente de verdad por campo**: lo común en la base, lo propio en el rubro. VS Code autocompleta en cada carpeta y el build valida lo mismo.
- Los errores de tipeo se siguen detectando (`unevaluatedProperties`), con un mensaje que sugiere revisar también `rubro.schema.json`.
- Copiar `_ejemplo/` para un rubro nuevo copia también su esquema mínimo, listo para agregar campos.
- La lista de licencias de fotos permitidas vive en `$defs.credito` del esquema base: el build y `npm run fotos` la leen de ahí.
- En Java es herencia de clases: `RubroRestaurante extends NegocioBase`, donde la base no es `final` pero cada subclase sí lo es.
