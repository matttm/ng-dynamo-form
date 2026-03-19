export interface AppConfig {
  host: string;
  port: number;
  awsRegion: string;
  dynamoTableName: string;
  dynamoEndpoint?: string;
  mysqlHost: string;
  mysqlPort: number;
  mysqlDatabase: string;
  mysqlUser: string;
  mysqlPassword: string;
}

export function getAppConfig(): AppConfig {
  return {
    host: process.env.HOST ?? '0.0.0.0',
    port: Number(process.env.PORT ?? '3001'),
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    dynamoTableName: process.env.DYNAMO_TABLE_NAME ?? 'form-configurations',
    dynamoEndpoint: process.env.DYNAMO_ENDPOINT,
    mysqlHost: process.env.MYSQL_HOST ?? '127.0.0.1',
    mysqlPort: Number(process.env.MYSQL_PORT ?? '3306'),
    mysqlDatabase: process.env.MYSQL_DATABASE ?? 'form_app',
    mysqlUser: process.env.MYSQL_USER ?? 'form_user',
    mysqlPassword: process.env.MYSQL_PASSWORD ?? 'form_password',
  };
}
