const formatoPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 350000 → "$ 350.000" */
export const formatearPesos = (valor: number): string => formatoPesos.format(valor);
