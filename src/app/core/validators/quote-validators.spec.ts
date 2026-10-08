import { correoValido, nombreValido, validarFechas, validarHuespedes, validarPrecio } from './quote-validators';

const HOY = '2026-10-07'; // "hoy" fijo: las pruebas no dependen del día real

describe('validarFechas', () => {
  it('acepta llegada de hoy y salida posterior', () => {
    expect(validarFechas('2026-10-07', '2026-10-09', HOY)).toEqual({});
  });

  it('pide ambas fechas cuando están vacías', () => {
    expect(validarFechas('', '', HOY)).toEqual({
      llegada: 'Selecciona la fecha de llegada',
      salida: 'Selecciona la fecha de salida',
    });
  });

  it('rechaza una llegada anterior a hoy', () => {
    expect(validarFechas('2026-10-06', '2026-10-09', HOY).llegada).toContain('anterior a hoy');
  });

  it('rechaza una salida igual o anterior a la llegada', () => {
    expect(validarFechas('2026-10-10', '2026-10-10', HOY).salida).toContain('posterior');
    expect(validarFechas('2026-10-10', '2026-10-08', HOY).salida).toContain('posterior');
  });

  it('no compara la salida con la llegada si la llegada falta', () => {
    expect(validarFechas('', '2026-10-09', HOY)).toEqual({ llegada: 'Selecciona la fecha de llegada' });
  });
});

describe('validarHuespedes', () => {
  it('acepta entre 1 y la capacidad', () => {
    expect(validarHuespedes(1, 6)).toBeUndefined();
    expect(validarHuespedes(6, 6)).toBeUndefined();
  });

  it('rechaza cero, negativos y decimales', () => {
    expect(validarHuespedes(0, 6)).toBeDefined();
    expect(validarHuespedes(-1, 6)).toBeDefined();
    expect(validarHuespedes(1.5, 6)).toBeDefined();
  });

  it('rechaza más huéspedes que la capacidad', () => {
    expect(validarHuespedes(7, 6)).toContain('máximo 6');
  });
});

describe('validarPrecio', () => {
  it('exige un precio mayor que cero', () => {
    expect(validarPrecio(180000)).toBeUndefined();
    expect(validarPrecio(0)).toBeDefined();
    expect(validarPrecio(-5)).toBeDefined();
  });
});

describe('nombre y correo', () => {
  it('valida el nombre ignorando espacios', () => {
    expect(nombreValido('Ana Pérez')).toBe(true);
    expect(nombreValido('   ')).toBe(false);
    expect(nombreValido('A')).toBe(false);
  });

  it('valida el formato del correo', () => {
    expect(correoValido('ana@correo.com')).toBe(true);
    expect(correoValido(' ana@correo.com ')).toBe(true);
    expect(correoValido('ana@correo')).toBe(false);
    expect(correoValido('ana correo.com')).toBe(false);
    expect(correoValido('')).toBe(false);
  });
});
