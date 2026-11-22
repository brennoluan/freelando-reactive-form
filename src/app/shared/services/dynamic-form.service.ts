import { Injectable } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup } from '@angular/forms';
import { FormConfig } from '../models/form-config.interface';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private formConfigs: {[key: string]: Function} = {};

  constructor(
    private fb: FormBuilder
  ) { }

  registerFormConfig(key: string, configFn: Function) {
    this.formConfigs[key] = configFn;
  }

  getFormConfig(key: string, ...args: any[]): FormConfig {
    if(!this.formConfigs[key]) {
      throw new Error(`Form config for key "${key}" not found.`);
    }
    return this.formConfigs[key](...args);
  }

  createFormGroup(config: FormConfig, formOptions?: AbstractControlOptions): FormGroup {
    const formControls: {[key: string]: any} = {};

    config.fields.forEach(field => {
      formControls[field.formControlName] = [
        '',
        field.validators,
        field.asyncValidators
      ];
    });

    return this.fb.group(formControls, formOptions);
  }
}
