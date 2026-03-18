import { ConfigurableFormSchema } from '../models/form-schema';

export const GENERIC_FORM_SCHEMA: ConfigurableFormSchema = {
  schemaVersion: '2026-03-18',
  formId: 'generic-configurable-form',
  name: 'Generic Configurable Form',
  activeYears: [2025, 2026, 2027],
  context: {
    applicationYear: 2026,
    programCode: 'GENERIC',
    applicantType: 'individual',
  },
  backendComputations: [
    {
      key: 'lookupResult',
      description: 'Generic backend lookup that can return derived values used by step or question rules.',
      endpoint: '/api/forms/:formId/lookup-result',
      method: 'POST',
      requestTemplate: {
        includeAnswers: ['textValue', 'numericValue', 'selectedOption'],
        includeContext: ['applicationYear'],
      },
    },
  ],
  steps: [
    {
      id: 'basic-data',
      title: 'Basic data',
      description: 'Questions in this step show the expected answer type for each field.',
      route: 'basic-data',
      applicableYears: [2025, 2026, 2027],
      questions: [
        {
          id: 'applicationYear',
          type: 'radio',
          dataType: 'string',
          label: 'Application year',
          helpText: 'Single selected value represented as a string.',
          defaultValue: '2026',
          options: [
            { label: '2025', value: '2025' },
            { label: '2026', value: '2026' },
            { label: '2027', value: '2027' },
          ],
          validations: [
            {
              type: 'required',
              message: 'A year is required.',
            },
          ],
        },
        {
          id: 'textValue',
          type: 'text',
          dataType: 'string',
          label: 'Text value',
          helpText: 'Free-form text stored as a string.',
          placeholder: 'Enter any string value',
          validations: [
            {
              type: 'required',
              message: 'A text value is required.',
            },
          ],
        },
        {
          id: 'numericValue',
          type: 'number',
          dataType: 'number',
          label: 'Numeric value',
          helpText: 'Whole or decimal number stored as a number.',
          validations: [
            {
              type: 'min',
              value: 0,
              message: 'Numeric value must be zero or greater.',
            },
          ],
        },
        {
          id: 'dateValue',
          type: 'date',
          dataType: 'date',
          label: 'Date value',
          helpText: 'Calendar date stored as a date string or normalized backend date format.',
        },
        {
          id: 'booleanValue',
          type: 'yesNo',
          dataType: 'boolean',
          label: 'Boolean value',
          helpText: 'Yes or no answer stored as true or false.',
          validations: [
            {
              type: 'required',
              message: 'A yes or no answer is required.',
            },
          ],
        },
      ],
    },
    {
      id: 'selection-data',
      title: 'Selection data',
      description: 'Examples of questions whose answer comes from predefined options.',
      route: 'selection-data',
      questions: [
        {
          id: 'selectedOption',
          type: 'select',
          dataType: 'string',
          label: 'Single select value',
          helpText: 'One selected option stored as a string.',
          options: [
            { label: 'Option A', value: 'option-a' },
            { label: 'Option B', value: 'option-b' },
            { label: 'Option C', value: 'option-c' },
          ],
        },
        {
          id: 'selectedRadio',
          type: 'radio',
          dataType: 'string',
          label: 'Radio value',
          helpText: 'One selected option stored as a string.',
          options: [
            { label: 'Choice 1', value: 'choice-1' },
            { label: 'Choice 2', value: 'choice-2' },
          ],
        },
        {
          id: 'selectedFlags',
          type: 'multiCheckbox',
          dataType: 'stringArray',
          label: 'Multiple checkbox values',
          helpText: 'Multiple selected options stored as an array of strings.',
          options: [
            { label: 'Flag A', value: 'flag-a' },
            { label: 'Flag B', value: 'flag-b' },
            { label: 'Flag C', value: 'flag-c' },
          ],
        },
        {
          id: 'consentAccepted',
          type: 'checkbox',
          dataType: 'boolean',
          label: 'Consent checkbox',
          helpText: 'Single checkbox stored as true or false.',
        },
      ],
    },
    {
      id: 'conditional-data',
      title: 'Conditional data',
      description: 'Generic examples of answer-based and backend-based dependencies.',
      route: 'conditional-data',
      questions: [
        {
          id: 'detailsText',
          type: 'textarea',
          dataType: 'string',
          label: 'Details text',
          helpText: 'Long-form text stored as a string.',
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'booleanValue',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          ],
        },
        {
          id: 'derivedStatus',
          type: 'radio',
          dataType: 'string',
          label: 'Derived backend status',
          helpText: 'Visible only when a backend result exists.',
          options: [
            { label: 'Pass', value: 'pass' },
            { label: 'Review', value: 'review' },
            { label: 'Fail', value: 'fail' },
          ],
          backendDependencies: [
            {
              key: 'lookupResult',
              description: 'Requires a backend lookup result before this question is shown.',
              resultPath: 'status',
              required: true,
            },
          ],
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'backend',
                  backendKey: 'lookupResult.status',
                  operator: 'exists',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

