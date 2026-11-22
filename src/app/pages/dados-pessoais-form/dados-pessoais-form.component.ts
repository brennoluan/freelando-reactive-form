import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators, ValidationErrors, AbstractControlOptions } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { CadastroService } from '../../shared/services/cadastro.service';
import { Estado, Cidade, IbgeService } from '../../shared/services/ibge.service';
import { BehaviorSubject, Observable, startWith, switchMap, tap, of } from 'rxjs';
import { cpfValidator } from '../../shared/validators/cpf.validator';
import { emailExistenteValidator } from '../../shared/services/emailExistente.validator';
import { EmailValidatorService } from '../../shared/services/email-validator.service';

export const senhasIguaisValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const senha = control.get('senha')?.value;
  const confirmarSenha = control.get('confirmarSenha')?.value;
  return senha && confirmarSenha && senha !== confirmarSenha ? { senhasNaoIguais: true } : null;
};

@Component({
  selector: 'app-dados-pessoais-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './dados-pessoais-form.component.html',
  styleUrls: ['./dados-pessoais-form.component.scss']
})
export class DadosPessoaisFormComponent implements OnInit {

  dadosPessoaisForm!: FormGroup;

  estado$!: Observable<Estado[]>;
  cidades$!: Observable<Cidade[]>;

  carregandoCidades$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private cadastroService: CadastroService,
    private ibgeService: IbgeService,
    private emailService: EmailValidatorService
  ) {}

  ngOnInit(): void {
    const formOptions: AbstractControlOptions = {
      validators: senhasIguaisValidator
    };

    this.dadosPessoaisForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      cpf: ['', [Validators.required, cpfValidator]],
      estado: ['', Validators.required],
      cidade: [{ value: '', disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email], [emailExistenteValidator(this.emailService)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, formOptions);

    this.carregarEstados();
    this.carregarListernerEstado();

  }

  onAnterior(): void {
    this.salvarDadosAtuais();
    this.router.navigate(['/cadastro/area-atuacao']);
  }

  onProximo(): void {
    if(this.dadosPessoaisForm.valid && !this.carregandoCidades$.value) {
      this.salvarDadosAtuais();
      this.router.navigate(['/cadastro/confirmacao']);
    } else {
      this.dadosPessoaisForm.markAllAsTouched();
    }
  }

  private carregarEstados(): void {
    this.estado$ = this.ibgeService.getEstados();
  }

  private carregarListernerEstado(): void {
    const estadoControl = this.dadosPessoaisForm.get('estado');
    if(estadoControl) {
      this.cidades$ = estadoControl.valueChanges.pipe(
        startWith(''),
        tap(() => {
          this.resetarCidade();
          this.carregandoCidades$.next(true);
        }),
        switchMap(estado => {
          if(estado) {
            return this.ibgeService.getCidadesPorEstado(estado).pipe(
              tap(() => {
                this.dadosPessoaisForm.get('cidade')?.enable();
                this.carregandoCidades$.next(false);
              })
            );
          }
          this.carregandoCidades$.next(false);
          return of([]);
        })
      )
    }
  }

  private salvarDadosAtuais() {
    const formValue = this.dadosPessoaisForm.value;
    this.cadastroService.updateCadastroData({
      nomeCompleto: formValue.nomeCompleto,
      estado: formValue.estado,
      cidade: formValue.cidade,
      email: formValue.email,
      senha: formValue.senha
    });
  }

  private resetarCidade(): void {
    const cidadeControl = this.dadosPessoaisForm.get('cidade');
    cidadeControl?.disable();
    cidadeControl?.setValue('');
  }
}
