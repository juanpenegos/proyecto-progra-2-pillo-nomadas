import { calcularCalificacion } from './rating';

describe('calcularCalificacion', () => {
  it('sin reseñas nuevas no cambia la calificación', () => {
    expect(calcularCalificacion(4.7, 1, [])).toBe(4.7);
    expect(calcularCalificacion(4.55, 0, [])).toBe(4.55);
  });

  it('una reseña nueva se promedia con la calificación que ya tenía (1 reseña anterior)', () => {
    // (4.7 × 1 + 3) ÷ 2 = 3.85 → 3.9
    expect(calcularCalificacion(4.7, 1, [3])).toBe(3.9);
  });

  it('una reseña de 5 estrellas sube la calificación y una de 1 la baja', () => {
    expect(calcularCalificacion(4, 1, [5])).toBe(4.5);
    expect(calcularCalificacion(4, 1, [1])).toBe(2.5);
  });

  it('sin reseñas anteriores, la calificación base cuenta como una valoración', () => {
    // (4.5 × 1 + 4) ÷ 2 = 4.25 → 4.3
    expect(calcularCalificacion(4.5, 0, [4])).toBe(4.3);
  });

  it('las reseñas anteriores pesan: con 3 reseñas, una nueva mueve menos el promedio', () => {
    // (4.8 × 3 + 2) ÷ 4 = 4.1
    expect(calcularCalificacion(4.8, 3, [2])).toBe(4.1);
  });

  it('varias reseñas nuevas se suman todas', () => {
    // (4 × 1 + 5 + 5) ÷ 3 = 4.666… → 4.7
    expect(calcularCalificacion(4, 1, [5, 5])).toBe(4.7);
  });

  it('redondea a un decimal', () => {
    expect(calcularCalificacion(4.9, 1, [4])).toBe(4.5); // 4.45 → 4.5
    expect(Number.isInteger(calcularCalificacion(4.9, 2, [3]) * 10)).toBe(true);
  });
});
