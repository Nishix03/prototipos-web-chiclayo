// Estado compartido entre las coreografías (GSAP) y la escena 3D, sin acoplarlas:
// ScrollTrigger escribe aquí el avance del scroll y la escena lo lee en cada cuadro.
export const progreso = {
  portada: 0, // 0 = arriba del todo · 1 = bajaste 60 % de una pantalla
};
