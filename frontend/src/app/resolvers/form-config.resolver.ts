import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { FormConfigApiResponse, BackendFormConfigService } from '../services/backend-form-config.service';

export interface ResolvedFormConfig {
  formId: string;
  year: number;
  response: FormConfigApiResponse | null;
  errorMessage: string;
}

export const formConfigResolver: ResolveFn<ResolvedFormConfig> = (route) => {
  const backendFormConfigService = inject(BackendFormConfigService);

  const formId = route.paramMap.get('formId') ?? '';
  const year = Number(route.paramMap.get('year') ?? '0');

  if (!formId || !Number.isInteger(year)) {
    return of({
      formId,
      year,
      response: null,
      errorMessage: 'The selected route does not include a valid form id and year.',
    });
  }

  return backendFormConfigService.getFormConfig(formId, year).pipe(
    map((response) => ({
      formId,
      year,
      response,
      errorMessage: '',
    })),
    catchError((error: { status?: number }) =>
      of({
        formId,
        year,
        response: null,
        errorMessage:
          error.status === 404
            ? `No configuration was returned for ${formId} in ${year}.`
            : 'The backend configuration could not be loaded.',
      }),
    ),
  );
};

