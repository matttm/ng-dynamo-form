# ng-dynamo-form

Initial workspace for a schema-driven Angular form application backed by DynamoDB, a Fastify API, and MySQL.

## What is included

- `docker-compose.yml` for LocalStack with DynamoDB enabled, a Fastify API, and a local MySQL database
- automatic LocalStack init script that creates a `form-configurations` table
- `backend/` Fastify service that resolves a form config by `formId` and `year`
- `frontend/` Angular workspace with a single-page dynamic form shell

## Local infrastructure

Start LocalStack and MySQL:

```bash
docker compose up -d
```

If you changed Dockerfiles, backend dependencies, or Compose service definitions, use:

```bash
docker compose up --build
```

For a shorter reminder-oriented startup guide, see [LOCAL-DEV.md](/Users/Matt.Maloney/projects/play/ng-dynamo-form/LOCAL-DEV.md).

The init hook creates a table named `form-configurations` with:

- partition key: `formId` (`S`)
- sort key: `year` (`N`)

It also seeds demo items for `generic-configurable-form` for years `2025` and `2026`.

LocalStack persistence uses the `localstack-data` Docker volume, so the stack does not need to create or chown a `./.localstack` folder on the host.

MySQL is also available with:

- host: `127.0.0.1`
- port: `3306`
- database: `form_app`
- user: `form_user`
- password: `form_password`

The MySQL container persists data in the `mysql-data` Docker volume.

## Backend API

The Fastify backend exposes:

```bash
GET /api/forms/:formId/years/:year/config
POST /api/forms/:formId/years/:year/submissions
POST /api/forms/:formId/years/:year/steps/:stepId/submissions
```

Example:

```bash
curl http://localhost:3001/api/forms/generic-configurable-form/years/2026/config
```

If a resolved step includes `submissionUrl`, the frontend posts that step payload there and still prints the same step payload to the browser console. If `submissionUrl` is absent on a step, the frontend falls back to console-only preview mode for that step.

The backend uses DynamoDB through LocalStack by default when started with Docker Compose.

## Frontend

The Angular app currently renders a configurable one-page form from a mock service so we can swap in your real schema later without rewriting the UI.

Install dependencies and start the app:

```bash
cd frontend
npm install
npm start
```

## Next step

Once you provide the real configuration schema, the next pass should:

1. map that schema into the Angular field model
2. replace the mock frontend data source with the Fastify API
3. add save/update endpoints for draft and submitted form responses
4. wire the MySQL side for relational reporting or workflow data if needed
