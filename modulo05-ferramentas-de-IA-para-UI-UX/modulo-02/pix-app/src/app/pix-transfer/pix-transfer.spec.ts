import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixTransfer } from './pix-transfer';
import { AgendamentoPixService } from '../agendamento/agendamento-pix.service';
import { formatarDiaLocal } from '../agendamento/agendamento-pix';

describe('PixTransfer', () => {
  let component: PixTransfer;
  let fixture: ComponentFixture<PixTransfer>;
  let service: AgendamentoPixService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(PixTransfer);
    component = fixture.componentInstance;
    service = TestBed.inject(AgendamentoPixService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra o comprovante quando o agendamento é aceito', () => {
    component.contatoId.set('ana');
    component.transferAmount.set(150);
    component.schedulingDate.set('2099-06-15');

    component.onSubmit();

    expect(component.comprovante()?.nomeContato).toBe('Ana Souza');
    expect(component.showErrorModal()).toBe(false);
    expect(service.ativos().length).toBe(1);
  });

  it('avisa que o mesmo dia é Pix normal e não cria agendamento', () => {
    component.contatoId.set('ana');
    component.transferAmount.set(150);
    component.schedulingDate.set(formatarDiaLocal(new Date()));

    component.onSubmit();

    expect(component.showErrorModal()).toBe(true);
    expect(component.erroAtual()?.titulo).toBe('Não é possível agendar para hoje');
    expect(service.ativos().length).toBe(0);
  });
});
