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
import { FormConfig } from '../../shared/models/form-config.interface';
import { DynamicFormService } from '../../shared/services/dynamic-form.service';
import { DadosPessoaisFormConfig } from '../../config/dados-pessoais-form.config';
import { FormFieldBase } from '../../shared/models/form-field-base.interface';

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
  formConfig!: FormConfig;

  estado$!: Observable<Estado[]>;
  cidades$!: Observable<Cidade[]>;

  carregandoCidades$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private cadastroService: CadastroService,
    private ibgeService: IbgeService,
    private emailService: EmailValidatorService,
    private DynamicFormService: DynamicFormService
  ) {
    this.DynamicFormService.registerFormConfig('dadosPessoaisForm', DadosPessoaisFormConfig)
  }

  ngOnInit(): void {
    this.formConfig = this.DynamicFormService.getFormConfig('dadosPessoaisForm');

    this.dadosPessoaisForm = this.DynamicFormService.createFormGroup(this.formConfig, {validators: senhasIguaisValidator});
    this.dadosPessoaisForm.get('cidade')?.disable();

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

  isFieldType(field: FormFieldBase, type: string): boolean {
    return field.type === type;
  }

   hasField(name: string): boolean {  
    return this.formConfig.fields.some(field => field.formControlName === name);  
  }  
  
  getFieldByName(name: string): FormFieldBase {  
    return this.formConfig.fields.find(field => field.formControlName === name) || {} as FormFieldBase;  
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
