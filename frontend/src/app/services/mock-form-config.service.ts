import { Injectable } from '@angular/core';

import { FormPageConfig } from '../models/configurable-form';

@Injectable({
  providedIn: 'root',
})
export class MockFormConfigService {
  getFormConfig(): FormPageConfig {
    return {
      formId: 'customer-intake-demo',
      title: 'Configurable Form Studio',
      subtitle:
        'This first page is driven by a field configuration object so we can plug in your Dynamo-backed schema later.',
      submitLabel: 'Save draft payload',
      sections: [
        {
          id: 'identity',
          title: 'Customer identity',
          description: 'Core profile fields that are usually reused across intake flows.',
          fields: [
            {
              key: 'companyName',
              type: 'text',
              label: 'Company name',
              placeholder: 'Northwind Trading',
              helperText: 'This can map directly to a required text field in your schema.',
              required: true,
            },
            {
              key: 'contactEmail',
              type: 'email',
              label: 'Primary contact email',
              placeholder: 'ops@northwind.example',
              helperText: 'Email validation is already wired into the renderer.',
              required: true,
            },
            {
              key: 'engagementModel',
              type: 'select',
              label: 'Engagement model',
              defaultValue: 'new',
              options: [
                { label: 'New customer', value: 'new' },
                { label: 'Expansion', value: 'expansion' },
                { label: 'Renewal', value: 'renewal' },
              ],
            },
          ],
        },
        {
          id: 'notes',
          title: 'Workflow notes',
          description: 'A wider field plus a boolean toggle demonstrates mixed control types.',
          fields: [
            {
              key: 'projectSummary',
              type: 'textarea',
              label: 'Project summary',
              placeholder: 'Describe the requested workflow, approvals, or customer constraints.',
              helperText: 'Textarea fields can be widened or grouped by section metadata later.',
            },
            {
              key: 'priorityReview',
              type: 'checkbox',
              label: 'Flag for priority review',
              helperText: 'Useful for testing conditional display logic in the next phase.',
              defaultValue: true,
            },
          ],
        },
      ],
    };
  }
}

