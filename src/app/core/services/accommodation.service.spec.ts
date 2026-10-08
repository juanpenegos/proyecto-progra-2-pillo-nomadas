import { MarketplaceData } from '../models/marketplace-data.model';
import { FILTROS_VACIOS } from '../models/search-filters.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';
import { AccommodationService } from './accommodation.service';

const crear = (id: number, ciudad: string, tipo: 'Apartamento' | 'Casa', capacidad: number, precio: number, calificacion: number, activo = true) => ({
  id, nombre: `Alojamiento ${id}`, descripcion: '', ciudad, ubicacion: ciudad, tipo, capacidad,
  habitaciones: 1, camas: 1, banos: 1, precioNoche: precio, tarifaLimpieza: 10000, calificacion, activo,
  imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
});

const datos: MarketplaceData = {
  alojamientos: [
    crear(1, 'Bogotá', 'Apartamento', 2, 180000, 4.8),
    crear(2, 'Cartagena', 'Apartamento', 5, 420000, 4.9),
    crear(3, 'Medellín', 'Casa', 8, 520000, 4.6),
    crear(4, 'Armenia', 'Casa', 10, 650000, 4.4, false),
  ],
  resenas: [],
};

class RepositorioFalso extends AccommodationRepository {
  getData(): Promise<MarketplaceData> {
    return Promise.resolve(datos);
  }
}

describe('AccommodationService', () => {
  const servicio = new AccommodationService(new RepositorioFalso());

  it('nunca devuelve alojamientos inactivos', async () => {
    const activos = await servicio.getActive();
    expect(activos.map((a) => a.id)).toEqual([1, 2, 3]);
  });

  it('getById devuelve undefined para un alojamiento inactivo o inexistente', async () => {
    expect(await servicio.getById(4)).toBeUndefined();
    expect(await servicio.getById(99)).toBeUndefined();
    expect((await servicio.getById(2))?.nombre).toBe('Alojamiento 2');
  });

  it('filtra por ciudad', async () => {
    const r = await servicio.search({ ...FILTROS_VACIOS, ciudad: 'Bogotá' });
    expect(r.map((a) => a.id)).toEqual([1]);
  });

  it('filtra por tipo', async () => {
    const r = await servicio.search({ ...FILTROS_VACIOS, tipo: 'Casa' });
    expect(r.map((a) => a.id)).toEqual([3]);
  });

  it('filtra por huéspedes: solo alojamientos con capacidad suficiente', async () => {
    const r = await servicio.search({ ...FILTROS_VACIOS, huespedes: 4 });
    expect(r.map((a) => a.id).sort()).toEqual([2, 3]);
  });

  it('filtra por precio máximo', async () => {
    const r = await servicio.search({ ...FILTROS_VACIOS, precioMax: 420000 });
    expect(r.map((a) => a.id).sort()).toEqual([1, 2]);
  });

  it('combina varios filtros y devuelve vacío si nada coincide', async () => {
    const r = await servicio.search({ ciudad: 'Bogotá', huespedes: 4, tipo: '', precioMax: null });
    expect(r).toEqual([]);
  });

  it('con filtros vacíos devuelve todos los activos', async () => {
    const r = await servicio.search(FILTROS_VACIOS);
    expect(r.length).toBe(3);
  });

  it('ordena por mejor valorados por defecto', async () => {
    const r = await servicio.search(FILTROS_VACIOS);
    expect(r.map((a) => a.id)).toEqual([2, 1, 3]);
  });

  it('ordena por menor y mayor precio sin alterar los datos originales', async () => {
    const menor = await servicio.search(FILTROS_VACIOS, 'menor-precio');
    const mayor = await servicio.search(FILTROS_VACIOS, 'mayor-precio');
    expect(menor.map((a) => a.id)).toEqual([1, 2, 3]);
    expect(mayor.map((a) => a.id)).toEqual([3, 2, 1]);
    expect(datos.alojamientos.map((a) => a.id)).toEqual([1, 2, 3, 4]);
  });

  it('lista ciudades y tipos solo de alojamientos activos', async () => {
    expect(await servicio.getCities()).toEqual(['Bogotá', 'Cartagena', 'Medellín']);
    expect(await servicio.getTypes()).toEqual(['Apartamento', 'Casa']);
  });
});
