import { Routes } from '@angular/router';

import { ConfiguredFormPageComponent } from './pages/configured-form-page.component';
import { formConfigResolver } from './resolvers/form-config.resolver';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'forms/generic-configurable-form/years/2026',
  },
  {
    path: 'forms/:formId/years/:year',
    component: ConfiguredFormPageComponent,
    runGuardsAndResolvers: 'paramsChange',
    resolve: {
      resolvedConfig: formConfigResolver,
    },
  },
];
