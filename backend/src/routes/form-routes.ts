import type { FastifyInstance } from 'fastify';

import { createFormsController, type FormsControllerDependencies } from '../controllers/forms-controller';

export async function registerFormRoutes(app: FastifyInstance, dependencies: FormsControllerDependencies) {
  const controller = createFormsController(dependencies);

  app.get('/api/forms/:formId/years/:year/config', controller.getFormConfig);

  app.post(
    '/api/forms/generic-configurable-form/years/2026/steps/application-questions/submissions',
    controller.submitConcreteApplicationQuestions,
  );

  app.post('/api/forms/:formId/years/:year/submissions', controller.submitForm);

  app.post('/api/forms/:formId/years/:year/steps/:stepId/submissions', controller.submitStep);
}
