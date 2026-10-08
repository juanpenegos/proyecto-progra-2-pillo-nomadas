/**
 * Calificación de un alojamiento después de sumar las reseñas nuevas.
 *
 * La calificación del JSON se toma como el promedio de las reseñas que el alojamiento ya tiene
 * (si no tiene ninguna, cuenta como una sola valoración). Cada reseña nueva se suma a ese promedio:
 * nuevo promedio = (calificación × reseñas anteriores + suma de las nuevas) ÷ (anteriores + nuevas).
 * Se redondea a un decimal. Sin reseñas nuevas, la calificación no cambia.
 */
export const calcularCalificacion = (base: number, cantidadBase: number, nuevas: number[]): number => {
  if (nuevas.length === 0) {
    return base;
  }
  const peso = Math.max(1, cantidadBase);
  const suma = nuevas.reduce((total, n) => total + n, 0);
  const promedio = (base * peso + suma) / (peso + nuevas.length);
  return Math.round((promedio + Number.EPSILON) * 10) / 10;
};
