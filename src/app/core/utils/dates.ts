const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Fecha local de hoy en formato AAAA-MM-DD (la que usa <input type="date">). */
export const hoyISO = (ahora: Date = new Date()): string => {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

/**
 * Convierte AAAA-MM-DD en milisegundos UTC. Se usa UTC para que el cambio de hora
 * o la zona horaria no alteren el conteo de días. Devuelve null si el texto no es una fecha real.
 */
const aMilisegundos = (fecha: string): number | null => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!partes) {
    return null;
  }
  const [, anio, mes, dia] = partes.map(Number);
  const ms = Date.UTC(anio, mes - 1, dia);
  const real = new Date(ms);
  const coincide = real.getUTCFullYear() === anio && real.getUTCMonth() === mes - 1 && real.getUTCDate() === dia;
  return coincide ? ms : null;
};

export const esFechaValida = (fecha: string): boolean => aMilisegundos(fecha) !== null;

/** Días entre dos fechas AAAA-MM-DD. Positivo si `hasta` es posterior a `desde`. */
export const diasEntre = (desde: string, hasta: string): number => {
  const a = aMilisegundos(desde);
  const b = aMilisegundos(hasta);
  if (a === null || b === null) {
    return Number.NaN;
  }
  return Math.round((b - a) / MS_POR_DIA);
};

/** "Hace 2 semanas", "Hace 1 mes"… calculado respecto a `hoy` (AAAA-MM-DD). */
export const fechaRelativa = (fecha: string, hoy: string = hoyISO()): string => {
  const dias = diasEntre(fecha, hoy);
  if (Number.isNaN(dias) || dias < 0) {
    return '';
  }
  if (dias === 0) {
    return 'Hoy';
  }
  if (dias < 7) {
    return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
  }
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
  }
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
  }
  const anios = Math.floor(dias / 365);
  return anios === 1 ? 'Hace 1 año' : `Hace ${anios} años`;
};

const formatoLargo = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-10-01" → "1 de octubre de 2026" */
export const formatearFecha = (fecha: string): string => {
  const ms = aMilisegundos(fecha);
  return ms === null ? '' : formatoLargo.format(new Date(ms));
};
