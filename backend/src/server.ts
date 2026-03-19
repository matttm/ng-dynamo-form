import { getAppConfig } from './config';
import { createApp } from './app';

async function start() {
  const config = getAppConfig();
  const app = await createApp(config);

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
