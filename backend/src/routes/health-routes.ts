import type { FastifyInstance } from 'fastify';

import { getHealth } from '../controllers/health-controller';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', getHealth);
}
