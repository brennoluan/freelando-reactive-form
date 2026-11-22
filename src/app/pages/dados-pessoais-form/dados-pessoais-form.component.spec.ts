import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { DadosPessoaisFormComponent } from './dados-pessoais-form.component';
import { EmailValidatorService } from '../../shared/services/email-validator.service';
import { Cidade, IbgeService } from '../../shared/services/ibge.service';

describe('DadosPessoaisFormComponent', () => {
  let component: DadosPessoaisFormComponent;
  let fixture: ComponentFixture<DadosPessoaisFormComponent>;
  let cidades: Subject<Cidade[]>;

  beforeEach(async () => {
    cidades = new Subject<Cidade[]>();
    await TestBed.configureTestingModule({
      imports: [DadosPessoaisFormComponent],
      providers: [
        provideRouter([]),
        { provide: IbgeService, useValue: {
          getEstados: () => of([]),
          getCidadesPorEstado: () => cidades.asObservable()
        } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DadosPessoaisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes city as disabled before rendering', () => {
    const newFixture = TestBed.createComponent(DadosPessoaisFormComponent);
    newFixture.componentInstance.ngOnInit();

    expect(newFixture.componentInstance.dadosPessoaisForm.get('cidade')!.disabled).toBeTrue();
  });

  it('disables city until cities are loaded and resets it when state changes', () => {
    const estado = component.dadosPessoaisForm.get('estado')!;
    const cidade = component.dadosPessoaisForm.get('cidade')!;
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#cidade');

    expect(cidade.disabled).toBeTrue();
    expect(select.disabled).toBeTrue();
    estado.setValue('1');
    expect(cidade.disabled).toBeTrue();
    expect(component.carregandoCidades$.value).toBeTrue();
    fixture.detectChanges();
    expect(select.disabled).toBeTrue();
    cidades.next([{ id: 1, nome: 'Cidade' }]);
    fixture.detectChanges();
    expect(cidade.enabled).toBeTrue();
    expect(select.disabled).toBeFalse();
    expect(cidade.hasError('required')).toBeTrue();
    cidade.setValue('Cidade');
    estado.setValue('2');
    expect(cidade.disabled).toBeTrue();
    expect(cidade.value).toBe('');
    fixture.detectChanges();
    expect(select.disabled).toBeTrue();
    estado.setValue('');
    fixture.detectChanges();
    expect(cidade.disabled).toBeTrue();
    expect(select.disabled).toBeTrue();
    expect(component.carregandoCidades$.value).toBeFalse();
  });

  it('does not advance while cities are loading', fakeAsync(() => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    component.dadosPessoaisForm.patchValue({
      nomeCompleto: 'Pessoa',
      cpf: '52998224725',
      estado: '1',
      email: 'disponivel@exemplo.com',
      senha: '123456',
      confirmarSenha: '123456'
    });
    tick(1500);

    component.onProximo();
    expect(navigate).not.toHaveBeenCalled();

    cidades.next([{ id: 1, nome: 'Cidade' }]);
    component.dadosPessoaisForm.get('cidade')!.setValue('Cidade');
    component.onProximo();
    expect(navigate).toHaveBeenCalledWith(['/cadastro/confirmacao']);
  }));

  it('validates required and invalid emails without checking availability', () => {
    const emailService = TestBed.inject(EmailValidatorService);
    const checkEmail = spyOn(emailService, 'verificarEmailExistente').and.callThrough();
    const email = component.dadosPessoaisForm.get('email')!;

    expect(email.hasError('required')).toBeTrue();
    email.setValue('invalido');
    expect(email.hasError('email')).toBeTrue();
    expect(checkEmail).not.toHaveBeenCalled();
  });

  it('checks email availability asynchronously and displays the result', fakeAsync(() => {
    const email = component.dadosPessoaisForm.get('email')!;
    email.markAsTouched();
    email.setValue('teste@exemplo.com');
    fixture.detectChanges();

    expect(email.pending).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Verificando disponibilidade...');

    tick(1500);
    fixture.detectChanges();
    expect(email.hasError('emailExistente')).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('E-mail já está cadastrado.');
    expect(fixture.nativeElement.textContent).not.toContain('Verificando disponibilidade...');

    email.setValue('disponivel@exemplo.com');
    tick(1500);
    fixture.detectChanges();
    expect(email.valid).toBeTrue();
    expect(fixture.nativeElement.textContent).not.toContain('E-mail já está cadastrado.');
  }));
});
