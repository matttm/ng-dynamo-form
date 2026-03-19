import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  ApplicationQuestionSubmissionRepository,
  type ApplicationQuestionsSubmissionPayload,
  type ContactPreferencesSubmissionPayload,
  type SupplementalBackgroundSubmissionPayload,
} from '../services/application-question-submission-repository';
import { FormConfigRepository } from '../services/form-config-repository';

// Shared route parameter contracts used by the form-related endpoints.
interface FormRouteParams {
  formId: string;
  year: string;
}

interface StepRouteParams extends FormRouteParams {
  stepId: string;
}

interface SubmissionBody {
  payload?: unknown;
}

interface ConcreteStepSubmissionBody {
  formId?: unknown;
  year?: unknown;
  stepId?: unknown;
  payload?: unknown;
}

export interface FormsControllerDependencies {
  formConfigRepository: FormConfigRepository;
  applicationQuestionSubmissionRepository: ApplicationQuestionSubmissionRepository;
}

export function createFormsController(dependencies: FormsControllerDependencies) {
  return {
    /**
     * Reads the schema configuration for a given form/year pair from DynamoDB.
     */
    async getFormConfig(
      request: FastifyRequest<{
        Params: FormRouteParams;
      }>,
      reply: FastifyReply,
    ) {
      const year = Number(request.params.year);

      if (!Number.isInteger(year)) {
        return reply.code(400).send({
          message: 'The year parameter must be an integer.',
        });
      }

      const record = await dependencies.formConfigRepository.getByFormIdAndYear(request.params.formId, year);

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
    },

    /**
     * Handles the concrete 2025 "contact-preferences" step and persists it to MySQL.
     */
    async submitConcreteContactPreferences(
      request: FastifyRequest<{
        Body: ConcreteStepSubmissionBody;
      }>,
      reply: FastifyReply,
    ) {
      const payload = parseContactPreferencesPayload(request.body?.payload);

      if (!payload.applicationEmail) {
        return reply.code(400).send({
          message: 'The 2025 contact preferences step requires payload.applicationEmail.',
        });
      }

      await dependencies.applicationQuestionSubmissionRepository.saveContactPreferences({
        formId: 'generic-configurable-form',
        year: 2025,
        stepId: 'contact-preferences',
        payload,
      });

      return reply.code(202).send({
        message: 'Contact preferences step payload saved.',
        formId: 'generic-configurable-form',
        year: 2025,
        stepId: 'contact-preferences',
        payload,
        receivedAt: new Date().toISOString(),
      });
    },

    /**
     * Handles the concrete 2026 "application-questions" step and persists it to MySQL.
     */
    async submitConcreteApplicationQuestions(
      request: FastifyRequest<{
        Body: ConcreteStepSubmissionBody;
      }>,
      reply: FastifyReply,
    ) {
      const payload = parseApplicationQuestionsPayload(request.body?.payload);

      if (!payload.email) {
        return reply.code(400).send({
          message: 'The 2026 application step submission requires payload.email.',
        });
      }

      await dependencies.applicationQuestionSubmissionRepository.saveApplicationQuestions({
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
    },

    /**
     * Handles the concrete 2026 "supplemental-background" step and persists it to MySQL.
     */
    async submitConcreteSupplementalBackground(
      request: FastifyRequest<{
        Body: ConcreteStepSubmissionBody;
      }>,
      reply: FastifyReply,
    ) {
      const payload = parseSupplementalBackgroundPayload(request.body?.payload);

      if (!payload.applicationEmail) {
        return reply.code(400).send({
          message: 'The 2026 supplemental background step requires payload.applicationEmail.',
        });
      }

      await dependencies.applicationQuestionSubmissionRepository.saveSupplementalBackground({
        formId: 'generic-configurable-form',
        year: 2026,
        stepId: 'supplemental-background',
        payload,
      });

      return reply.code(202).send({
        message: 'Supplemental background step payload saved.',
        formId: 'generic-configurable-form',
        year: 2026,
        stepId: 'supplemental-background',
        payload,
        receivedAt: new Date().toISOString(),
      });
    },

    /**
     * Generic form-level submission placeholder.
     * This currently acknowledges the payload without persistence.
     */
    async submitForm(
      request: FastifyRequest<{
        Params: FormRouteParams;
        Body: SubmissionBody;
      }>,
      reply: FastifyReply,
    ) {
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
    },

    /**
     * Generic step-level submission placeholder.
     * This keeps the dynamic step URL surface available even when a step does
     * not yet have a dedicated persistence implementation.
     */
    async submitStep(
      request: FastifyRequest<{
        Params: StepRouteParams;
        Body: SubmissionBody;
      }>,
      reply: FastifyReply,
    ) {
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
    },
  };
}

// Payload normalization for the concrete MySQL-backed steps.
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

function parseContactPreferencesPayload(input: unknown): ContactPreferencesSubmissionPayload {
  const payload = isRecord(input) ? input : {};

  return {
    applicationEmail: readRequiredTrimmedString(payload.applicationEmail),
    preferredContactMethod: readNullableString(payload.preferredContactMethod),
    bestContactTime: readNullableString(payload.bestContactTime),
    smsOptIn: readNullableBoolean(payload.smsOptIn),
    contactNotes: readNullableString(payload.contactNotes),
  };
}

function parseSupplementalBackgroundPayload(input: unknown): SupplementalBackgroundSubmissionPayload {
  const payload = isRecord(input) ? input : {};

  return {
    applicationEmail: readRequiredTrimmedString(payload.applicationEmail),
    graduationYear: readNullableNumber(payload.graduationYear),
    portfolioUrl: readNullableString(payload.portfolioUrl),
    needsAccessibilityAccommodation: readNullableBoolean(payload.needsAccessibilityAccommodation),
    accessibilityDetails: readNullableString(payload.accessibilityDetails),
  };
}

// Small parsing helpers keep the route handlers focused on endpoint behavior.
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

function readNullableBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  return null;
}

function readNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}
