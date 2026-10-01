import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ErrorModal } from '../components/error-modal/error-modal';
import { PixReceiptComponent } from '../pix-receipt/pix-receipt';
import { AgendamentoPixService } from '../agendamento/agendamento-pix.service';
import { AgendamentoPix, MotivoRecusa } from '../agendamento/agendamento-pix';

/** Texto exibido quando uma regra do agendamento impede a confirmação. */
const MENSAGENS: Record<MotivoRecusa, { titulo: string; mensagem: string }> = {
  contato_obrigatorio: {
    titulo: 'Contato obrigatório',
    mensagem: 'Escolha o contato que vai receber o Pix.',
  },
  valor_invalido: {
    titulo: 'Valor inválido',
    mensagem: 'Informe um valor maior que zero.',
  },
  data_obrigatoria: {
    titulo: 'Data obrigatória',
    mensagem: 'Selecione a data do agendamento.',
  },
  data_hoje: {
    titulo: 'Não é possível agendar para hoje',
    mensagem: 'Se a transferência for para hoje, ela é um Pix normal, não um agendamento.',
  },
  data_passada: {
    titulo: 'Data inválida',
    mensagem: 'Escolha uma data futura para o agendamento.',
  },
  limite_diario: {
    titulo: 'Limite diário',
    mensagem: 'A soma dos Pix agendados nesse dia não pode passar de R$ 5.000,00.',
  },
};

@Component({
  selector: 'app-pix-transfer',
  standalone: true,
  imports: [FormsModule, ErrorModal, PixReceiptComponent, CurrencyPipe, DatePipe],
  templateUrl: './pix-transfer.html',
  styleUrl: './pix-transfer.css',
})
export class PixTransfer {
  private readonly agendamentos = inject(AgendamentoPixService);

  readonly contatos = this.agendamentos.contatos;
  readonly ativos = this.agendamentos.ativos;

  contatoId = signal('');
  transferAmount = signal<number | null>(null);
  schedulingDate = signal('');

  showErrorModal = signal(false);
  erroAtual = signal<{ titulo: string; mensagem: string } | null>(null);
  comprovante = signal<AgendamentoPix | null>(null);

  /**
   * Converte o valor do campo para número antes de validar o limite.
   */
  definirValor(valor: number | string | null): void {
    if (valor == null || valor === '') {
      this.transferAmount.set(null);
      return;
    }

    this.transferAmount.set(Number(valor));
  }

  /**
   * Confirma o agendamento ou abre o aviso da regra que falhou.
   */
  onSubmit(): void {
    const resultado = this.agendamentos.agendar({
      contatoId: this.contatoId(),
      valor: this.transferAmount(),
      data: this.schedulingDate(),
    });

    if (!resultado.ok) {
      this.erroAtual.set(MENSAGENS[resultado.motivo]);
      this.showErrorModal.set(true);
      return;
    }

    this.comprovante.set(resultado.agendamento);
    this.contatoId.set('');
    this.transferAmount.set(null);
    this.schedulingDate.set('');
  }

  /**
   * Cancela o agendamento exibido no comprovante e volta ao formulário.
   */
  cancelarComprovante(): void {
    const atual = this.comprovante();
    if (!atual) {
      return;
    }

    this.agendamentos.cancelar(atual.id);
    this.comprovante.set(null);
  }

  /**
   * Cancela um agendamento da lista pelo identificador.
   */
  cancelarAgendamento(id: string): void {
    this.agendamentos.cancelar(id);
    if (this.comprovante()?.id === id) {
      this.comprovante.set(null);
    }
  }

  /**
   * Fecha o comprovante e libera um novo agendamento.
   */
  novoAgendamento(): void {
    this.comprovante.set(null);
  }

  /**
   * Fecha o aviso de regra recusada.
   */
  fecharErro(): void {
    this.showErrorModal.set(false);
  }
}
