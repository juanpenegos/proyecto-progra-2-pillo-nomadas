import { Component, Input } from '@angular/core';
import { Quote } from '../../../core/models/quote.model';
import { formatearPesos } from '../../../core/utils/formato';

/** Desglose de la cotización. Componente "tonto": solo muestra la cotización recibida. */
@Component({
  selector: 'app-quote-summary',
  templateUrl: './quote-summary.html',
  styleUrl: './quote-summary.css',
})
export class QuoteSummary {
  @Input({ required: true }) cotizacion!: Quote;

  protected pesos(valor: number): string {
    return formatearPesos(valor);
  }

  protected get nochesTexto(): string {
    const n = this.cotizacion.noches;
    return n === 1 ? '1 noche' : `${n} noches`;
  }
}
