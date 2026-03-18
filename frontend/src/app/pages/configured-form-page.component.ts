import { CommonModule } from '@angular/common';
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
import { map } from 'rxjs';

import { ConfigurableFormSchema, DependencyCondition, DependencyRule, FormQuestionSchema, SchemaOption } from '../models/form-schema';
import { FormConfigApiResponse } from '../services/backend-form-config.service';
import { ResolvedFormConfig } from '../resolvers/form-config.resolver';

type DynamicPayloadValue = string | number | boolean | string[] | null;
type FormPayload = Record<string, DynamicPayloadValue>;

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

  readonly form = new UntypedFormGroup({});

  config: ConfigurableFormSchema | null = null;
  selectedFormId = '';
  selectedYear = 0;
  errorMessage = '';
  submittedPayload: Record<string, Record<string, DynamicPayloadValue>> | null = null;

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
        this.config = null;
        this.submittedPayload = null;
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

  get liveMappedPayload(): Record<string, Record<string, DynamicPayloadValue>> {
    return this.mapFormValueToDatabasePayload(this.form.getRawValue() as FormPayload);
  }

  isQuestionVisible(question: FormQuestionSchema): boolean {
    return this.evaluateEffect(question, 'visible', true);
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submittedPayload = this.mapFormValueToDatabasePayload(this.form.getRawValue() as FormPayload);
  }

  private applyResponse(response: FormConfigApiResponse): void {
    this.config = response.config;
    this.buildForm(response.config);
  }

  private buildForm(config: ConfigurableFormSchema): void {
    for (const step of config.steps) {
      for (const question of step.questions) {
        const validators: ValidatorFn[] = [];

        if (question.validations?.some((validation) => validation.type === 'required')) {
          validators.push(Validators.required);
        }

        const initialValue = question.defaultValue ?? this.defaultValueFor(question);
        this.form.addControl(question.formControlName, new UntypedFormControl(initialValue, validators));
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

        if (shouldBeEnabled && control.disabled) {
          control.enable({ emitEvent: false });
        }

        if (!shouldBeEnabled && control.enabled) {
          control.disable({ emitEvent: false });
        }
      }
    }
  }

  private evaluateEffect(question: FormQuestionSchema, effect: 'visible' | 'enabled', fallback: boolean): boolean {
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

  private mapFormValueToDatabasePayload(value: FormPayload): Record<string, Record<string, DynamicPayloadValue>> {
    const mappedPayload: Record<string, Record<string, DynamicPayloadValue>> = {};

    if (!this.config) {
      return mappedPayload;
    }

    for (const step of this.config.steps) {
      for (const question of step.questions) {
        const questionValue = value[question.formControlName];

        if (!mappedPayload[question.databaseModel]) {
          mappedPayload[question.databaseModel] = {};
        }

        mappedPayload[question.databaseModel][question.databaseProperty] = questionValue;
      }
    }

    return mappedPayload;
  }
}
