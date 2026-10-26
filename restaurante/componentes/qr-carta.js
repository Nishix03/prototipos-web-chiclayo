import QRCode from 'qrcode';
import { html, crudo } from '../../core/componentes/html.js';

/**
 * QR de la carta para imprimir en las mesas. Se genera al construir como SVG (receta de QR de
 * crear-web-micro-saas, adaptada: aquí la URL es fija, así que no hace falta la librería en el
 * navegador). Un solo <path>: pesa poco y escala sin perder nitidez al imprimir.
 */
function qrSvg(texto) {
  const { modules } = QRCode.create(texto, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  const borde = 4; // zona en blanco que exige el estándar QR
  let trazo = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (modules.get(y, x)) trazo += `M${x + borde} ${y + borde}h1v1h-1z`;
    }
  }
  const lado = n + borde * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" shape-rendering="crispEdges"><rect width="${lado}" height="${lado}" fill="#fff"/><path d="${trazo}" fill="#000"/></svg>`;
}

export function qrCarta(negocio, { urlPagina }) {
  const url = `${urlPagina}#carta`;
  const svg = qrSvg(url);
  const descarga = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return html`
    <section class="qr-carta contenedor" aria-labelledby="qr-titulo">
      <div class="qr-carta__codigo" role="img" aria-label="Código QR que abre la carta">
        ${crudo(svg)}
      </div>
      <div class="qr-carta__texto">
        <h2 id="qr-titulo">La carta en tu mesa</h2>
        <p>Escanea el código con la cámara del celular y pide desde la mesa.</p>
        <a class="boton boton--secundario" href="${descarga}" download="qr-carta.svg">
          Descargar el QR para imprimir
        </a>
      </div>
    </section>
  `;
}
