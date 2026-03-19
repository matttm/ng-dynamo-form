import type { Pool, ResultSetHeader } from 'mysql2/promise';

export interface ApplicationQuestionsSubmissionPayload {
  fullName: string | null;
  email: string;
  state: string | null;
  citizenshipStatus: string | null;
  educationStatus: string | null;
  schoolName: string | null;
  major: string | null;
  goals: string | null;
  whyApply: string | null;
  previousParticipation: string | null;
  referralSource: string | null;
}

export interface SaveApplicationQuestionsSubmissionInput {
  formId: string;
  year: number;
  stepId: string;
  payload: ApplicationQuestionsSubmissionPayload;
}

export class ApplicationQuestionSubmissionRepository {
  constructor(private readonly pool: Pool) {}

  async save(input: SaveApplicationQuestionsSubmissionInput): Promise<number> {
    const submittedPayloadJson = JSON.stringify(input.payload);

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO application_question_submissions (
          form_id,
          program_year,
          step_id,
          applicant_full_name,
          primary_email,
          state_code,
          citizenship_status,
          education_status,
          school_name,
          major_area_of_study,
          academic_or_career_goals,
          why_apply,
          previous_participation,
          referral_source,
          submitted_payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          step_id = VALUES(step_id),
          applicant_full_name = VALUES(applicant_full_name),
          state_code = VALUES(state_code),
          citizenship_status = VALUES(citizenship_status),
          education_status = VALUES(education_status),
          school_name = VALUES(school_name),
          major_area_of_study = VALUES(major_area_of_study),
          academic_or_career_goals = VALUES(academic_or_career_goals),
          why_apply = VALUES(why_apply),
          previous_participation = VALUES(previous_participation),
          referral_source = VALUES(referral_source),
          submitted_payload_json = VALUES(submitted_payload_json),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        input.formId,
        input.year,
        input.stepId,
        input.payload.fullName,
        input.payload.email,
        input.payload.state,
        input.payload.citizenshipStatus,
        input.payload.educationStatus,
        input.payload.schoolName,
        input.payload.major,
        input.payload.goals,
        input.payload.whyApply,
        input.payload.previousParticipation,
        input.payload.referralSource,
        submittedPayloadJson,
      ],
    );

    return result.insertId;
  }
}
