export type FormFieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  key: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  defaultValue?: string | boolean;
  options?: FormFieldOption[];
}

export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface FormPageConfig {
  formId: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  sections: FormSectionConfig[];
}

