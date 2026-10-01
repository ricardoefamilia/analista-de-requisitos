import { TestBed } from '@angular/core/testing';
import { AgendamentoPixService } from './agendamento-pix.service';

describe('AgendamentoPixService', () => {
  let service: AgendamentoPixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgendamentoPixService);
  });

  it('cria o agendamento e permite cancelar depois', () => {
    const resultado = service.agendar(
      { contatoId: 'ana', valor: 250, data: '2026-10-10' },
      '2026-10-01',
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) {
      return;
    }

    expect(service.ativos().length).toBe(1);
    expect(service.cancelar(resultado.agendamento.id)).toBe(true);
    expect(service.ativos().length).toBe(0);
  });

  it('não cria agendamento para o dia de hoje', () => {
    const resultado = service.agendar(
      { contatoId: 'ana', valor: 10, data: '2026-10-01' },
      '2026-10-01',
    );

    expect(resultado).toEqual({ ok: false, motivo: 'data_hoje' });
    expect(service.ativos().length).toBe(0);
  });

  it('não cancela um agendamento que já foi cancelado', () => {
    const resultado = service.agendar(
      { contatoId: 'bruno', valor: 80, data: '2026-11-01' },
      '2026-10-01',
    );

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) {
      return;
    }

    expect(service.cancelar(resultado.agendamento.id)).toBe(true);
    expect(service.cancelar(resultado.agendamento.id)).toBe(false);
  });
});
