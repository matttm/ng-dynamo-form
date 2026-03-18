import Fastify from 'fastify';

import { getAppConfig } from './config';
import { FormConfigRepository } from './services/form-config-repository';

async function buildServer() {
  const config = getAppConfig();
  const repository = new FormConfigRepository({
    awsRegion: config.awsRegion,
    tableName: config.dynamoTableName,
    dynamoEndpoint: config.dynamoEndpoint,
  });

  const app = Fastify({
    logger: true,
  });

  app.get('/health', async () => ({
    status: 'ok',
  }));

  app.get<{
    Params: {
      formId: string;
      year: string;
    };
  }>('/api/forms/:formId/years/:year/config', async (request, reply) => {
    const year = Number(request.params.year);

    if (!Number.isInteger(year)) {
      return reply.code(400).send({
        message: 'The year parameter must be an integer.',
      });
    }

    const record = await repository.getByFormIdAndYear(request.params.formId, year);

    if (!record) {
      return reply.code(404).send({
        message: `No config found for formId=${request.params.formId} year=${year}.`,
      });
    }

    return reply.send({
      formId: record.formId,
      year: record.year,
      name: record.name,
      schemaVersion: record.schemaVersion,
      config: record.config,
    });
  });

  return {
    app,
    config,
  };
}

async function start() {
  const { app, config } = await buildServer();

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
