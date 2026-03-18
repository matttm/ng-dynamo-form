import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { FormFieldConfig, FormPageConfig } from './models/configurable-form';
import { MockFormConfigService } from './services/mock-form-config.service';

type DynamicFormPayload = Record<string, string | boolean | null>;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly formConfigService = inject(MockFormConfigService);

  readonly config: FormPageConfig = this.formConfigService.getFormConfig();
  readonly form = new UntypedFormGroup({});

  submittedPayload: DynamicFormPayload | null = null;

  constructor() {
    this.buildForm();
  }

  get previewPayload(): DynamicFormPayload {
    return this.submittedPayload ?? (this.form.getRawValue() as DynamicFormPayload);
  }

  controlFor(key: string): AbstractControl | null {
    return this.form.get(key);
  }

  isInvalid(field: FormFieldConfig): boolean {
    const control = this.controlFor(field.key);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  validationMessage(field: FormFieldConfig): string {
    const control = this.controlFor(field.key);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${field.label} is required.`;
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }

    return 'Check this field.';
  }

  trackByKey(_index: number, field: FormFieldConfig): string {
    return field.key;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submittedPayload = this.form.getRawValue() as DynamicFormPayload;
  }

  private buildForm(): void {
    for (const section of this.config.sections) {
      for (const field of section.fields) {
        const validators: ValidatorFn[] = [];

        if (field.required) {
          validators.push(Validators.required);
        }

        if (field.type === 'email') {
          validators.push(Validators.email);
        }

        const initialValue = field.defaultValue ?? (field.type === 'checkbox' ? false : '');

        this.form.addControl(field.key, new UntypedFormControl(initialValue, validators));
      }
    }
  }
}

