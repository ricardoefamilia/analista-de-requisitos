import { Injectable, computed, signal } from '@angular/core';
import {
  AgendamentoPix,
  ContatoPix,
  MotivoRecusa,
  PedidoAgendamento,
  formatarDiaLocal,
  validarAgendamento,
} from './agendamento-pix';

/**
 * Guarda contatos e agendamentos de Pix e aplica as regras do briefing.
 */
@Injectable({ providedIn: 'root' })
export class AgendamentoPixService {
  readonly contatos = signal<ContatoPix[]>([
    { id: 'ana', nome: 'Ana Souza', chave: 'ana.souza@email.com' },
    { id: 'bruno', nome: 'Bruno Lima', chave: '11988887777' },
    { id: 'carla', nome: 'Carla Dias', chave: 'carla.dias@email.com' },
  ]);

  private readonly itens = signal<AgendamentoPix[]>([]);

  /** Agendamentos já confirmados, inclusive os cancelados. */
  readonly agendamentos = this.itens.asReadonly();

  /** Agendamentos que ainda podem ser cancelados. */
  readonly ativos = computed(() => this.itens().filter((item) => !item.cancelado));

  /**
   * Registra um Pix agendado quando o pedido passa na validação.
   */
  agendar(
    pedido: PedidoAgendamento,
    hoje = formatarDiaLocal(new Date()),
  ): { ok: true; agendamento: AgendamentoPix } | { ok: false; motivo: MotivoRecusa } {
    const motivo = validarAgendamento(pedido, this.itens(), hoje);
    if (motivo) {
      return { ok: false, motivo };
    }

    const contato = this.contatos().find((item) => item.id === pedido.contatoId);
    if (!contato || pedido.valor == null) {
      return { ok: false, motivo: 'contato_obrigatorio' };
    }

    const agendamento: AgendamentoPix = {
      id: crypto.randomUUID(),
      contatoId: contato.id,
      nomeContato: contato.nome,
      chave: contato.chave,
      valor: pedido.valor,
      data: pedido.data,
      cancelado: false,
    };

    this.itens.update((lista) => [...lista, agendamento]);
    return { ok: true, agendamento };
  }

  /**
   * Cancela um agendamento ativo pelo identificador.
   */
  cancelar(id: string): boolean {
    const atual = this.itens().find((item) => item.id === id && !item.cancelado);
    if (!atual) {
      return false;
    }

    this.itens.update((lista) =>
      lista.map((item) => (item.id === id ? { ...item, cancelado: true } : item)),
    );
    return true;
  }
}
