import { ConfigurableFormSchema, SchemaOption, ValidationRule } from '../models/form-schema';

function mapOptions(options: string[]): SchemaOption[] {
  return options.map((option) => ({
    label: option,
    value: option,
  }));
}

function required(message: string): ValidationRule {
  return {
    type: 'required',
    message,
  };
}

function requiredTrue(message: string): ValidationRule {
  return {
    type: 'requiredTrue',
    message,
  };
}

function email(message: string): ValidationRule {
  return {
    type: 'email',
    message,
  };
}

function min(value: number, message: string): ValidationRule {
  return {
    type: 'min',
    value,
    message,
  };
}

function max(value: number, message: string): ValidationRule {
  return {
    type: 'max',
    value,
    message,
  };
}

function minLength(value: number, message: string): ValidationRule {
  return {
    type: 'minLength',
    value,
    message,
  };
}

function maxLength(value: number, message: string): ValidationRule {
  return {
    type: 'maxLength',
    value,
    message,
  };
}

function pattern(value: string, message: string): ValidationRule {
  return {
    type: 'pattern',
    value,
    message,
  };
}

export const GENERIC_FORM_SCHEMA_2025: ConfigurableFormSchema = {
  schemaVersion: 'application-2025.2',
  formId: 'generic-configurable-form',
  name: 'Program Application',
  activeYears: [2025, 2026],
  context: {
    applicationYear: 2025,
    programCode: 'APPLICATION',
    applicantType: 'individual',
  },
  backendComputations: [],
  steps: [
    {
      id: 'application-questions',
      title: '2025 Application Questions',
      description: 'Primary application intake questions for the 2025 year.',
      route: 'application',
      applicableYears: [2025],
      questions: [
        {
          id: 'fullName',
          name: 'fullName',
          type: 'text',
          dataType: 'string',
          formControlName: 'fullName',
          label: 'Full Legal Name',
          validations: [required('Full legal name is required.'), minLength(2, 'Full legal name must be at least 2 characters.')],
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          dataType: 'string',
          formControlName: 'email',
          label: 'Email Address',
          validations: [required('Email address is required.'), email('Enter a valid email address.')],
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'text',
          dataType: 'string',
          formControlName: 'phone',
          label: 'Phone Number',
          validations: [required('Phone number is required.'), pattern('^[0-9()\\-\\s+]{10,20}$', 'Enter a valid phone number.')],
        },
        {
          id: 'citizenshipStatus',
          name: 'citizenshipStatus',
          type: 'radio',
          dataType: 'string',
          formControlName: 'citizenshipStatus',
          label: 'Are you a U.S. citizen?',
          options: mapOptions(['Yes', 'No']),
          validations: [required('Select a citizenship response.')],
        },
        {
          id: 'state',
          name: 'state',
          type: 'select',
          dataType: 'string',
          formControlName: 'state',
          label: 'State of Residence',
          options: mapOptions(['NY', 'CA', 'TX', 'VA']),
          validations: [required('Select a state of residence.')],
        },
        {
          id: 'isStudent',
          name: 'isStudent',
          type: 'radio',
          dataType: 'string',
          formControlName: 'isStudent',
          label: 'Are you currently a student?',
          options: mapOptions(['Yes', 'No']),
          validations: [required('Select your student status.')],
        },
        {
          id: 'schoolName',
          name: 'schoolName',
          type: 'text',
          dataType: 'string',
          formControlName: 'schoolName',
          label: 'School Name',
          validations: [minLength(2, 'School name must be at least 2 characters.')],
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'isStudent',
                  operator: 'equals',
                  value: 'Yes',
                },
              ],
            },
            {
              effect: 'required',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'isStudent',
                  operator: 'equals',
                  value: 'Yes',
                },
              ],
            },
          ],
        },
        {
          id: 'fieldOfStudy',
          name: 'fieldOfStudy',
          type: 'text',
          dataType: 'string',
          formControlName: 'fieldOfStudy',
          label: 'Field of Study',
          validations: [required('Field of study is required.')],
        },
        {
          id: 'whyApply',
          name: 'whyApply',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'whyApply',
          label: 'Why are you applying to this program?',
          validations: [required('A response is required.'), maxLength(1000, 'Keep this answer under 1000 characters.')],
        },
        {
          id: 'heardAbout',
          name: 'heardAbout',
          type: 'multiCheckbox',
          dataType: 'stringArray',
          formControlName: 'heardAbout',
          label: 'How did you hear about this program?',
          options: mapOptions(['Friend', 'Social Media', 'School', 'Other']),
          validations: [required('Select at least one referral source.')],
        },
      ],
    },
    {
      id: 'contact-preferences',
      title: '2025 Contact Preferences',
      description: 'Follow-up preferences collected as a separate persisted step for 2025.',
      route: 'contact-preferences',
      submissionUrl: '/api/forms/generic-configurable-form/years/2025/steps/contact-preferences/submissions',
      applicableYears: [2025],
      questions: [
        {
          id: 'applicationEmail',
          name: 'applicationEmail',
          type: 'email',
          dataType: 'string',
          formControlName: 'applicationEmail',
          label: 'Application Email',
          helpText: 'Use the same email address used on the application step.',
          validations: [required('Application email is required.'), email('Enter a valid email address.')],
        },
        {
          id: 'preferredContactMethod',
          name: 'preferredContactMethod',
          type: 'select',
          dataType: 'string',
          formControlName: 'preferredContactMethod',
          label: 'Preferred Contact Method',
          options: mapOptions(['Email', 'Phone', 'Text Message']),
          validations: [required('Select a preferred contact method.')],
        },
        {
          id: 'bestContactTime',
          name: 'bestContactTime',
          type: 'radio',
          dataType: 'string',
          formControlName: 'bestContactTime',
          label: 'Best Time to Reach You',
          options: mapOptions(['Morning', 'Afternoon', 'Evening']),
          validations: [required('Select the best contact time.')],
        },
        {
          id: 'smsOptIn',
          name: 'smsOptIn',
          type: 'checkbox',
          dataType: 'boolean',
          formControlName: 'smsOptIn',
          label: 'I consent to receive text updates about my application.',
          validations: [requiredTrue('Text update consent is required for the contact preferences step.')],
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'preferredContactMethod',
                  operator: 'equals',
                  value: 'Text Message',
                },
              ],
            },
          ],
        },
        {
          id: 'contactNotes',
          name: 'contactNotes',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'contactNotes',
          label: 'Contact Notes',
          helpText: 'Optional details about the best way to reach you.',
          validations: [maxLength(500, 'Keep contact notes under 500 characters.')],
        },
      ],
    },
  ],
};

export const GENERIC_FORM_SCHEMA_2026: ConfigurableFormSchema = {
  schemaVersion: 'application-2026.2',
  formId: 'generic-configurable-form',
  name: 'Program Application',
  activeYears: [2025, 2026],
  context: {
    applicationYear: 2026,
    programCode: 'APPLICATION',
    applicantType: 'individual',
  },
  backendComputations: [],
  steps: [
    {
      id: 'application-questions',
      title: '2026 Application Questions',
      description: 'Primary application intake questions for the 2026 year.',
      route: 'application',
      submissionUrl: '/api/forms/generic-configurable-form/years/2026/steps/application-questions/submissions',
      applicableYears: [2026],
      questions: [
        {
          id: 'fullName',
          name: 'fullName',
          type: 'text',
          dataType: 'string',
          formControlName: 'fullName',
          label: 'Applicant Full Name',
          validations: [required('Applicant full name is required.'), minLength(2, 'Full name must be at least 2 characters.')],
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          dataType: 'string',
          formControlName: 'email',
          label: 'Primary Email',
          validations: [required('Primary email is required.'), email('Enter a valid email address.')],
        },
        {
          id: 'state',
          name: 'state',
          type: 'select',
          dataType: 'string',
          formControlName: 'state',
          label: 'Which state do you currently live in?',
          options: mapOptions(['NY', 'CA', 'TX', 'VA', 'WA']),
          validations: [required('Select your current state.')],
        },
        {
          id: 'citizenshipStatus',
          name: 'citizenshipStatus',
          type: 'radio',
          dataType: 'string',
          formControlName: 'citizenshipStatus',
          label: 'Citizenship Status',
          options: mapOptions(['U.S. Citizen', 'Permanent Resident', 'Other']),
          validations: [required('Select a citizenship status.')],
        },
        {
          id: 'educationStatus',
          name: 'educationStatus',
          type: 'radio',
          dataType: 'string',
          formControlName: 'educationStatus',
          label: 'What is your current education status?',
          options: mapOptions(['High School Student', 'College Student', 'Graduate', 'Not Currently Enrolled']),
          validations: [required('Select your current education status.')],
        },
        {
          id: 'schoolName',
          name: 'schoolName',
          type: 'text',
          dataType: 'string',
          formControlName: 'schoolName',
          label: 'Current or Most Recent School',
          validations: [required('School name is required.')],
        },
        {
          id: 'major',
          name: 'major',
          type: 'text',
          dataType: 'string',
          formControlName: 'major',
          label: 'Major or Area of Study',
          validations: [required('Major or area of study is required.')],
        },
        {
          id: 'goals',
          name: 'goals',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'goals',
          label: 'What are your academic or career goals?',
          validations: [required('Academic or career goals are required.'), maxLength(1000, 'Keep this answer under 1000 characters.')],
        },
        {
          id: 'whyApply',
          name: 'whyApply',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'whyApply',
          label: 'Tell us why you are interested in this program',
          validations: [required('Explain why you are interested in this program.'), maxLength(1000, 'Keep this answer under 1000 characters.')],
        },
        {
          id: 'previousParticipation',
          name: 'previousParticipation',
          type: 'radio',
          dataType: 'string',
          formControlName: 'previousParticipation',
          label: 'Have you participated in this program before?',
          options: mapOptions(['Yes', 'No']),
          validations: [required('Select whether you participated before.')],
        },
        {
          id: 'referralSource',
          name: 'referralSource',
          type: 'select',
          dataType: 'string',
          formControlName: 'referralSource',
          label: 'How did you learn about us?',
          options: mapOptions(['Friend', 'Teacher', 'Online Search', 'Social Media', 'Other']),
          validations: [required('Select a referral source.')],
        },
      ],
    },
    {
      id: 'supplemental-background',
      title: '2026 Supplemental Background',
      description: 'Additional persisted details collected as a second step in 2026.',
      route: 'supplemental-background',
      submissionUrl: '/api/forms/generic-configurable-form/years/2026/steps/supplemental-background/submissions',
      applicableYears: [2026],
      questions: [
        {
          id: 'applicationEmail',
          name: 'applicationEmail',
          type: 'email',
          dataType: 'string',
          formControlName: 'applicationEmail',
          label: 'Application Email',
          helpText: 'Use the same email address used in the first step so this record can be updated.',
          validations: [required('Application email is required.'), email('Enter a valid email address.')],
        },
        {
          id: 'graduationYear',
          name: 'graduationYear',
          type: 'number',
          dataType: 'number',
          formControlName: 'graduationYear',
          label: 'Expected Graduation Year',
          validations: [
            required('Expected graduation year is required.'),
            min(2000, 'Graduation year must be 2000 or later.'),
            max(2035, 'Graduation year must be 2035 or earlier.'),
          ],
        },
        {
          id: 'portfolioUrl',
          name: 'portfolioUrl',
          type: 'text',
          dataType: 'string',
          formControlName: 'portfolioUrl',
          label: 'Portfolio or Resume URL',
          placeholder: 'https://example.com/portfolio',
          validations: [
            pattern('^https?://.+', 'Enter a valid URL beginning with http:// or https://.'),
            maxLength(512, 'Keep the URL under 512 characters.'),
          ],
          dependencies: [
            {
              effect: 'hidden',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'previousParticipation',
                  operator: 'equals',
                  value: 'Yes',
                },
              ],
            },
          ],
        },
        {
          id: 'needsAccessibilityAccommodation',
          name: 'needsAccessibilityAccommodation',
          type: 'yesNo',
          dataType: 'boolean',
          formControlName: 'needsAccessibilityAccommodation',
          label: 'Do you need an accessibility accommodation?',
          validations: [required('Select whether you need an accessibility accommodation.')],
        },
        {
          id: 'accessibilityDetails',
          name: 'accessibilityDetails',
          type: 'textarea',
          dataType: 'string',
          formControlName: 'accessibilityDetails',
          label: 'Accessibility Details',
          helpText: 'Provide details only if you selected Yes above.',
          validations: [maxLength(1000, 'Keep accessibility details under 1000 characters.')],
          dependencies: [
            {
              effect: 'visible',
              when: 'all',
              conditions: [
                {
                  source: 'answer',
                  field: 'needsAccessibilityAccommodation',
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
                  field: 'needsAccessibilityAccommodation',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const GENERIC_FORM_SCHEMAS_BY_YEAR: Record<number, ConfigurableFormSchema> = {
  2025: GENERIC_FORM_SCHEMA_2025,
  2026: GENERIC_FORM_SCHEMA_2026,
};

export const GENERIC_FORM_SCHEMA = GENERIC_FORM_SCHEMA_2026;
