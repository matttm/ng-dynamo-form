import cors from '@fastify/cors';
import Fastify from 'fastify';

import { getAppConfig } from './config';
import {
  ApplicationQuestionSubmissionRepository,
  type ApplicationQuestionsSubmissionPayload,
} from './services/application-question-submission-repository';
import { FormConfigRepository } from './services/form-config-repository';
import { createMysqlPool } from './services/mysql-client';

async function buildServer() {
  const config = getAppConfig();
  const repository = new FormConfigRepository({
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

  app.post<{
    Body: {
      formId?: unknown;
      year?: unknown;
      stepId?: unknown;
      payload?: unknown;
    };
  }>('/api/forms/generic-configurable-form/years/2026/steps/application-questions/submissions', async (request, reply) => {
    const payload = parseApplicationQuestionsPayload(request.body?.payload);

    if (!payload.email) {
      return reply.code(400).send({
        message: 'The 2026 application step submission requires payload.email.',
      });
    }

    await applicationQuestionSubmissionRepository.save({
      formId: 'generic-configurable-form',
      year: 2026,
      stepId: 'application-questions',
      payload,
    });

    return reply.code(202).send({
      message: 'Application question step payload saved.',
      formId: 'generic-configurable-form',
      year: 2026,
      stepId: 'application-questions',
      payload,
      receivedAt: new Date().toISOString(),
    });
  });

  app.post<{
    Params: {
      formId: string;
      year: string;
    };
    Body: {
      payload?: unknown;
    };
  }>('/api/forms/:formId/years/:year/submissions', async (request, reply) => {
    const year = Number(request.params.year);

    if (!Number.isInteger(year)) {
      return reply.code(400).send({
        message: 'The year parameter must be an integer.',
      });
    }

    return reply.code(202).send({
      message: 'Submission payload received.',
      formId: request.params.formId,
      year,
      payload: request.body?.payload ?? null,
      receivedAt: new Date().toISOString(),
    });
  });

  app.post<{
    Params: {
      formId: string;
      year: string;
      stepId: string;
    };
    Body: {
      payload?: unknown;
    };
  }>('/api/forms/:formId/years/:year/steps/:stepId/submissions', async (request, reply) => {
    const year = Number(request.params.year);

    if (!Number.isInteger(year)) {
      return reply.code(400).send({
        message: 'The year parameter must be an integer.',
      });
    }

    return reply.code(202).send({
      message: 'Step submission payload received.',
      formId: request.params.formId,
      year,
      stepId: request.params.stepId,
      payload: request.body?.payload ?? null,
      receivedAt: new Date().toISOString(),
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

function parseApplicationQuestionsPayload(input: unknown): ApplicationQuestionsSubmissionPayload {
  const payload = isRecord(input) ? input : {};

  return {
    fullName: readNullableString(payload.fullName),
    email: readRequiredTrimmedString(payload.email),
    state: readNullableString(payload.state),
    citizenshipStatus: readNullableString(payload.citizenshipStatus),
    educationStatus: readNullableString(payload.educationStatus),
    schoolName: readNullableString(payload.schoolName),
    major: readNullableString(payload.major),
    goals: readNullableString(payload.goals),
    whyApply: readNullableString(payload.whyApply),
    previousParticipation: readNullableString(payload.previousParticipation),
    referralSource: readNullableString(payload.referralSource),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNullableString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function readRequiredTrimmedString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}
