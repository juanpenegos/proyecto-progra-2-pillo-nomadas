import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accommodation } from '../../../core/models/accommodation.model';
import { formatearPesos } from '../../../core/utils/formato';
import { ImageWithFallback } from '../image-with-fallback/image-with-fallback';

const MAX_SERVICIOS_VISIBLES = 3;

/** Componente "tonto": solo muestra el alojamiento que recibe. Toda la tarjeta lleva al detalle. */
@Component({
  selector: 'app-accommodation-card',
  imports: [DecimalPipe, RouterLink, ImageWithFallback],
  templateUrl: './accommodation-card.html',
  styleUrl: './accommodation-card.css',
})
export class AccommodationCard {
  @Input({ required: true }) alojamiento!: Accommodation;

  protected get serviciosVisibles(): string[] {
    return this.alojamiento.servicios.slice(0, MAX_SERVICIOS_VISIBLES);
  }

  protected get serviciosOcultos(): number {
    return Math.max(0, this.alojamiento.servicios.length - MAX_SERVICIOS_VISIBLES);
  }

  protected get precio(): string {
    return formatearPesos(this.alojamiento.precioNoche);
  }

  protected get banos(): string {
    const n = this.alojamiento.banos;
    return n === 1 ? '1 baño' : `${n} baños`;
  }
}
