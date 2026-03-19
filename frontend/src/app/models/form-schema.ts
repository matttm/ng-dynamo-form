export type DependencySource = 'answer' | 'context' | 'backend';
export type DependencyOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'includes'
  | 'exists';
export type DependencyEffect = 'visible' | 'enabled' | 'required';
export type QuestionType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'yesNo'
  | 'checkbox'
  | 'multiCheckbox';
export type AnswerDataType = 'string' | 'number' | 'boolean' | 'date' | 'stringArray';

export interface SchemaOption {
  label: string;
  value: string;
  description?: string;
}

export interface DependencyCondition {
  source: DependencySource;
  field?: string;
  backendKey?: string;
  contextKey?: string;
  operator: DependencyOperator;
  value?: string | number | boolean | string[];
}

export interface DependencyRule {
  effect: DependencyEffect;
  when: 'all' | 'any';
  conditions: DependencyCondition[];
}

export interface BackendDependency {
  key: string;
  description: string;
  resultPath: string;
  required?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern';
  value?: string | number;
  message: string;
}

export interface FormQuestionSchema {
  id: string;
  name: string;
  type: QuestionType;
  dataType: AnswerDataType;
  formControlName: string;
  databaseModel?: string;
  databaseProperty?: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  options?: SchemaOption[];
  validations?: ValidationRule[];
  dependencies?: DependencyRule[];
  backendDependencies?: BackendDependency[];
}

export interface FormStepSchema {
  id: string;
  title: string;
  description?: string;
  route: string;
  submissionUrl?: string;
  applicableYears?: number[];
  stepDependencies?: DependencyRule[];
  questions: FormQuestionSchema[];
}

export interface BackendComputationSchema {
  key: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  requestTemplate: {
    includeAnswers?: string[];
    includeContext?: string[];
  };
}

export interface ConfigurableFormSchema {
  schemaVersion: string;
  formId: string;
  name: string;
  activeYears: number[];
  context: {
    applicationYear: number;
    programCode: string;
    applicantType: 'individual' | 'business' | 'nonprofit';
  };
  backendComputations: BackendComputationSchema[];
  steps: FormStepSchema[];
}
