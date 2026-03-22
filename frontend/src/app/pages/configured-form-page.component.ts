import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { catchError, map, of } from 'rxjs';

import {
  ConfigurableFormSchema,
  DependencyCondition,
  DependencyRule,
  FormQuestionSchema,
  FormStepSchema,
  SchemaOption,
  ValidationRule,
} from '../models/form-schema';
import { BACKEND_API_BASE_URL, FormConfigApiResponse } from '../services/backend-form-config.service';
import { ResolvedFormConfig } from '../resolvers/form-config.resolver';

type DynamicPayloadValue = string | number | boolean | string[] | null;
type FormPayload = Record<string, DynamicPayloadValue>;
type StepPayload = Record<string, DynamicPayloadValue>;

@Component({
  selector: 'app-configured-form-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configured-form-page.component.html',
  styleUrl: './configured-form-page.component.scss',
})
export class ConfiguredFormPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  readonly form = new UntypedFormGroup({});

  config: ConfigurableFormSchema | null = null;
  selectedFormId = '';
  selectedYear = 0;
  activeStepId: string | null = null;
  submittingStepId: string | null = null;
  errorMessage = '';
  latestSubmissionMessage = '';
  latestSubmittedStepId: string | null = null;
  submittedStepPayloads: Record<string, StepPayload> = {};

  constructor() {
    this.route.data
      .pipe(
        map((data) => data['resolvedConfig'] as ResolvedFormConfig),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resolvedConfig) => {
        this.selectedFormId = resolvedConfig.formId;
        this.selectedYear = resolvedConfig.year;
        this.errorMessage = resolvedConfig.errorMessage;
        this.activeStepId = null;
        this.latestSubmissionMessage = '';
        this.submittingStepId = null;
        this.latestSubmittedStepId = null;
        this.config = null;
        this.submittedStepPayloads = {};
        this.resetForm();

        if (!resolvedConfig.response) {
          return;
        }

        this.applyResponse(resolvedConfig.response);
      });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncControlStates();
    });
  }

  get liveStepPayloads(): Record<string, { submissionUrl: string | null; payload: StepPayload }> {
    const livePayloads: Record<string, { submissionUrl: string | null; payload: StepPayload }> = {};

    if (!this.config) {
      return livePayloads;
    }

    for (const step of this.config.steps) {
      livePayloads[step.id] = {
        submissionUrl: this.resolveSubmissionUrl(step.submissionUrl),
        payload: this.buildStepPayload(step),
      };
    }

    return livePayloads;
  }

  isQuestionVisible(question: FormQuestionSchema): boolean {
    const passesVisibleRules = this.evaluateEffect(question, 'visible', true);
    const matchesHiddenRules = this.evaluateEffect(question, 'hidden', false);

    return passesVisibleRules && !matchesHiddenRules;
  }

  toggleMultiCheckbox(question: FormQuestionSchema, option: SchemaOption, checked: boolean): void {
    const control = this.form.get(question.formControlName);
    const currentValue = Array.isArray(control?.value) ? [...control.value] : [];

    if (checked && !currentValue.includes(option.value)) {
      currentValue.push(option.value);
    }

    if (!checked) {
      const optionIndex = currentValue.indexOf(option.value);

      if (optionIndex >= 0) {
        currentValue.splice(optionIndex, 1);
      }
    }

    control?.setValue(currentValue);
  }

  isMultiCheckboxSelected(question: FormQuestionSchema, option: SchemaOption): boolean {
    const currentValue = this.form.get(question.formControlName)?.value;
    return Array.isArray(currentValue) && currentValue.includes(option.value);
  }

  get activeStep(): FormStepSchema | null {
    if (!this.config) {
      return null;
    }

    return this.config.steps.find((step) => step.id === this.activeStepId) ?? this.config.steps[0] ?? null;
  }

  setActiveStep(stepId: string): void {
    this.activeStepId = stepId;
  }

  isStepActive(step: FormStepSchema): boolean {
    return this.activeStep?.id === step.id;
  }

  getStepStatus(step: FormStepSchema): 'complete' | 'attention' | 'idle' {
    if (this.latestSubmittedStepId === step.id) {
      return 'complete';
    }

    const hasInvalidTouchedControl = step.questions.some((question) => {
      const control = this.form.get(question.formControlName);

      if (!control || control.disabled || !this.isQuestionVisible(question)) {
        return false;
      }

      return control.invalid && (control.touched || control.dirty);
    });

    if (hasInvalidTouchedControl) {
      return 'attention';
    }

    return 'idle';
  }

  getStepStatusSymbol(step: FormStepSchema): string {
    switch (this.getStepStatus(step)) {
      case 'complete':
        return '✓';
      case 'attention':
        return '×';
      default:
        return '•';
    }
  }

  getStepStatusLabel(step: FormStepSchema): string {
    switch (this.getStepStatus(step)) {
      case 'complete':
        return 'Complete';
      case 'attention':
        return 'Needs attention';
      default:
        return 'Not started';
    }
  }

  shouldShowValidationMessage(question: FormQuestionSchema): boolean {
    const control = this.form.get(question.formControlName);
    return Boolean(control && control.invalid && (control.touched || control.dirty));
  }

  getValidationMessage(question: FormQuestionSchema): string | null {
    const control = this.form.get(question.formControlName);

    if (!control?.errors) {
      return null;
    }

    for (const validation of question.validations ?? []) {
      if (this.controlHasErrorForValidation(control.errors, validation)) {
        return validation.message;
      }
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['requiredTrue']) {
      return 'This field must be accepted.';
    }

    if (control.errors['email']) {
      return 'Enter a valid email address.';
    }

    return 'Enter a valid value.';
  }

  isQuestionRequired(question: FormQuestionSchema): boolean {
    const explicitRequired = question.validations?.some(
      (validation) => validation.type === 'required' || validation.type === 'requiredTrue',
    );

    return explicitRequired || this.evaluateEffect(question, 'required', false);
  }

  onStepSubmit(step: FormStepSchema): void {
    if (!this.isStepValid(step)) {
      return;
    }

    const stepPayload = this.buildStepPayload(step);
    const submissionUrl = this.resolveSubmissionUrl(step.submissionUrl);

    this.submittedStepPayloads[step.id] = stepPayload;
    this.latestSubmittedStepId = step.id;

    console.log('Dynamic step submission preview', {
      formId: this.selectedFormId,
      year: this.selectedYear,
      stepId: step.id,
      submissionUrl: submissionUrl ?? null,
      payload: stepPayload,
    });

    if (!submissionUrl) {
      this.latestSubmissionMessage =
        `No submission URL is configured for step ${step.id}. The step payload was printed to the console.`;
      return;
    }

    this.submittingStepId = step.id;
    this.latestSubmissionMessage = `Posting step payload to ${submissionUrl} ...`;

    this.http
      .post(submissionUrl, {
        formId: this.selectedFormId,
        year: this.selectedYear,
        stepId: step.id,
        payload: stepPayload,
      })
      .pipe(
        catchError(() => {
          this.submittingStepId = null;
          this.latestSubmissionMessage =
            `Submission failed for step ${step.id} at ${submissionUrl}. The step payload was still printed to the console.`;
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        this.submittingStepId = null;
        this.latestSubmissionMessage = `Submission request completed for step ${step.id}.`;
        console.log('Dynamic step submission response', response);
      });
  }

  private applyResponse(response: FormConfigApiResponse): void {
    this.config = response.config;
    this.activeStepId = response.config.steps[0]?.id ?? null;
    this.buildForm(response.config);
  }

  private buildForm(config: ConfigurableFormSchema): void {
    for (const step of config.steps) {
      for (const question of step.questions) {
        const initialValue = question.defaultValue ?? this.defaultValueFor(question);
        this.form.addControl(question.formControlName, new UntypedFormControl(initialValue, this.buildValidators(question)));
      }
    }

    this.syncControlStates();
  }

  private defaultValueFor(question: FormQuestionSchema): DynamicPayloadValue {
    switch (question.type) {
      case 'yesNo':
        return null;
      case 'checkbox':
        return false;
      case 'multiCheckbox':
        return [];
      case 'number':
        return null;
      default:
        return '';
    }
  }

  private resetForm(): void {
    for (const controlName of Object.keys(this.form.controls)) {
      this.form.removeControl(controlName);
    }
  }

  private syncControlStates(): void {
    if (!this.config) {
      return;
    }

    for (const step of this.config.steps) {
      for (const question of step.questions) {
        const control = this.form.get(question.formControlName);
        const shouldBeEnabled = this.evaluateEffect(question, 'enabled', true) && this.isQuestionVisible(question);

        if (!control) {
          continue;
        }

        control.setValidators(this.buildValidators(question));
        control.updateValueAndValidity({ emitEvent: false });

        if (shouldBeEnabled && control.disabled) {
          control.enable({ emitEvent: false });
        }

        if (!shouldBeEnabled && control.enabled) {
          control.disable({ emitEvent: false });
        }
      }
    }
  }

  private evaluateEffect(
    question: FormQuestionSchema,
    effect: 'visible' | 'hidden' | 'enabled' | 'required',
    fallback: boolean,
  ): boolean {
    const rules = question.dependencies?.filter((dependency) => dependency.effect === effect) ?? [];

    if (rules.length === 0) {
      return fallback;
    }

    return rules.every((rule) => this.matchesRule(rule));
  }

  private matchesRule(rule: DependencyRule): boolean {
    const matches = rule.conditions.map((condition) => this.matchesCondition(condition));
    return rule.when === 'all' ? matches.every(Boolean) : matches.some(Boolean);
  }

  private matchesCondition(condition: DependencyCondition): boolean {
    let currentValue: unknown;

    if (condition.source === 'answer' && condition.field) {
      currentValue = this.form.get(condition.field)?.value;
    }

    if (condition.source === 'context' && condition.contextKey) {
      currentValue = this.config?.context?.[condition.contextKey as keyof ConfigurableFormSchema['context']];
    }

    if (condition.source === 'backend') {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return currentValue === condition.value;
      case 'notEquals':
        return currentValue !== condition.value;
      case 'greaterThan':
        return Number(currentValue) > Number(condition.value);
      case 'greaterThanOrEqual':
        return Number(currentValue) >= Number(condition.value);
      case 'lessThan':
        return Number(currentValue) < Number(condition.value);
      case 'lessThanOrEqual':
        return Number(currentValue) <= Number(condition.value);
      case 'includes':
        return Array.isArray(currentValue) && Array.isArray(condition.value)
          ? condition.value.every((item) => currentValue.includes(item))
          : Array.isArray(currentValue) && currentValue.includes(condition.value);
      case 'exists':
        return currentValue !== undefined && currentValue !== null && currentValue !== '';
      default:
        return false;
    }
  }

  private resolveSubmissionUrl(submissionUrl?: string): string | null {
    if (!submissionUrl) {
      return null;
    }

    if (/^https?:\/\//.test(submissionUrl)) {
      return submissionUrl;
    }

    return `${BACKEND_API_BASE_URL}${submissionUrl}`;
  }

  private buildStepPayload(step: FormStepSchema): StepPayload {
    const rawFormValue = this.form.getRawValue() as FormPayload;
    const stepPayload: StepPayload = {};

    for (const question of step.questions) {
      const control = this.form.get(question.formControlName);

      if (!control || control.disabled || !this.isQuestionVisible(question)) {
        continue;
      }

      stepPayload[question.name] = rawFormValue[question.formControlName] ?? null;
    }

    return stepPayload;
  }

  private isStepValid(step: FormStepSchema): boolean {
    let valid = true;

    for (const question of step.questions) {
      const control = this.form.get(question.formControlName);

      if (!control || control.disabled || !this.isQuestionVisible(question)) {
        continue;
      }

      if (control.invalid) {
        control.markAsTouched();
        valid = false;
      }
    }

    return valid;
  }

  private buildValidators(question: FormQuestionSchema): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    for (const validation of question.validations ?? []) {
      const validator = this.validatorForRule(question, validation);

      if (validator) {
        validators.push(validator);
      }
    }

    if (this.evaluateEffect(question, 'required', false)) {
      validators.push(this.requiredValidatorForQuestion(question));
    }

    return validators;
  }

  private validatorForRule(question: FormQuestionSchema, validation: ValidationRule): ValidatorFn | null {
    switch (validation.type) {
      case 'required':
        return this.requiredValidatorForQuestion(question);
      case 'requiredTrue':
        return Validators.requiredTrue;
      case 'email':
        return Validators.email;
      case 'min':
        return typeof validation.value === 'number' ? Validators.min(validation.value) : null;
      case 'max':
        return typeof validation.value === 'number' ? Validators.max(validation.value) : null;
      case 'minLength':
        return typeof validation.value === 'number' ? Validators.minLength(validation.value) : null;
      case 'maxLength':
        return typeof validation.value === 'number' ? Validators.maxLength(validation.value) : null;
      case 'pattern':
        return typeof validation.value === 'string' ? Validators.pattern(validation.value) : null;
      default:
        return null;
    }
  }

  private requiredValidatorForQuestion(question: FormQuestionSchema): ValidatorFn {
    if (question.type === 'yesNo') {
      return (control) =>
        control.value === null || control.value === undefined || control.value === '' ? { required: true } : null;
    }

    return Validators.required;
  }

  private controlHasErrorForValidation(errors: Record<string, unknown>, validation: ValidationRule): boolean {
    switch (validation.type) {
      case 'required':
        return Boolean(errors['required']);
      case 'requiredTrue':
        return Boolean(errors['requiredTrue']);
      case 'email':
        return Boolean(errors['email']);
      case 'min':
        return Boolean(errors['min']);
      case 'max':
        return Boolean(errors['max']);
      case 'minLength':
        return Boolean(errors['minlength']);
      case 'maxLength':
        return Boolean(errors['maxlength']);
      case 'pattern':
        return Boolean(errors['pattern']);
      default:
        return false;
    }
  }
}
