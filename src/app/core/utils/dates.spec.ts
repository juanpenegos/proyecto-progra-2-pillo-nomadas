import { diasEntre, esFechaValida, fechaRelativa, formatearFecha, hoyISO } from './dates';

describe('dates', () => {
  it('hoyISO usa la fecha local con ceros a la izquierda', () => {
    expect(hoyISO(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(hoyISO(new Date(2026, 9, 7))).toBe('2026-10-07');
  });

  it('esFechaValida rechaza textos vacíos y fechas imposibles', () => {
    expect(esFechaValida('2026-10-07')).toBe(true);
    expect(esFechaValida('')).toBe(false);
    expect(esFechaValida('2026-02-30')).toBe(false);
    expect(esFechaValida('07/10/2026')).toBe(false);
  });

  it('diasEntre cuenta noches, incluso cruzando meses y años', () => {
    expect(diasEntre('2026-10-01', '2026-10-14')).toBe(13);
    expect(diasEntre('2026-12-30', '2027-01-02')).toBe(3);
    expect(diasEntre('2026-10-05', '2026-10-05')).toBe(0);
    expect(diasEntre('2026-10-05', '2026-10-01')).toBe(-4);
  });

  it('diasEntre no se afecta por el cambio de hora', () => {
    // 2026-03-08 es el cambio de hora en EE. UU.; en UTC siempre son días de 24 h.
    expect(diasEntre('2026-03-07', '2026-03-09')).toBe(2);
  });

  it('diasEntre devuelve NaN con fechas inválidas', () => {
    expect(diasEntre('', '2026-10-01')).toBeNaN();
  });

  it('fechaRelativa expresa la antigüedad en lenguaje natural', () => {
    const hoy = '2026-10-07';
    expect(fechaRelativa('2026-10-07', hoy)).toBe('Hoy');
    expect(fechaRelativa('2026-10-06', hoy)).toBe('Hace 1 día');
    expect(fechaRelativa('2026-10-02', hoy)).toBe('Hace 5 días');
    expect(fechaRelativa('2026-09-23', hoy)).toBe('Hace 2 semanas');
    expect(fechaRelativa('2026-09-02', hoy)).toBe('Hace 1 mes');
    expect(fechaRelativa('2026-06-01', hoy)).toBe('Hace 4 meses');
    expect(fechaRelativa('2025-01-01', hoy)).toBe('Hace 1 año');
  });

  it('fechaRelativa devuelve vacío para fechas futuras o inválidas', () => {
    expect(fechaRelativa('2026-12-01', '2026-10-07')).toBe('');
    expect(fechaRelativa('xx', '2026-10-07')).toBe('');
  });

  it('formatearFecha escribe la fecha en español', () => {
    expect(formatearFecha('2026-10-01')).toBe('1 de octubre de 2026');
    expect(formatearFecha('2026-12-25')).toBe('25 de diciembre de 2026');
  });
});
