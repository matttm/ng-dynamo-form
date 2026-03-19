import cors from '@fastify/cors';
import Fastify from 'fastify';

import type { AppConfig } from './config';
import { registerHealthRoutes } from './routes/health-routes';
import { registerFormRoutes } from './routes/form-routes';
import { ApplicationQuestionSubmissionRepository } from './services/application-question-submission-repository';
import { FormConfigRepository } from './services/form-config-repository';
import { createMysqlPool } from './services/mysql-client';

export async function createApp(config: AppConfig) {
  const formConfigRepository = new FormConfigRepository({
    awsRegion: config.awsRegion,
    tableName: config.dynamoTableName,
    dynamoEndpoint: config.dynamoEndpoint,
  });
  const mysqlPool = createMysqlPool({
    host: config.mysqlHost,
    port: config.mysqlPort,
    database: config.mysqlDatabase,
    user: config.mysqlUser,
    password: config.mysqlPassword,
  });
  const applicationQuestionSubmissionRepository = new ApplicationQuestionSubmissionRepository(mysqlPool);

  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
  });

  app.addHook('onClose', async () => {
    await mysqlPool.end();
  });

  await registerHealthRoutes(app);
  await registerFormRoutes(app, {
    formConfigRepository,
    applicationQuestionSubmissionRepository,
  });

  return app;
}
