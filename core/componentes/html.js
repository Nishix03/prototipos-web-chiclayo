// Plantillas HTML seguras para los componentes.
//
// html`<h1>${negocio.nombre}</h1>` escapa automáticamente cada valor interpolado:
// si un nombre trae "<script>", se imprime como texto y no se ejecuta.
// Para insertar HTML ya construido (otro componente) se envuelve con crudo().

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapar(valor) {
  return String(valor).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

class HtmlCrudo {
  constructor(texto) {
    this.texto = texto;
  }
  toString() {
    return this.texto;
  }
}

/** Marca un texto como HTML de confianza (ya escapado o generado por nosotros). */
export function crudo(texto) {
  return new HtmlCrudo(texto);
}

function convertir(valor) {
  if (valor === null || valor === undefined || valor === false) return '';
  if (valor instanceof HtmlCrudo) return valor.texto;
  if (Array.isArray(valor)) return valor.map(convertir).join('');
  return escapar(valor);
}

/** Tagged template: escapa los valores, respeta los HtmlCrudo y aplana los arrays. */
export function html(partes, ...valores) {
  let salida = partes[0];
  valores.forEach((valor, i) => {
    salida += convertir(valor) + partes[i + 1];
  });
  return crudo(salida);
}
