import { html } from '../../core/componentes/html.js';
import { imagen } from '../../core/componentes/imagen.js';

/** El comedor como reportaje gráfico: una foto grande con su pie, en vez de una galería. */
export function elLocal(negocio) {
  const foto = negocio.imagenes.galeria?.[0];
  if (!foto) return '';
  return html`
    <section class="el-local contenedor" aria-labelledby="el-local-titulo">
      <h2 class="el-local__titulo" id="el-local-titulo">El local</h2>
      <figure>
        ${imagen(foto)}
        <figcaption>${negocio.textos.introGaleria}</figcaption>
      </figure>
    </section>
  `;
}
