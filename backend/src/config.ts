export interface AppConfig {
  host: string;
  port: number;
  awsRegion: string;
  dynamoTableName: string;
  dynamoEndpoint?: string;
}

export function getAppConfig(): AppConfig {
  return {
    host: process.env.HOST ?? '0.0.0.0',
    port: Number(process.env.PORT ?? '3001'),
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    dynamoTableName: process.env.DYNAMO_TABLE_NAME ?? 'form-configurations',
    dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
  };
}

