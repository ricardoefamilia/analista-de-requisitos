import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixReceiptComponent } from './pix-receipt';

describe('PixReceiptComponent', () => {
  let component: PixReceiptComponent;
  let fixture: ComponentFixture<PixReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixReceiptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PixReceiptComponent);
    fixture.componentRef.setInput('nome', 'Ana Souza');
    fixture.componentRef.setInput('valor', 150);
    fixture.componentRef.setInput('dataAgendamento', '2026-12-20');
    fixture.componentRef.setInput('chave', 'ana.souza@email.com');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formata a data do agendamento sem mudar o dia', () => {
    expect(component.formatarData('2026-12-20')).toBe('20/12/2026');
  });
});
