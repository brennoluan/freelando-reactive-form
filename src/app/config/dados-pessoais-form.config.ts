import { FormConfig } from "../shared/models/form-config.interface";
import { Validators } from "@angular/forms";
import { cpfValidator } from "../shared/validators/cpf.validator";
import { emailExistenteValidator } from "../shared/services/emailExistente.validator";

export function DadosPessoaisFormConfig(emailService: any): FormConfig {
  return {
    title: 'Crie seu cadastro',
    description: 'Crie seu perfil gratuitamente para começar a trabalhar com os melhores demandas e sobre sua forma de trabalho.',
    fields: [
        {
        label: 'Nome completo',
        formControlName: 'nomeCompleto',
        type: 'text',
        required: true,
        errorMessages: {
          required: 'Nome completo é obrigatório'
        },
        validators: [
          Validators.required
        ],
        width: 'full'
      },
      {
        label: 'CPF',
        formControlName: 'CPF',
        type: 'text',
        required: true,
        errorMessages: {
          required: 'CPF obrigatório',
          custom: 'CPF inválido'
        },
        validators: [
          Validators.required,
          cpfValidator
        ],
        width: 'full'
      },
      {
        label: 'Estado',
        formControlName: 'estado',
        type: 'select',
        required: true,
        placeholder: 'Selecione',
        errorMessages: {
          required: 'Estado é obrigatório'
        },
        validators: [
          Validators.required
        ],
        width: 'half'
      },
      {
        label: 'Cidade',
        formControlName: 'cidade',
        type: 'select',
        required: true,
        errorMessages: {
          required: 'Cidade é obrigatória'
        },
        validators: [
          Validators.required
        ],
        width: 'half'
      },
      {
        label: 'Email',
        formControlName: 'email',
        type: 'email',
        required: true,
        errorMessages: {
          required: 'Email é obrigatório',
          email: 'Email inválido',
          async: 'Email já cadastrado'
        },
        validators: [
          Validators.required,
          Validators.email,
        ],
        asyncValidators: [
          emailExistenteValidator(emailService)
        ],
        width: 'full'
      },
      {
        label: 'Senha',
        formControlName: 'senha',
        type: 'password',
        required: true,
        errorMessages: {
          required: 'Senha é obrigatória',
          minlength: 'Senha deve ter, pelo menos, seis caracteres'
        },
        validators: [
          Validators.required,
          Validators.minLength(6)
        ],
        width: 'half'
      },
      {
        label: 'Confirma senha',
        formControlName: 'confirmaSenha',
        type: 'password',
        required: true,
        errorMessages: {
          required: 'Confirmação de senha é obrigatória'
        },
        validators: [
          Validators.required
        ],
        width: 'half'
      }
    ]
  };
}