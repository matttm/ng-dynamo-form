import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

export interface StoredFormConfigRecord {
  formId: string;
  year: number;
  name?: string;
  schemaVersion?: string;
  config: unknown;
}

export interface FormConfigRepositoryOptions {
  awsRegion: string;
  tableName: string;
  dynamoEndpoint?: string;
}

export class FormConfigRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(options: FormConfigRepositoryOptions) {
    this.tableName = options.tableName;

    const dynamoClient = new DynamoDBClient({
      region: options.awsRegion,
      endpoint: options.dynamoEndpoint,
      credentials: options.dynamoEndpoint
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
          }
        : undefined,
    });

    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  async getByFormIdAndYear(formId: string, year: number): Promise<StoredFormConfigRecord | null> {
    const response = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          formId,
          year,
        },
      }),
    );

    return (response.Item as StoredFormConfigRecord | undefined) ?? null;
  }
}

