import { formatearPesos } from './formato';

describe('formatearPesos', () => {
  it('usa pesos colombianos con separador de miles y sin decimales', () => {
    // El espacio que pone Intl es un espacio duro; se normaliza para comparar.
    expect(formatearPesos(350000).replace(/\s/g, ' ')).toBe('$ 350.000');
    expect(formatearPesos(1250500).replace(/\s/g, ' ')).toBe('$ 1.250.500');
  });
});
