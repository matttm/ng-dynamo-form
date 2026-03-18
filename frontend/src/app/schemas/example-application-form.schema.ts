import { ConfigurableFormSchema } from '../models/form-schema';

export const EXAMPLE_APPLICATION_FORM_SCHEMA: ConfigurableFormSchema = {
  schemaVersion: '2026-03-18',
  formId: 'grant-application',
  name: 'Grant Application Workflow',
  activeYears: [2025, 2026, 2027],
  context: {
    applicationYear: 2026,
    programCode: 'COMMUNITY-GRANT',
    applicantType: 'business',
  },
  backendComputations: [
    {
      key: 'eligibilityCheck',
      description: 'Returns whether the applicant is eligible for the selected application year.',
      endpoint: '/api/forms/grant-application/eligibility',
      method: 'POST',
      requestTemplate: {
        includeAnswers: ['businessStartDate', 'operatesInState', 'requestedAmount'],
        includeContext: ['applicationYear', 'programCode', 'applicantType'],
      },
    },
    {
      key: 'deadlineWindow',
      description: 'Returns whether the current submission date is still within the filing window.',
      endpoint: '/api/forms/grant-application/deadline-window',
      method: 'GET',
      requestTemplate: {
        includeContext: ['applicationYear', 'programCode'],
      },
    },
  ],
  steps: [
    {
      id: 'application-overview',
      title: 'Application overview',
      description: 'Collects the answers that establish basic eligibility and the correct form path.',
      route: 'overview',
      applicableYears: [2025, 2026, 2027],
      questions: [
        {
          id: 'applicationYear',
          name: 'applicationYear',
          type: 'radio',
          dataType: 'string',
          formControlName: 'applicationYear',
          databaseModel: 'application',
          databaseProperty: 'year',
          label: 'Which application year are you filing for?',
          helpText: 'This can be prefilled from context but is still modeled as a question when year selection is user-facing.',
          defaultValue: '2026',
          options: [
            { label: '2025', value: '2025' },
            { label: '2026', value: '2026' },
            { label: '2027', value: '2027' },
          ],
          validations: [
            {
              type: 'required',
              message: 'Select an application year.',
            },
          ],
        },
        {
          id: 'operatesInState',
          name: 'operatesInState',
          type: 'yesNo',
          dataType: 'boolean',
          formControlName: 'operatesInState',
          databaseModel: 'application',
          databaseProperty: 'operatesInState',
          label: 'Does the applicant operate in New York State?',
          helpText: 'This answer drives both visibility rules and backend eligibility checks.',
          validations: [
            {
              type: 'required',
              message: 'Choose yes or no.',
            },
          ],
        },
        {
          id: 'projectCategories',
          name: 'projectCategories',
          type: 'multiCheckbox',
          dataType: 'stringArray',
          formControlName: 'projectCategories',
          databaseModel: 'application',
          databaseProperty: 'projectCategories',
          label: 'Which project categories apply?',
          helpText: 'Multi-select values are useful when later rules depend on one or more categories.',
          options: [
            { label: 'Infrastructure', value: 'infrastructure' },
            { label: 'Training', value: 'training' },
            { label: 'Technology', value: 'technology' },
            { label: 'Research', value: 'research' },
          ],
        },
      ],
    },
    {
      id: 'business-profile',
      title: 'Business profile',
      description: 'Only relevant when the applicant is a business and is filing in years where this step exists.',
      route: 'business-profile',
      applicableYears: [2026, 2027],
      stepDependencies: [
        {
          effect: 'visible',
          when: 'all',
          conditions: [
            {
              source: 'context',
              contextKey: 'applicantType',
              operator: 'equals',
              value: 'business',
            },
            {
              source: 'answer',
              field: 'operatesInState',
              operator: 'equals',
              value: true,
            },
          ],
        },
      ],
      questions: [
        {
          id: 'businessStartDate',
          name: 'businessStartDate',
          type: 'date',
          dataType: 'date',
          formControlName: 'businessStartDate',
          databaseModel: 'businessProfile',
          databaseProperty: 'startDate',
          label: 'When did the business begin operating?',
          validations: [
            {
              type: 'required',
              message: 'Enter the business start date.',
            },
          ],
        },
        {
          id: 'employeeCount',
          name: 'employeeCount',
          type: 'number',
          dataType: 'number',
          formControlName: 'employeeCount',
          databaseModel: 'businessProfile',
          databaseProperty: 'employeeCount',
          label: 'How many full-time employees does the business have?',
          validations: [
            {
              type: 'min',
              value: 0,
              message: 'Employee count cannot be negative.',
            },
          ],
        },
        {
          id: 'hasPreviousGrant',
          name: 'hasPreviousGrant',
          type: 'yesNo',
          dataType: 'boolean',
          formControlName: 'hasPreviousGrant',
          databaseModel: 'businessProfile',
          databaseProperty: 'hasPreviousGrant',
          label: 'Has the applicant received this grant before?',
          validations: [
            {
              type: 'required',
              message: 'Choose yes or no.',
            },
          ],
        },
        {
          id: 'previousGrantYear',
          name: 'previousGrantYear',
          type: 'select',
          dataType: 'string',
          formControlName: 'previousGrantYear',
          databaseModel: 'businessProfile',
          databaseProperty: 'previousGrantYear',
          label: 'What year was the previous grant awarded?',
          helpText: 'This question is visible only when the applicant answered yes to the previous question.',
          options: [
            { label: '2023', value: '2023' },
            { label: '2024', value: '2024' },
            { label: '2025', value: '2025' },
          ],
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'hasPreviousGrant',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
            {
              effect: 'required',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'hasPreviousGrant',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'funding-request',
      title: 'Funding request',
      description: 'Demonstrates direct answer dependencies and backend-derived dependencies together.',
      route: 'funding-request',
      questions: [
        {
          id: 'requestedAmount',
          name: 'requestedAmount',
          type: 'number',
          dataType: 'number',
          formControlName: 'requestedAmount',
          databaseModel: 'fundingRequest',
          databaseProperty: 'requestedAmount',
          label: 'How much funding is being requested?',
          validations: [
            {
              type: 'required',
              message: 'Enter the requested amount.',
            },
            {
              type: 'min',
              value: 1000,
              message: 'Requested amount must be at least 1,000.',
            },
          ],
        },
        {
          id: 'requiresMatchingFunds',
          name: 'requiresMatchingFunds',
          type: 'yesNo',
          dataType: 'boolean',
          formControlName: 'requiresMatchingFunds',
          databaseModel: 'fundingRequest',
          databaseProperty: 'requiresMatchingFunds',
          label: 'Does this request require matching funds?',
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'requestedAmount',
                  operator: 'greaterThanOrEqual',
                  value: 50000,
                },
              ],
            },
          ],
        },
        {
          id: 'matchingFundSources',
          name: 'matchingFundSources',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'matchingFundSources',
          databaseModel: 'fundingRequest',
          databaseProperty: 'matchingFundSources',
          label: 'Describe the matching fund sources.',
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'requiresMatchingFunds',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
            {
              effect: 'required',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'requiresMatchingFunds',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          ],
        },
        {
          id: 'eligibilityStatus',
          name: 'eligibilityStatus',
          type: 'radio',
          dataType: 'string',
          formControlName: 'eligibilityStatus',
          databaseModel: 'fundingRequest',
          databaseProperty: 'eligibilityStatus',
          label: 'Eligibility status',
          helpText: 'This question is displayed only after the backend eligibility result exists.',
          options: [
            { label: 'Eligible', value: 'eligible' },
            { label: 'Needs manual review', value: 'manual-review' },
            { label: 'Ineligible', value: 'ineligible' },
          ],
          backendDependencies: [
            {
              key: 'eligibilityCheck',
              description: 'Requires eligibility result from the backend before showing this question.',
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
                  backendKey: 'eligibilityCheck.status',
                  operator: 'exists',
                },
              ],
            },
            {
              effect: 'enabled',
              when: 'all',
              conditions: [
                {
                  source: 'backend',
                  backendKey: 'eligibilityCheck.status',
                  operator: 'notEquals',
                  value: 'ineligible',
                },
              ],
            },
          ],
        },
        {
          id: 'manualReviewNotes',
          name: 'manualReviewNotes',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'manualReviewNotes',
          databaseModel: 'fundingRequest',
          databaseProperty: 'manualReviewNotes',
          label: 'Explain why manual review is needed.',
          dependencies: [
            {
              effect: 'visible',
              when: 'any',
              conditions: [
                {
                  source: 'answer',
                  field: 'eligibilityStatus',
                  operator: 'equals',
                  value: 'manual-review',
                },
                {
                  source: 'backend',
                  backendKey: 'eligibilityCheck.flags',
                  operator: 'includes',
                  value: ['missing-tax-records'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'certifications',
      title: 'Certifications',
      description: 'Shows a step that depends on a backend deadline result and answer-driven declarations.',
      route: 'certifications',
      stepDependencies: [
        {
          effect: 'visible',
          when: 'all',
          conditions: [
            {
              source: 'backend',
              backendKey: 'deadlineWindow.isOpen',
              operator: 'equals',
              value: true,
            },
          ],
        },
      ],
      questions: [
        {
          id: 'certifyAccuracy',
          name: 'certifyAccuracy',
          type: 'checkbox',
          dataType: 'boolean',
          formControlName: 'certifyAccuracy',
          databaseModel: 'certifications',
          databaseProperty: 'certifyAccuracy',
          label: 'I certify that the information in this application is accurate.',
          validations: [
            {
              type: 'required',
              message: 'You must certify the application before submitting.',
            },
          ],
        },
        {
          id: 'acceptTerms',
          name: 'acceptTerms',
          type: 'checkbox',
          dataType: 'boolean',
          formControlName: 'acceptTerms',
          databaseModel: 'certifications',
          databaseProperty: 'acceptTerms',
          label: 'I accept the filing terms for the selected application year.',
          dependencies: [
            {
              effect: 'required',
              when: 'all',
              conditions: [
                {
                  source: 'context',
                  contextKey: 'applicationYear',
                  operator: 'greaterThanOrEqual',
                  value: 2026,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
