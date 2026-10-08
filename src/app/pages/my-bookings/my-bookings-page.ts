import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { BookingCard } from '../../shared/components/booking-card/booking-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageBanner } from '../../shared/components/page-banner/page-banner';

/** Página "inteligente": lee las reservas del servicio y se las pasa a las tarjetas. */
@Component({
  selector: 'app-my-bookings-page',
  imports: [RouterLink, BookingCard, EmptyState, PageBanner],
  templateUrl: './my-bookings-page.html',
  styleUrl: './my-bookings-page.css',
})
export class MyBookingsPage {
  protected readonly reservas;

  protected readonly resumen;

  constructor(
    reservaService: BookingService,
    private readonly router: Router,
  ) {
    this.reservas = reservaService.reservas;
    this.resumen = computed(() => {
      const n = this.reservas().length;
      if (n === 0) {
        return 'Aún no tienes reservas registradas';
      }
      return n === 1 ? '1 reserva registrada' : `${n} reservas registradas`;
    });
  }

  protected irAExplorar(): void {
    void this.router.navigate(['/explorar']);
  }
}
