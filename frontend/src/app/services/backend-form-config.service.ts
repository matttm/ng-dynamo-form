import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigurableFormSchema } from '../models/form-schema';

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
  private readonly apiBaseUrl = 'http://localhost:3001';

  getFormConfig(formId: string, year: number): Observable<FormConfigApiResponse> {
    return this.http.get<FormConfigApiResponse>(`${this.apiBaseUrl}/api/forms/${formId}/years/${year}/config`);
  }
}

