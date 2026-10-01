import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-pix-receipt',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './pix-receipt.html',
  styleUrl: './pix-receipt.css'
})
export class PixReceiptComponent {
  nome = input.required<string>();
  valor = input.required<number>();
  dataAgendamento = input.required<string>();
  chave = input.required<string>();

  cancelar = output<void>();
  novoAgendamento = output<void>();

  /**
   * Exibe a data do agendamento no formato dd/MM/aaaa, sem deslocar o fuso.
   */
  formatarData(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    if (!ano || !mes || !dia) {
      return iso;
    }

    return `${dia}/${mes}/${ano}`;
  }
}
