import { LIMITE_DIARIO_REAIS, somarAgendadoNoDia, validarAgendamento } from './agendamento-pix';
import type { AgendamentoPix } from './agendamento-pix';

const hoje = '2026-10-01';

/**
 * Monta um agendamento mínimo para os testes de regra.
 */
function agendamento(parcial: Partial<AgendamentoPix> = {}): AgendamentoPix {
  return {
    id: '1',
    contatoId: 'ana',
    nomeContato: 'Ana Souza',
    chave: 'ana.souza@email.com',
    valor: 100,
    data: '2026-10-02',
    cancelado: false,
    ...parcial,
  };
}

describe('validarAgendamento', () => {
  const pedidoValido = { contatoId: 'ana', valor: 100, data: '2026-10-02' };

  it('aceita um Pix para uma data futura dentro do limite', () => {
    expect(validarAgendamento(pedidoValido, [], hoje)).toBeNull();
  });

  it('recusa agendamento sem contato', () => {
    expect(validarAgendamento({ ...pedidoValido, contatoId: '' }, [], hoje)).toBe(
      'contato_obrigatorio',
    );
  });

  it('recusa valor vazio ou menor ou igual a zero', () => {
    expect(validarAgendamento({ ...pedidoValido, valor: null }, [], hoje)).toBe('valor_invalido');
    expect(validarAgendamento({ ...pedidoValido, valor: 0 }, [], hoje)).toBe('valor_invalido');
  });

  it('recusa o mesmo dia porque hoje é Pix normal', () => {
    expect(validarAgendamento({ ...pedidoValido, data: hoje }, [], hoje)).toBe('data_hoje');
  });

  it('recusa data que já passou', () => {
    expect(validarAgendamento({ ...pedidoValido, data: '2026-09-30' }, [], hoje)).toBe(
      'data_passada',
    );
  });

  it('recusa quando a soma do dia passa de R$ 5.000', () => {
    const existentes = [agendamento({ valor: 4000, data: '2026-10-02' })];

    expect(validarAgendamento({ ...pedidoValido, valor: 1000.01, data: '2026-10-02' }, existentes, hoje)).toBe(
      'limite_diario',
    );
  });

  it('aceita o valor que completa exatamente o limite diário', () => {
    const existentes = [agendamento({ valor: 2000, data: '2026-10-02' })];

    expect(validarAgendamento({ ...pedidoValido, valor: 3000, data: '2026-10-02' }, existentes, hoje)).toBeNull();
    expect(LIMITE_DIARIO_REAIS).toBe(5000);
  });

  it('ignora agendamento cancelado na soma do dia', () => {
    const existentes = [agendamento({ valor: 5000, data: '2026-10-02', cancelado: true })];

    expect(somarAgendadoNoDia(existentes, '2026-10-02')).toBe(0);
    expect(validarAgendamento({ ...pedidoValido, valor: 5000 }, existentes, hoje)).toBeNull();
  });
});
