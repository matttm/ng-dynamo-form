import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigurableFormSchema } from '../models/form-schema';

export const BACKEND_API_BASE_URL = 'http://localhost:3001';

export interface FormConfigApiResponse {
  formId: string;
  year: number;
  name?: string;
  schemaVersion?: string;
  config: ConfigurableFormSchema;
}

@Injectable({
  providedIn: 'root',
})
export class BackendFormConfigService {
  private readonly http = inject(HttpClient);

  getFormConfig(formId: string, year: number): Observable<FormConfigApiResponse> {
    return this.http.get<FormConfigApiResponse>(`${BACKEND_API_BASE_URL}/api/forms/${formId}/years/${year}/config`);
  }
}
