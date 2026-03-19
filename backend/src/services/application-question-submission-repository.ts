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

export interface ContactPreferencesSubmissionPayload {
  applicationEmail: string;
  preferredContactMethod: string | null;
  bestContactTime: string | null;
  smsOptIn: boolean | null;
  contactNotes: string | null;
}

export interface SupplementalBackgroundSubmissionPayload {
  applicationEmail: string;
  graduationYear: number | null;
  portfolioUrl: string | null;
  needsAccessibilityAccommodation: boolean | null;
  accessibilityDetails: string | null;
}

export interface SaveApplicationQuestionsSubmissionInput {
  formId: string;
  year: number;
  stepId: string;
  payload: ApplicationQuestionsSubmissionPayload;
}

export interface SaveContactPreferencesSubmissionInput {
  formId: string;
  year: number;
  stepId: string;
  payload: ContactPreferencesSubmissionPayload;
}

export interface SaveSupplementalBackgroundSubmissionInput {
  formId: string;
  year: number;
  stepId: string;
  payload: SupplementalBackgroundSubmissionPayload;
}

export class ApplicationQuestionSubmissionRepository {
  constructor(private readonly pool: Pool) {}

  async saveApplicationQuestions(input: SaveApplicationQuestionsSubmissionInput): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO application_question_submissions (
          form_id,
          program_year,
          step_id,
          primary_email,
          applicant_full_name,
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
        input.payload.email,
        input.payload.fullName,
        input.payload.state,
        input.payload.citizenshipStatus,
        input.payload.educationStatus,
        input.payload.schoolName,
        input.payload.major,
        input.payload.goals,
        input.payload.whyApply,
        input.payload.previousParticipation,
        input.payload.referralSource,
        JSON.stringify(input.payload),
      ],
    );

    return result.insertId;
  }

  async saveContactPreferences(input: SaveContactPreferencesSubmissionInput): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO application_question_submissions (
          form_id,
          program_year,
          step_id,
          primary_email,
          preferred_contact_method,
          best_contact_time,
          sms_opt_in,
          contact_notes,
          submitted_payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          step_id = VALUES(step_id),
          preferred_contact_method = VALUES(preferred_contact_method),
          best_contact_time = VALUES(best_contact_time),
          sms_opt_in = VALUES(sms_opt_in),
          contact_notes = VALUES(contact_notes),
          submitted_payload_json = VALUES(submitted_payload_json),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        input.formId,
        input.year,
        input.stepId,
        input.payload.applicationEmail,
        input.payload.preferredContactMethod,
        input.payload.bestContactTime,
        this.booleanToTinyInt(input.payload.smsOptIn),
        input.payload.contactNotes,
        JSON.stringify(input.payload),
      ],
    );

    return result.insertId;
  }

  async saveSupplementalBackground(input: SaveSupplementalBackgroundSubmissionInput): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO application_question_submissions (
          form_id,
          program_year,
          step_id,
          primary_email,
          graduation_year,
          portfolio_url,
          needs_accessibility_accommodation,
          accessibility_details,
          submitted_payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          step_id = VALUES(step_id),
          graduation_year = VALUES(graduation_year),
          portfolio_url = VALUES(portfolio_url),
          needs_accessibility_accommodation = VALUES(needs_accessibility_accommodation),
          accessibility_details = VALUES(accessibility_details),
          submitted_payload_json = VALUES(submitted_payload_json),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        input.formId,
        input.year,
        input.stepId,
        input.payload.applicationEmail,
        input.payload.graduationYear,
        input.payload.portfolioUrl,
        this.booleanToTinyInt(input.payload.needsAccessibilityAccommodation),
        input.payload.accessibilityDetails,
        JSON.stringify(input.payload),
      ],
    );

    return result.insertId;
  }

  private booleanToTinyInt(value: boolean | null): number | null {
    if (value === null) {
      return null;
    }

    return value ? 1 : 0;
  }
}
