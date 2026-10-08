import { MarketplaceData } from '../models/marketplace-data.model';
import { FILTROS_VACIOS } from '../models/search-filters.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';
import { AccommodationService } from './accommodation.service';
import { ReviewService } from './review.service';

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
  const repositorio = new RepositorioFalso();
  const resenas = new ReviewService(repositorio);
  const servicio = new AccommodationService(repositorio, resenas);

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

  describe('calificación con reseñas nuevas', () => {
    // Cada prueba usa servicios nuevos para no arrastrar reseñas de otra prueba.
    const crearServicios = () => {
      const repo = new RepositorioFalso();
      const reseñas = new ReviewService(repo);
      return { reseñas, accommodations: new AccommodationService(repo, reseñas) };
    };

    it('sin reseñas nuevas conserva la calificación del JSON', async () => {
      const { accommodations } = crearServicios();
      expect((await accommodations.getById(1))?.calificacion).toBe(4.8);
    });

    it('una reseña nueva cambia la calificación del alojamiento', async () => {
      const { reseñas, accommodations } = crearServicios();
      await reseñas.agregar(1, 'Juan', 3, 'Regular');
      // El alojamiento no tenía reseñas en el JSON de la prueba: (4.8 × 1 + 3) ÷ 2 = 3.9
      expect((await accommodations.getById(1))?.calificacion).toBe(3.9);
    });

    it('solo cambia el alojamiento reseñado; los demás conservan su calificación', async () => {
      const { reseñas, accommodations } = crearServicios();
      await reseñas.agregar(1, 'Juan', 1, 'Malo');
      expect((await accommodations.getById(2))?.calificacion).toBe(4.9);
      expect((await accommodations.getById(3))?.calificacion).toBe(4.6);
    });

    it('el listado se reordena según la nueva calificación', async () => {
      const { reseñas, accommodations } = crearServicios();
      // Antes: 2 (4.9), 1 (4.8), 3 (4.6). Una reseña de 1 estrella baja al alojamiento 2.
      await reseñas.agregar(2, 'Juan', 1, 'Muy malo');
      const orden = await accommodations.search(FILTROS_VACIOS, 'mejor-valorados');
      expect(orden.map((a) => a.id)).toEqual([1, 3, 2]);
    });

    it('no modifica los datos originales ni muestra alojamientos inactivos', async () => {
      const { reseñas, accommodations } = crearServicios();
      await reseñas.agregar(1, 'Juan', 1, 'Malo');
      expect(datos.alojamientos[0].calificacion).toBe(4.8);
      expect((await accommodations.getActive()).map((a) => a.id)).toEqual([1, 2, 3]);
    });
  });
});
