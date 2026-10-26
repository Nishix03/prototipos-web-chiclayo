// Navegador: convierte el QR que ya está en la página en un archivo descargable.
// Así el SVG viaja una sola vez en el HTML (antes iba repetido como data URI).

export function iniciarDescargaQr() {
  const enlace = document.querySelector('[data-descargar-qr]');
  const svg = document.querySelector('.qr-carta__codigo svg');
  if (!enlace || !svg) return;
  const archivo = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
  enlace.href = URL.createObjectURL(archivo);
}
