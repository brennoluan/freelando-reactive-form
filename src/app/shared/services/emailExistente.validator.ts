import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmailValidatorService } from './email-validator.service';

export function emailExistenteValidator(emailService: EmailValidatorService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if(!control.value) {
            return of(null);
        }

        return emailService.verificarEmailExistente(control.value).pipe(map(existe => existe ? { emailExistente: true } : null));
    }
}