#!/usr/bin/env bash
# Lighthouse 12 sobre la versión de producción de un rubro (build + preview), mediana de 5
# corridas en celular y en escritorio. Así se mide el presupuesto del ADR 008.
#
#   npm run lighthouse -- restaurante
#
# Usa el Chrome que instaló browser-driver-manager para `npm run a11y`. Corre desde /tmp:
# Lighthouse en WSL crea perfiles de Chrome en la carpeta actual y no deben caer en el repo.
set -euo pipefail
RUBRO="${1:?Uso: npm run lighthouse -- <carpeta-del-rubro>}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
set -a
# shellcheck disable=SC1090
source ~/.browser-driver-manager/.env
set +a
export CHROME_PATH="$CHROME_TEST_PATH"
PUERTO=4195
(cd "$REPO" && npx vite build >/dev/null 2>&1)
(cd "$REPO" && exec npx vite preview --port "$PUERTO" --strictPort >/dev/null 2>&1) &
SERVIDOR=$!
trap 'kill "$SERVIDOR" 2>/dev/null; pkill -P "$SERVIDOR" 2>/dev/null || true' EXIT
sleep 4
URL="http://localhost:$PUERTO/prototipos-web-chiclayo/$RUBRO/"
SALIDA="$(mktemp -d)"
cd "$SALIDA"
for modo in movil escritorio; do
  extra=""
  [ "$modo" = escritorio ] && extra="--preset=desktop"
  for i in 1 2 3 4 5; do
    npx -y lighthouse@12 "$URL" $extra --quiet --chrome-flags="--headless=new --no-sandbox" \
      --output=json --output-path="$SALIDA/$modo-$i.json" >/dev/null 2>&1
  done
done
SALIDA="$SALIDA" node -e '
const fs = require("fs");
const dir = process.env.SALIDA;
for (const modo of ["movil", "escritorio"]) {
  const r = [1, 2, 3, 4, 5].map((i) => JSON.parse(fs.readFileSync(`${dir}/${modo}-${i}.json`)));
  const med = (f) => r.map(f).sort((a, b) => a - b)[2];
  const c = (k) => med((x) => Math.round(x.categories[k].score * 100));
  const a = (k) => med((x) => x.audits[k].numericValue);
  console.log(
    `${modo.padEnd(10)} rendimiento ${c("performance")} · accesibilidad ${c("accessibility")} · buenas prácticas ${c("best-practices")} · SEO ${c("seo")}` +
      ` | LCP ${(a("largest-contentful-paint") / 1000).toFixed(2)} s · CLS ${a("cumulative-layout-shift").toFixed(3)} · TBT ${Math.round(a("total-blocking-time"))} ms`,
  );
}'
