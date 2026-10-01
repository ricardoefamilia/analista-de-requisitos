/** Limite diário de Pix agendado, em reais. */
export const LIMITE_DIARIO_REAIS = 5000;

/** Contato disponível para receber um Pix agendado. */
export interface ContatoPix {
  id: string;
  nome: string;
  chave: string;
}

/** Agendamento criado a partir do fluxo do briefing. */
export interface AgendamentoPix {
  id: string;
  contatoId: string;
  nomeContato: string;
  chave: string;
  valor: number;
  data: string;
  cancelado: boolean;
}

/** Motivo pelo qual um pedido de agendamento foi recusado. */
export type MotivoRecusa =
  | 'contato_obrigatorio'
  | 'valor_invalido'
  | 'data_obrigatoria'
  | 'data_hoje'
  | 'data_passada'
  | 'limite_diario';

/** Dados informados na tela antes da confirmação. */
export interface PedidoAgendamento {
  contatoId: string;
  valor: number | null;
  data: string;
}

/**
 * Converte uma data para o dia local no formato AAAA-MM-DD.
 */
export function formatarDiaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Soma o valor dos agendamentos ainda ativos em uma data.
 */
export function somarAgendadoNoDia(agendamentos: readonly AgendamentoPix[], data: string): number {
  return agendamentos
    .filter((item) => !item.cancelado && item.data === data)
    .reduce((total, item) => total + item.valor, 0);
}

/**
 * Avalia se o pedido respeita contato, valor, data futura e limite diário.
 */
export function validarAgendamento(
  pedido: PedidoAgendamento,
  agendamentos: readonly AgendamentoPix[],
  hoje: string,
): MotivoRecusa | null {
  if (!pedido.contatoId) {
    return 'contato_obrigatorio';
  }

  if (pedido.valor == null || Number.isNaN(pedido.valor) || pedido.valor <= 0) {
    return 'valor_invalido';
  }

  if (!pedido.data) {
    return 'data_obrigatoria';
  }

  if (pedido.data < hoje) {
    return 'data_passada';
  }

  if (pedido.data === hoje) {
    return 'data_hoje';
  }

  const ocupado = somarAgendadoNoDia(agendamentos, pedido.data);
  if (ocupado + pedido.valor > LIMITE_DIARIO_REAIS) {
    return 'limite_diario';
  }

  return null;
}
