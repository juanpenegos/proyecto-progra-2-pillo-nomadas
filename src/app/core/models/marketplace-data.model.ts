import { Accommodation } from './accommodation.model';
import { Review } from './review.model';

/** Forma completa del archivo marketplace-data.json. */
export interface MarketplaceData {
  alojamientos: Accommodation[];
  resenas: Review[];
}
