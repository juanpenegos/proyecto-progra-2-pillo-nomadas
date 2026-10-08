import { MarketplaceData } from '../models/marketplace-data.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';
import { hoyISO } from '../utils/dates';
import { ReviewService } from './review.service';

const datos: MarketplaceData = {
  alojamientos: [],
  resenas: [
    { id: 1, alojamientoId: 1, usuario: 'Ana', calificacion: 5, comentario: 'a', fecha: '2026-09-01' },
    { id: 2, alojamientoId: 2, usuario: 'Luis', calificacion: 4, comentario: 'b', fecha: '2026-09-10' },
    { id: 3, alojamientoId: 1, usuario: 'Eva', calificacion: 3, comentario: 'c', fecha: '2026-09-20' },
  ],
};

class RepositorioFalso extends AccommodationRepository {
  getData(): Promise<MarketplaceData> {
    return Promise.resolve(datos);
  }
}

describe('ReviewService', () => {
  const crear = () => new ReviewService(new RepositorioFalso());

  it('devuelve todas las reseñas', async () => {
    expect((await crear().getAll()).length).toBe(3);
  });

  it('devuelve las reseñas de un alojamiento con la más reciente primero', async () => {
    const r = await crear().getByAccommodation(1);
    expect(r.map((x) => x.id)).toEqual([3, 1]);
  });

  it('devuelve una lista vacía si el alojamiento no tiene reseñas', async () => {
    expect(await crear().getByAccommodation(99)).toEqual([]);
  });

  describe('agregar', () => {
    it('guarda la reseña con id nuevo, la fecha de hoy y datos sin espacios sobrantes', async () => {
      const servicio = crear();
      const r = await servicio.agregar(2, ' Juan Penagos ', 4, '  Muy buena estadía  ');
      expect(r).toEqual({
        id: 4, alojamientoId: 2, usuario: 'Juan Penagos', calificacion: 4,
        comentario: 'Muy buena estadía', fecha: hoyISO(),
      });
    });

    it('la reseña nueva aparece al inicio de la lista de ese alojamiento', async () => {
      const servicio = crear();
      const nueva = await servicio.agregar(1, 'Juan', 5, 'Excelente');
      const lista = await servicio.getByAccommodation(1);
      expect(lista[0].id).toBe(nueva.id);
      expect(lista.length).toBe(3);
    });

    it('con dos reseñas el mismo día, la última escrita va primero', async () => {
      const servicio = crear();
      const a = await servicio.agregar(2, 'Juan', 5, 'Primera');
      const b = await servicio.agregar(2, 'Juan', 4, 'Segunda');
      expect((await servicio.getByAccommodation(2)).map((r) => r.id)).toEqual([b.id, a.id, 2]);
    });

    it('los ids no se repiten', async () => {
      const servicio = crear();
      const a = await servicio.agregar(1, 'Juan', 5, 'Uno');
      const b = await servicio.agregar(1, 'Juan', 5, 'Dos');
      expect(new Set([a.id, b.id, 1, 2, 3]).size).toBe(5);
    });

    it('usa "Visitante" cuando no hay nombre', async () => {
      const r = await crear().agregar(1, '   ', 5, 'Bien');
      expect(r.usuario).toBe('Visitante');
    });

    it('rechaza calificaciones fuera de 1 a 5 o con decimales', async () => {
      const servicio = crear();
      await expect(servicio.agregar(1, 'Juan', 0, 'x')).rejects.toThrow();
      await expect(servicio.agregar(1, 'Juan', 6, 'x')).rejects.toThrow();
      await expect(servicio.agregar(1, 'Juan', 3.5, 'x')).rejects.toThrow();
    });

    it('rechaza un comentario vacío o solo con espacios', async () => {
      const servicio = crear();
      await expect(servicio.agregar(1, 'Juan', 5, '')).rejects.toThrow();
      await expect(servicio.agregar(1, 'Juan', 5, '   ')).rejects.toThrow();
      expect((await servicio.getAll()).length).toBe(3);
    });
  });
});
