import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Booking } from '../../core/models/booking.model';
import { BookingService } from '../../core/services/booking.service';
import { formatearFecha } from '../../core/utils/dates';
import { formatearPesos } from '../../core/utils/formato';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

/** Confirmación de una reserva recién hecha. Si la reserva no existe (por ejemplo, tras recargar), lo informa. */
@Component({
  selector: 'app-confirmation-page',
  imports: [RouterLink, EmptyState],
  templateUrl: './confirmation-page.html',
  styleUrl: './confirmation-page.css',
})
export class ConfirmationPage implements OnInit {
  protected readonly reserva = signal<Booking | undefined>(undefined);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly reservaService: BookingService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.reserva.set(this.reservaService.obtener(params.get('id') ?? ''));
    });
  }

  protected pesos(valor: number): string {
    return formatearPesos(valor);
  }

  protected fecha(valor: string): string {
    return formatearFecha(valor);
  }

  protected irAExplorar(): void {
    void this.router.navigate(['/explorar']);
  }
}
